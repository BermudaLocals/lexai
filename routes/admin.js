// LexAI Admin Routes — God Mode
// Owner/Admin only
'use strict';

const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

// ── OWNER/ADMIN MIDDLEWARE ────────────────────────
async function requireAdmin(req, res, next) {
  if (!req.session?.userId && !req.user?.id) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const r = await pool.query('SELECT role FROM users WHERE id=$1', [req.session.userId || req.user.id]);
    if (!r.rows[0] || !['owner','admin'].includes(r.rows[0].role)) {
      return res.status(403).json({ error: 'Owner or Admin access required' });
    }
    next();
  } catch(e) { res.status(500).json({ error: e.message }); }
}

// ── STATS ─────────────────────────────────────────
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [users, docs, evidence, affiliates] = await Promise.all([
      pool.query('SELECT plan FROM users'),
      pool.query('SELECT COUNT(*) FROM documents'),
      pool.query('SELECT COUNT(*) FROM evidence').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) FROM affiliates').catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    const planPrices = { solo: 300, team: 1200, enterprise: 2500 };
    const payingUsers = users.rows.filter(u => planPrices[u.plan]);
    const mrr = payingUsers.reduce((sum, u) => sum + (planPrices[u.plan] || 0), 0);

    res.json({
      stats: {
        total_users: users.rows.length,
        paying_users: payingUsers.length,
        estimated_mrr: mrr,
        total_docs: parseInt(docs.rows[0].count),
        total_evidence: parseInt(evidence.rows[0].count),
        total_affiliates: parseInt(affiliates.rows[0].count),
      }
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── ALL USERS ─────────────────────────────────────
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, email, plan, role, docs_used_this_month, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: r.rows, total: r.rows.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── UPDATE USER ───────────────────────────────────
router.patch('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { plan, role } = req.body;
    const updates = [];
    const vals = [];
    let i = 1;
    if (plan) { updates.push(`plan=$${i++}`); vals.push(plan); }
    if (role) { updates.push(`role=$${i++}`); vals.push(role); }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(req.params.id);
    await pool.query(`UPDATE users SET ${updates.join(',')} WHERE id=$${i}`, vals);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE USER ───────────────────────────────────
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Don't allow deleting owner
    const u = await pool.query('SELECT role FROM users WHERE id=$1', [req.params.id]);
    if (u.rows[0]?.role === 'owner') return res.status(403).json({ error: 'Cannot delete owner' });
    await pool.query('DELETE FROM documents WHERE user_id=$1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── ALL DOCUMENTS ─────────────────────────────────
router.get('/documents', requireAuth, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT d.id, d.title, d.type, d.jurisdiction, d.word_count, d.created_at,
              u.email as user_email
       FROM documents d LEFT JOIN users u ON u.id::text = d.user_id::text
       ORDER BY d.created_at DESC LIMIT 100`
    );
    res.json({ documents: r.rows, total: r.rows.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── ALL AFFILIATES ────────────────────────────────
router.get('/affiliates', requireAuth, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM affiliates ORDER BY created_at DESC').catch(() => ({ rows: [] }));
    res.json({ affiliates: r.rows });
  } catch(e) { res.json({ affiliates: [] }); }
});

// ── ACTIVITY LOG ──────────────────────────────────
router.get('/activity', requireAuth, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50'
    ).catch(() => ({ rows: [] }));
    res.json({ logs: r.rows });
  } catch(e) { res.json({ logs: [] }); }
});

// ── INVITE USER ───────────────────────────────────
router.post('/invite', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, plan } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    // Create user with temp password
    const bcrypt = require('bcryptjs');
    const tempPass = Math.random().toString(36).slice(-10);
    const hash = await bcrypt.hash(tempPass, 10);
    await pool.query(
      'INSERT INTO users(email, password_hash, plan) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
      [email, hash, plan || 'trial']
    );
    res.json({ success: true, message: 'User created. Temp password: ' + tempPass });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
