/* WarriorPlus IPN — Offer 94697 (LexAI Business AI)
   Products: 473669 BASIC $49/10 docs, 473682 SOLO $150/40 docs, 473683 TEAM $450/120 docs
   Provisions the buyer: creates or tops up their account (idempotent per
   txn_id) and returns a one-time login URL. */
const crypto = require('crypto')
const express = require('express')
const router = express.Router()
const { pool } = require('../db')
const wplusProvision = require('./lib/wplus-provision')

const { createLexAIUser, DOCS_MAP } = wplusProvision(pool)
const PROFIT_MAP = { '473669': 9.48, '473682': 17.15, '473683': 52.05 }
const API_COST = 1.33
const APP_URL = (process.env.APP_URL || 'https://lexai.llc').replace(/\/+$/, '')

// When WPLUS_SECRET is set, every IPN must carry it as WP_SECRET.
let warnedNoSecret = false
function secretOk (req) {
  const expected = process.env.WPLUS_SECRET || ''
  if (!expected) {
    if (!warnedNoSecret) {
      console.warn('[wplus-ipn] WARNING: WPLUS_SECRET not set — IPN secret verification is DISABLED')
      warnedNoSecret = true
    }
    return true
  }
  const sent = String((req.body && req.body.WP_SECRET) || '')
  if (sent.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(expected))
}

async function handleIpn (req, res) {
  try {
    const body = req.body || {}
    // Accept both plain field names and WarriorPlus' WP_* IPN field names.
    const rawTxn = body.txn_id || body.WP_SALE_ID || ''
    const product_id = String(body.product_id || body.WP_ITEM_ID || '')
    const email = (body.customer_email || body.buyer_email || body.WP_BUYER_EMAIL || '').toLowerCase().trim()
    const name = body.customer_name || body.WP_BUYER_NAME || ''
    const docs = DOCS_MAP[product_id] || 0
    const apiCost = docs * API_COST
    const profit = PROFIT_MAP[product_id] || 0
    console.log('[wplus-ipn]', new Date().toISOString(), rawTxn, product_id, email, docs + 'docs', 'API $' + apiCost, 'Profit $' + profit)

    if (!secretOk(req)) {
      console.error('[wplus-ipn] SECRET MISMATCH — txn', rawTxn, '— 200, crediting nothing')
      return res.status(200).json({ ok: false, error: 'secret_mismatch', txn_id: rawTxn, product_id })
    }
    if (!docs) {
      console.error('[wplus-ipn] UNKNOWN product_id', product_id, '— txn', rawTxn, '— 200, crediting nothing')
      return res.status(200).json({ ok: true, ignored: true, reason: 'unknown_product', txn_id: rawTxn, product_id })
    }
    if (!email) {
      console.error('[wplus-ipn] MISSING buyer email — txn', rawTxn, '— 200, crediting nothing')
      return res.status(200).json({ ok: true, ignored: true, reason: 'missing_email', txn_id: rawTxn, product_id })
    }
    // Without a txn id there is no idempotency anchor — derive a
    // deterministic one so W+ retries of the same sale still can't double-credit.
    const txn_id = rawTxn || 'auto-' + crypto.createHash('sha256')
      .update([email, product_id, body.amount || body.WP_AMOUNT || ''].join('|'))
      .digest('hex').slice(0, 24)
    if (!rawTxn) console.warn('[wplus-ipn] no txn_id in payload — using deterministic fallback', txn_id)

    const result = await createLexAIUser(email, docs, product_id, txn_id, name)
    const loginUrl = result.loginToken
      ? APP_URL + '/auth/offer-login?token=' + result.loginToken
      : null
    console.log('[wplus-ipn]', result.action, email, '— credited', result.docs_credited, 'docs' + (result.docs_credits != null ? ', balance ' + result.docs_credits : ''))
    res.status(200).json({
      ok: true,
      txn_id,
      product_id,
      email,
      docs,
      apiCost,
      profit,
      action: result.action,
      docs_credited: result.docs_credited,
      docs_credits: result.docs_credits,
      loginUrl
    })
  } catch (e) {
    // 500 on real failure: W+ may retry, and the txn_id unique constraint
    // keeps any retry from double-crediting.
    console.error('[wplus-ipn] ERROR', e.message)
    res.status(500).json({ ok: false, error: 'provisioning_failed' })
  }
}

router.post('/warriorplus-ipn', handleIpn)
router.post('/warriorplus-ipn.php', handleIpn)

module.exports = router
