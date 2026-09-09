/* WarriorPlus IPN — Offer 94697 (LexAI Business AI)
   Products: 473669 BASIC $49/10 docs, 473682 SOLO $150/40 docs, 473683 TEAM $450/120 docs */
const express = require('express')
const router = express.Router()

const DOCS_MAP = { '473669': 10, '473682': 40, '473683': 120 }
const PROFIT_MAP = { '473669': 9.48, '473682': 17.15, '473683': 52.05 }
const API_COST = 1.33

function handleIpn (req, res) {
  const { txn_id, product_id, customer_email, buyer_email, customer_name, amount } = req.body || {}
  const email = customer_email || buyer_email
  const docs = DOCS_MAP[product_id] || 0
  const apiCost = docs * API_COST
  const profit = PROFIT_MAP[product_id] || 0
  console.log('[wplus-ipn]', new Date().toISOString(), txn_id, product_id, email, docs + 'docs', 'API $' + apiCost, 'Profit $' + profit)
  // TODO: createLexAIUser(email, docs, product_id)
  const plan = product_id === '473669' ? 'basic' : product_id === '473682' ? 'solo' : 'larger'
  const loginUrl = 'https://lexai.llc/business?offer=94697&plan=' + plan + '&email=' + encodeURIComponent(email || '') + '&txn=' + (txn_id || '')
  res.status(200).json({ ok: true, txn_id, product_id, email, docs, apiCost, profit, loginUrl })
}

router.post('/warriorplus-ipn', handleIpn)
router.post('/warriorplus-ipn.php', handleIpn)

module.exports = router
