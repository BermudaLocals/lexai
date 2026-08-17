const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = process.env.VAULT_DIR || path.join(__dirname, '..', 'vault');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/msword': 'word',
  'text/plain': 'text',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const isSpellbook = file.originalname.toLowerCase().endsWith('.spellbook');
    if (ALLOWED_MIME[file.mimetype] || isSpellbook) return cb(null, true);
    cb(new Error('Unsupported file type'));
  },
});

// POST /api/vault/upload
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const isSpellbook = req.file.originalname.toLowerCase().endsWith('.spellbook');
    const type = isSpellbook ? 'spellbook' : (ALLOWED_MIME[req.file.mimetype] || 'text');

    const result = await pool.query(
      `INSERT INTO vault_files (user_id, original_name, filename, type, size, mimetype)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, original_name, type, size, created_at`,
      [req.user.id, req.file.originalname, req.file.filename, type, req.file.size, req.file.mimetype]
    );

    res.json({ success: true, file: result.rows[0] });
  } catch (err) {
    console.error('Vault upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/vault/files
router.get('/files', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, original_name, type, size, created_at FROM vault_files
       WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ files: result.rows });
  } catch (err) {
    console.error('Vault list error:', err);
    res.status(500).json({ error: 'Could not list files' });
  }
});

// GET /api/vault/download/:id
router.get('/download/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vault_files WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'File not found' });

    const file = result.rows[0];
    const filePath = path.join(UPLOAD_DIR, file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File missing on disk (did a redeploy wipe it? check the Railway Volume mount)' });
    }

    res.download(filePath, file.original_name);
  } catch (err) {
    console.error('Vault download error:', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

// DELETE /api/vault/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vault_files WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'File not found' });

    const file = result.rows[0];
    const filePath = path.join(UPLOAD_DIR, file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query(`DELETE FROM vault_files WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Vault delete error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
