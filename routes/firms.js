'use strict';
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits:{ fileSize: 50*1024*1024 } });

// Create firm — Harvey 5-seat min
router.post('/firms', requireAuth, async (req, res) => {
  try {
    const { name, seats = 5 } = req.body;
    if (!name) return res.status(400).json({error:'Firm name required'});
    if (seats < 5) return res.status(400).json({error:'Firm min 5 seats'});
    const plan = seats >= 20? 'enterprise' : 'firm';
    const r = await pool.query(
      'INSERT INTO firms (name, owner_id, seats, credits, plan, storage_gb) VALUES ($1,$2,$3,500,$4,10) RETURNING *',
      [name, req.user.id, seats, plan]
    );
    await pool.query('INSERT INTO firm_members (firm_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [r.rows[0].id, req.user.id, 'admin']);
    await pool.query('UPDATE users SET firm_id=$1 WHERE id=$2', [r.rows[0].id, req.user.id]);
    res.json(r.rows[0]);
  } catch (e) { console.error('[firms]', e.message); res.status(500).json({error:e.message}); }
});

// keep old /firms/create route too so nothing breaks
router.post('/firms/create', requireAuth, async (req, res) => {
  req.url = '/firms';
  router.handle(req, res);
});

// Business portal — list all Bermuda firms to sell to
router.get('/business-portal/leads', requireAuth, async (req, res) => {
  const r = await pool.query(`SELECT * FROM firms WHERE plan='firm' ORDER BY created_at DESC`);
  res.json(r.rows);
});

router.get('/business-portal/firms', requireAuth, async (req, res) => {
  const r = await pool.query(`SELECT f.*, u.email as owner_email FROM firms f LEFT JOIN users u ON u.id=f.owner_id ORDER BY created_at DESC`);
  res.json({ firms: r.rows });
});

router.get('/business-portal/overage', requireAuth, async (req, res) => {
  const r = await pool.query(`SELECT * FROM overage_log ORDER BY created_at DESC LIMIT 100`);
  res.json({ overage: r.rows });
});

// Vault storage billing — $99 per 10GB
router.post('/vault/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({error:'No file'});
    const fileSizeGb = req.file.size / 1e9;
    const u = await pool.query('SELECT storage_used_gb, firm_id FROM users WHERE id=$1', [req.user.id]);
    const used = parseFloat(u.rows[0]?.storage_used_gb || 0);
    const firm_id = u.rows[0]?.firm_id;
    if (used + fileSizeGb > 10 && firm_id) {
      await pool.query('INSERT INTO overage_log (firm_id, user_id, type, cost) VALUES ($1,$2,$3,99)', [firm_id, req.user.id, 'storage']);
    }
    await pool.query('UPDATE users SET storage_used_gb = COALESCE(storage_used_gb,0)+$1 WHERE id=$2', [fileSizeGb, req.user.id]);
    res.json({ ok:true, size_gb:fileSizeGb, billed: used + fileSizeGb > 10 });
  } catch (e) { console.error('[vault]', e.message); res.status(500).json({error:e.message}); }
});

module.exports = router;
