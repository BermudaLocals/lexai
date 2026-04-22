const express = require('express')
const crypto = require('crypto')
const router = express.Router()
const { pool, OVERAGE_PRICE_DOC, OVERAGE_PRICE_RESEARCH } = require('../db')
const { ensureAuth, checkDocLimit, enforceUniqueDevice } = require('../middleware/auth')
const { formatDocument, listFormats } = require('../services/formats')
const caselaw = require('../services/caselaw')
const ai = require('../services/ai')
const learning = require('../services/learning')

// ── CASE LAW SEARCH ──────────────────────────────────────────────────────────
router.post('/caselaw', checkDocLimit, async (req, res) => {
  try {
    const { query, jurisdiction, area_of_law, limit = 10, source, format } = req.body
    if (!query) return res.status(400).json({ error: 'query is required' })

    let results = []
    const src = (source || jurisdiction || 'all').toLowerCase()

    // Route to correct search function based on source/jurisdiction
    if (src.includes('bermuda') && src.includes('privy')) {
      results = await caselaw.searchBermudaPrivyCouncil(query, { limit })
    } else if (src.includes('bermuda')) {
      results = await caselaw.searchBermudaGov(query, { limit })
    } else if (src.includes('canlii') || src.includes('canada')) {
      results = await caselaw.searchCanLII(query, { jurisdiction: src, limit })
    } else if (src.includes('ccj') || src.includes('caribbean')) {
      results = await caselaw.searchCCJ(query, { limit })
    } else if (src.includes('commonlii')) {
      results = await caselaw.searchCommonLII(query, { limit })
    } else if (src.includes('harvard') || src.includes('cap')) {
      results = await caselaw.searchHarvardCAP(query, { jurisdiction: src, limit })
    } else if (src.includes('statutes')) {
      results = await caselaw.searchStatutes(query, { jurisdiction: src, limit })
    } else if (src.includes('india') || src.includes('indiankanoon') || src.includes('bombay') || src.includes('delhi') || src.includes('madras') || src.includes('calcutta') || src.includes('supreme court of india')) {
      results = await caselaw.searchIndianKanoon({ query, jurisdiction: src, limit })
    } else if (src.includes('hong kong') || src.includes('hklii') || src.includes('hksar') || src.includes('hca') || src.includes('cacv') || src.includes('facv')) {
      results = await caselaw.searchHKLII({ query, limit })
    } else if (src.includes('singapore') || src.includes('sghc') || src.includes('sgca') || src.includes('sicc')) {
      results = await caselaw.searchCommonLII(query, { jurisdiction: 'sg', limit })
    } else if (src.includes('malaysia') || src.includes('kehakiman')) {
      results = await caselaw.searchCommonLII(query, { jurisdiction: 'my', limit })
    } else if (src.includes('sri lanka') || src.includes('pakistan') || src.includes('philippines')) {
      results = await caselaw.searchCommonLII(query, { jurisdiction: src.includes('sri') ? 'lk' : src.includes('pakistan') ? 'pk' : 'ph', limit })
    } else {
      results = await caselaw.searchCaseLaw(query, { jurisdiction: src, area_of_law, limit })
    }

    // Log doc usage
    const userId = req.user?.id || req.session?.userId
    if (userId) {
      await pool.query(
        'INSERT INTO doc_usage (user_id, doc_type, format, jurisdiction, query, billed_overage, overage_amount) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, 'caselaw_search', format || 'json', src, query, req.isOverage || false, req.overageAmount || 0]
      )
      await pool.query('UPDATE users SET doc_count = doc_count + 1 WHERE id = $1', [userId])
    }

    // Apply document format if requested
    let formattedResult = null
    if (format && format !== 'json' && format !== 'pdf' && format !== 'docx') {
      const body = results.cases?.map((c, i) =>
        `${i + 1}. ${c.name || c.title || 'Untitled'}\n   Court: ${c.court || src}\n   Date: ${c.date || 'n/a'}\n   Excerpt: ${c.excerpt || c.summary || ''}\n`
      ).join('\n') || ''
      formattedResult = formatDocument(format, {
        subject: query,
        jurisdiction: src,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      }, body)
    }

    res.json({
      cases: results.cases || results || [],
      total_found: results.total_found || (results.cases || results || []).length,
      sources: results.sources || [src],
      format_used: format || 'json',
      formatted_document: formattedResult,
      overage: req.isOverage ? { billed: true, amount: req.overageAmount } : null,
      doc_usage: { used: (req.docCount || 0) + 1, limit: req.docLimit || 3 }
    })
  } catch (e) {
    console.error('Caselaw error:', e)
    res.status(500).json({ error: 'Search failed', detail: e.message })
  }
})

// ── DOCUMENT FORMATS LIST ─────────────────────────────────────────────────────
router.get('/formats', (req, res) => {
  res.json({ formats: listFormats() })
})

// ── GENERATE DOCUMENT (one-time download) ─────────────────────────────────────
router.post('/document/generate', ensureAuth, checkDocLimit, async (req, res) => {
  try {
    const { content, format, meta } = req.body
    if (!content) return res.status(400).json({ error: 'content is required' })

    const userId = req.user?.id || req.session?.userId
    const formatted = formatDocument(format || 'bermuda-supreme', meta || {}, content)

    // Create one-time download token
    const token = crypto.randomBytes(32).toString('hex')
    await pool.query(
      'INSERT INTO download_tokens (user_id, token, format, expires_at) VALUES ($1,$2,$3,NOW()+INTERVAL \'24 hours\')',
      [userId, token, format || 'bermuda-supreme']
    )

    // Log usage
    await pool.query(
      'INSERT INTO doc_usage (user_id, doc_type, format, billed_overage, overage_amount) VALUES ($1,$2,$3,$4,$5)',
      [userId, 'document_generate', format || 'bermuda-supreme', req.isOverage || false, req.overageAmount || 0]
    )
    await pool.query('UPDATE users SET doc_count = doc_count + 1 WHERE id = $1', [userId])

    res.json({
      success: true,
      download_token: token,
      download_url: `/api/document/download/${token}`,
      expires_in: '24 hours',
      format_name: format,
      preview: formatted.slice(0, 500) + (formatted.length > 500 ? '...' : ''),
      overage: req.isOverage ? { billed: true, amount: req.overageAmount } : null
    })
  } catch (e) {
    console.error('Generate error:', e)
    res.status(500).json({ error: 'Document generation failed', detail: e.message })
  }
})

