const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const q = await pool.query(`
      SELECT u.id, u.email, u.firm_id,
             f.credits as firm_credits, f.credits as credits_left,
             f.id as firm_id_db, f.plan, f.seats
      FROM users u
      LEFT JOIN firms f ON f.id = u.firm_id
      WHERE u.id = $1
    `, [userId]);

    if (q.rows.length === 0) return res.status(404).json({error: 'user not found'});

    const row = q.rows[0];
    // also get real firm credits direct
    const firmQ = await pool.query(`SELECT credits FROM firms WHERE id=$1`, [row.firm_id]);
    const credits = firmQ.rows[0]?.credits?? row.firm_credits;

    res.json({
      user: {
        id: row.id,
        email: row.email,
        firm_id: row.firm_id,
        firm_credits: credits,
        credits_left: credits,
        plan: row.plan,
        seats: row.seats
      }
    });
  } catch (e) {
    console.error('status error', e);
    res.status(500).json({error: e.message, user: {firm_credits: null, firm_id: null}});
  }
});

module.exports = router;
