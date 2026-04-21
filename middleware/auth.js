const { pool, PLAN_LIMITS, SEAT_LIMITS } = require('../db')
const crypto = require('crypto')

// Generate device fingerprint from request headers
function getFingerprint(req) {
  const ua = req.headers['user-agent'] || ''
  const lang = req.headers['accept-language'] || ''
  const ip = req.ip || req.connection.remoteAddress || ''
  return crypto.createHash('sha256').update(ua + lang + ip).digest('hex').slice(0, 32)
}

// Ensure user is authenticated
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next()
  if (req.session && req.session.userId) return next()
  return res.status(401).json({ error: 'Authentication required' })
}

// Ensure email is verified
async function ensureEmailVerified(req, res, next) {
  try {
    if (!req.user && !req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const userId = req.user?.id || req.session.userId
    const { rows } = await pool.query('SELECT email_verified FROM users WHERE id = $1', [userId])
    if (!rows.length || !rows[0].email_verified) {
      return res.status(403).json({ error: 'Email verification required. Please check your inbox.' })
    }
    next()
  } catch (e) {
    next(e)
  }
}

// Track and enforce unique device sessions (no shared logins)
async function enforceUniqueDevice(req, res, next) {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return next()

    const fingerprint = getFingerprint(req)
    const ua = req.headers['user-agent'] || ''
    const ip = req.ip || ''

    // Upsert device session
    await pool.query(`
      INSERT INTO device_sessions (user_id, fingerprint, user_agent, ip, last_seen)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, fingerprint)
      DO UPDATE SET last_seen = NOW(), ip = $4
    `, [userId, fingerprint, ua, ip])

    // Check seat limit - count unique active devices in last 7 days
    const { rows: user } = await pool.query('SELECT plan FROM users WHERE id = $1', [userId])
    if (user.length) {
      const plan = user[0].plan || 'free'
      const seatLimit = SEAT_LIMITS[plan] || 1
      const { rows: devices } = await pool.query(`
        SELECT COUNT(DISTINCT fingerprint) as cnt
        FROM device_sessions
        WHERE user_id = $1 AND last_seen > NOW() - INTERVAL '7 days'
      `, [userId])
      const activeDevices = parseInt(devices[0]?.cnt || 0)
      if (activeDevices > seatLimit && fingerprint !== req.session?.trustedFingerprint) {
        return res.status(403).json({
          error: `Seat limit reached. Your ${plan} plan allows ${seatLimit} active device(s). Please upgrade or contact support.`,
          code: 'SEAT_LIMIT_EXCEEDED',
          seatLimit,
          activeDevices
        })
      }
    }
    next()
  } catch (e) {
    next(e)
  }
}

// Check document usage limit and handle overage
async function checkDocLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return next()

    const { rows } = await pool.query('SELECT plan, doc_count, doc_limit FROM users WHERE id = $1', [userId])
    if (!rows.length) return next()

    const { plan, doc_count, doc_limit } = rows[0]
    const limit = doc_limit || PLAN_LIMITS[plan] || 3

    if (doc_count >= limit) {
      if (plan === 'free') {
        return res.status(402).json({
          error: 'Document limit reached. Upgrade to Solo ($300/mo) for 50 documents/month.',
          code: 'DOC_LIMIT_FREE',
          used: doc_count,
          limit,
          upgrade_url: '/#pricing'
        })
      }
      // Paid plans: flag as overage (billed at $5/doc)
      req.isOverage = true
      req.overageAmount = 5.00
    }
    req.docCount = doc_count
    req.docLimit = limit
    next()
  } catch (e) {
    next(e)
  }
}

// Ensure paid plan
async function ensurePaid(req, res, next) {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return res.status(401).json({ error: 'Authentication required' })
    const { rows } = await pool.query('SELECT plan FROM users WHERE id = $1', [userId])
    if (!rows.length || rows[0].plan === 'free') {
      return res.status(402).json({ error: 'Paid plan required', upgrade_url: '/#pricing' })
    }
    next()
  } catch (e) { next(e) }
}

// Ensure Pro/Team plan or above
async function ensurePro(req, res, next) {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return res.status(401).json({ error: 'Authentication required' })
    const { rows } = await pool.query('SELECT plan FROM users WHERE id = $1', [userId])
    const plan = rows[0]?.plan || 'free'
    if (!['team', 'enterprise'].includes(plan)) {
      return res.status(402).json({ error: 'Team plan or above required', upgrade_url: '/#pricing' })
    }
    next()
  } catch (e) { next(e) }
}

// Ensure Enterprise/Firm plan
async function ensureFirm(req, res, next) {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return res.status(401).json({ error: 'Authentication required' })
    const { rows } = await pool.query('SELECT plan FROM users WHERE id = $1', [userId])
    if (rows[0]?.plan !== 'enterprise') {
      return res.status(402).json({ error: 'Enterprise plan required', upgrade_url: '/#pricing' })
    }
    next()
  } catch (e) { next(e) }
}

module.exports = {
  ensureAuth,
  ensureEmailVerified,
  enforceUniqueDevice,
  checkDocLimit,
  ensurePaid,
  ensurePro,
  ensureFirm,
  getFingerprint
}
