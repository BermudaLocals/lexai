const router = require('express').Router()
const crypto = require('crypto')
const { pool } = require('../db')

// Generate unique referral code
function genCode(email) {
  return crypto.createHash('md5').update(email + 'lexai2026').digest('hex').slice(0, 8).toUpperCase()
}

// GET /api/affiliate/stats - get affiliate stats for logged-in user
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return res.status(401).json({ error: 'Login §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)d' })

    // Get or create affiliate record
    let aff = await pool.query('SELECT * FROM affiliates WHERE user_id = $1', [userId])
    if (!aff.rows.length) {
      const { rows: user } = await pool.query('SELECT email FROM users WHERE id = $1', [userId])
      const code = genCode(user[0]?.email || userId.toString())
      aff = await pool.query(
        `INSERT INTO affiliates (user_id, ref_code) VALUES ($1, $2) RETURNING *`,
        [userId, code]
      )
    }

    const a = aff.rows[0]
    const appUrl = process.env.APP_URL || 'https://www.lexai.llc'
    res.json({
      ref_code: a.ref_code,
      ref_link: `${appUrl}?ref=${a.ref_code}`,
      clicks: a.clicks || 0,
      signups: a.signups || 0,
      conversions: a.conversions || 0,
      pending_payout: parseFloat(a.pending_payout || 0).toFixed(2),
      total_earned: parseFloat(a.total_earned || 0).toFixed(2),
      payout_threshold: 50.00,
      commission_rate: '20%'
    })
  } catch (e) {
    console.error('Affiliate stats error:', e.message)
    res.status(500).json({ error: 'Could not load affiliate stats' })
  }
})

// GET /api/affiliate/click?ref=CODE - track click
router.get('/click', async (req, res) => {
  const { ref } = req.query
  if (ref) {
    await pool.query('UPDATE affiliates SET clicks = clicks + 1 WHERE ref_code = $1', [ref]).catch(() => {})
    req.session.ref_code = ref
  }
  res.json({ ok: true })
})

// POST /api/affiliate/request-payout
router.post('/request-payout', async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return res.status(401).json({ error: 'Login §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)d' })
    const { paypal_email } = req.body
    const aff = await pool.query('SELECT * FROM affiliates WHERE user_id = $1', [userId])
    if (!aff.rows.length) return res.status(404).json({ error: 'No affiliate account' })
    const pending = parseFloat(aff.rows[0].pending_payout || 0)
    if (pending < 50) return res.status(400).json({ error: `Minimum payout is $50. You have $${pending.toFixed(2)}.` })
    await pool.query(
      `UPDATE affiliates SET pending_payout = 0, total_earned = total_earned + $1, paypal_email = $2, last_payout_at = NOW() WHERE user_id = $3`,
      [pending, paypal_email, userId]
    )
    res.json({ success: true, amount: pending.toFixed(2), message: `Payout of $${pending.toFixed(2)} §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)d to ${paypal_email}. Processed within 5 business days.` })
  } catch (e) {
    res.status(500).json({ error: 'Payout request failed' })
  }
})

module.exports = router
