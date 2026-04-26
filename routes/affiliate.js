const router = require("express").Router()
const crypto = require("crypto")
const { pool } = require("../db")
const { ensureAuth } = require("../middleware/auth")

function genCode(uid) {
  return crypto.createHash("md5").update(String(uid)+"lexai2026").digest("hex").slice(0,8).toUpperCase()
}

router.get("/stats", ensureAuth, async (req, res) => {
  try {
    const userId = req.session.userId
    let aff = await pool.query("SELECT * FROM affiliates WHERE user_id=$1", [userId]).then(r => r.rows[0])
    if (!aff) {
      const code = genCode(userId)
      aff = await pool.query("INSERT INTO affiliates(user_id, code, commission_pct) VALUES($1,$2,20) RETURNING *", [userId, code]).then(r => r.rows[0])
    }
    const stats = await pool.query("SELECT COUNT(*) referrals, COALESCE(SUM(commission_earned),0) earned FROM affiliate_referrals WHERE affiliate_id=$1", [aff.id]).then(r => r.rows[0])
    res.json({ ok: true, code: aff.code, commission_pct: aff.commission_pct, stats })
  } catch (e) { res.json({ ok: false, error: e.message }) }
})

router.get("/ref/:code", (req, res) => {
  res.cookie("ref", req.params.code, { maxAge: 30*24*3600*1000, httpOnly: true })
  res.redirect("/?ref=" + req.params.code)
})

router.get("/leaderboard", async (req, res) => {
  try {
    const rows = await pool.query(`SELECT u.email, a.code, COUNT(r.id) referrals, COALESCE(SUM(r.commission_earned),0) earned FROM affiliates a JOIN users u ON u.id=a.user_id LEFT JOIN affiliate_referrals r ON r.affiliate_id=a.id GROUP BY u.email, a.code ORDER BY earned DESC LIMIT 10`).then(r => r.rows)
    res.json({ ok: true, leaderboard: rows })
  } catch (e) { res.json({ ok: false, error: e.message }) }
})

router.get("/tiers", (req, res) => {
  res.json({ ok: true, tiers: [
    { name: "Starter", referrals: "1-4",   commission: "20%", monthly: "$60-240" },
    { name: "Silver",  referrals: "5-14",  commission: "25%", monthly: "$375-1050" },
    { name: "Gold",    referrals: "15-29", commission: "30%", monthly: "$1350-2610" },
    { name: "Elite",   referrals: "30+",   commission: "35%", monthly: "$3150+" }
  ], note: "Commission paid monthly on Solo $300, Team $1200, Enterprise $3000 plans." })
})

module.exports = router