// ── ONE-TIME DOWNLOAD ─────────────────────────────────────────────────────────
router.get('/document/download/:token', ensureAuth, async (req, res) => {
  try {
    const { token } = req.params
    const { rows } = await pool.query(
      'SELECT * FROM download_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
      [token]
    )
    if (!rows.length) {
      return res.status(410).json({
        error: 'Download link expired or already used. One-time downloads cannot be reused.',
        code: 'TOKEN_USED_OR_EXPIRED'
      })
    }

    // Mark token as used immediately
    await pool.query(
      'UPDATE download_tokens SET used = TRUE, used_at = NOW() WHERE token = $1',
      [token]
    )

    // Return document
    const doc = rows[0]
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="lexai-document-${Date.now()}.txt"`)
    res.send(doc.content || 'Document content not found. Please regenerate.')
  } catch (e) {
    res.status(500).json({ error: 'Download failed', detail: e.message })
  }
})

// ── AI RESEARCH QUERY ─────────────────────────────────────────────────────────
router.post('/research', ensureAuth, checkDocLimit, async (req, res) => {
  try {
    const { query, jurisdiction, format } = req.body
    if (!query) return res.status(400).json({ error: 'query is required' })

    const userId = req.user?.id || req.session?.userId
    const answer = await ai.query(query, { jurisdiction })

    // Log at research rate
    if (req.isOverage) {
      // Research overage is $50, not $5
      await pool.query(
        'INSERT INTO doc_usage (user_id, doc_type, format, jurisdiction, query, billed_overage, overage_amount) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, 'research', format || 'text', jurisdiction || 'all', query, true, OVERAGE_PRICE_RESEARCH]
      )
    } else {
      await pool.query(
        'INSERT INTO doc_usage (user_id, doc_type, format, jurisdiction, query) VALUES ($1,$2,$3,$4,$5)',
        [userId, 'research', format || 'text', jurisdiction || 'all', query]
      )
    }
    await pool.query('UPDATE users SET doc_count = doc_count + 1 WHERE id = $1', [userId])

    res.json({
      answer,
      query,
      jurisdiction,
      overage: req.isOverage ? { billed: true, amount: OVERAGE_PRICE_RESEARCH } : null
    })
  } catch (e) {
    res.status(500).json({ error: 'Research failed', detail: e.message })
  }
})

// ── SELF-LEARNING: submit correction ─────────────────────────────────────────
router.post('/correction', ensureAuth, async (req, res) => {
  try {
    const { query, original, corrected, jurisdiction } = req.body
    const userId = req.user?.id || req.session?.userId
    await learning.recordCorrection({ userId, query, original, corrected, jurisdiction })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── USAGE DASHBOARD ───────────────────────────────────────────────────────────
router.get('/usage', ensureAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.userId
    const { rows: user } = await pool.query(
      'SELECT plan, doc_count, doc_limit, seat_count FROM users WHERE id = $1', [userId]
    )
    const { rows: recent } = await pool.query(
      'SELECT doc_type, format, jurisdiction, created_at, billed_overage, overage_amount FROM doc_usage WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    )
    const { rows: devices } = await pool.query(
      'SELECT fingerprint, user_agent, ip, last_seen FROM device_sessions WHERE user_id = $1 ORDER BY last_seen DESC LIMIT 10',
      [userId]
    )
    const { rows: downloads } = await pool.query(
      'SELECT token, format, used, used_at, expires_at, created_at FROM download_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    )
    res.json({
      user: user[0] || {},
      recent_activity: recent,
      active_devices: devices,
      download_history: downloads
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── EMAIL VERIFICATION ────────────────────────────────────────────────────────
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params
    const { rows } = await pool.query(
      'UPDATE users SET email_verified = TRUE, email_verify_token = NULL WHERE email_verify_token = $1 RETURNING email',
      [token]
    )
    if (!rows.length) return res.status(400).send('Invalid or expired verification link.')
    res.redirect('/?verified=1')
  } catch (e) {
    res.status(500).send('Verification failed.')
  }
})

// ── SEAT MANAGEMENT ───────────────────────────────────────────────────────────
router.get('/seats', ensureAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.userId
    const { rows: user } = await pool.query('SELECT plan, seat_count FROM users WHERE id = $1', [userId])
    const { rows: devices } = await pool.query(
      `SELECT fingerprint, user_agent, ip, last_seen FROM device_sessions
       WHERE user_id = $1 AND last_seen > NOW() - INTERVAL '7 days'
       ORDER BY last_seen DESC`,
      [userId]
    )
    res.json({
      plan: user[0]?.plan || 'free',
      seats_purchased: user[0]?.seat_count || 1,
      active_devices: devices.length,
      devices
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Revoke a device session
router.delete('/seats/:fingerprint', ensureAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.userId
    await pool.query(
      'DELETE FROM device_sessions WHERE user_id = $1 AND fingerprint = $2',
      [userId, req.params.fingerprint]
    )
    res.json({ success: true, message: 'Device session revoked.' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
