const router = require('express').Router()
const passport = require('passport')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const { pool } = require('../db')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'aiprofitamplifier@gmail.com',
    pass: process.env.EMAIL_PASS || 'vwkc mtlc yuct emws'
  }
})

async function sendVerificationEmail(email, token) {
  const appUrl = process.env.APP_URL || 'https://www.lexai.llc'
  const link = `${appUrl}/auth/verify/${token}`
  await transporter.sendMail({
    from: `"LexAI" <${process.env.EMAIL_USER || 'aiprofitamplifier@gmail.com'}>`,
    to: email,
    subject: 'Verify your LexAI email address',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#07070f;color:#ece9e0;padding:40px;border-radius:12px">
        <h1 style="color:#d4af37;text-align:center">LexAI</h1>
        <h2>Verify your email address</h2>
        <p style="color:#aaa;line-height:1.6">Click below to verify your email and activate your account.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${link}" style="background:#d4af37;color:#070709;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">Verify Email Address</a>
        </div>
        <p style="color:#555;font-size:12px">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>`
  })
}

router.post('/signup', async (req, res) => {
  try {
    const { email, name } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    const { rows: existing } = await pool.query('SELECT id, email_verified FROM users WHERE email = $1', [email.toLowerCase()])
    const token = crypto.randomBytes(32).toString('hex')
    let userId
    if (existing.length) {
      if (existing[0].email_verified) return res.status(409).json({ error: 'Account already exists. Please log in.' })
      await pool.query('UPDATE users SET email_verify_token = $1 WHERE id = $2', [token, existing[0].id])
      userId = existing[0].id
    } else {
      const { rows } = await pool.query(
        `INSERT INTO users (email, email_verify_token, plan, doc_count, doc_limit) VALUES ($1, $2, 'free', 0, 3) RETURNING id`,
        [email.toLowerCase(), token]
      )
      userId = rows[0].id
    }
    await sendVerificationEmail(email.toLowerCase(), token)
    res.json({ success: true, message: 'Verification email sent. Please check your inbox.' })
  } catch (e) {
    console.error('Signup error:', e)
    res.status(500).json({ error: 'Signup failed. Please try again.' })
  }
})

router.get('/verify/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users SET email_verified = TRUE, email_verify_token = NULL WHERE email_verify_token = $1 RETURNING id, email`,
      [req.params.token]
    )
    if (!rows.length) return res.redirect('/?error=invalid_token')
    req.session.userId = rows[0].id
    req.session.userEmail = rows[0].email
    res.redirect('/?verified=1')
  } catch (e) {
    res.redirect('/?error=verification_failed')
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })
    const { rows } = await pool.query('SELECT id, email, email_verified, plan FROM users WHERE email = $1', [email.toLowerCase()])
    if (!rows.length) return res.status(404).json({ error: 'No account found. Please sign up first.' })
    const user = rows[0]
    if (!user.email_verified) {
      const token = crypto.randomBytes(32).toString('hex')
      await pool.query('UPDATE users SET email_verify_token = $1 WHERE id = $2', [token, user.id])
      await sendVerificationEmail(email.toLowerCase(), token)
      return res.status(403).json({ error: 'Email not verified. Verification link resent.', resent: true })
    }
    req.session.userId = user.id
    req.session.userEmail = user.email
    req.session.userPlan = user.plan
    res.json({ success: true, plan: user.plan, redirect: '/' })
  } catch (e) {
    console.error('Login error:', e)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })
    let { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (!rows.length) {
      const ins = await pool.query(`INSERT INTO users (email, plan, email_verified) VALUES ($1, 'free', TRUE) RETURNING id`, [email.toLowerCase()])
      rows = ins.rows
    }
    const token = crypto.randomBytes(32).toString('hex')
    await pool.query('UPDATE users SET email_verify_token = $1 WHERE id = $2', [token, rows[0].id])
    const appUrl = process.env.APP_URL || 'https://www.lexai.llc'
    await transporter.sendMail({
      from: `"LexAI" <${process.env.EMAIL_USER || 'aiprofitamplifier@gmail.com'}>`,
      to: email.toLowerCase(),
      subject: 'Your LexAI magic login link',
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#07070f;color:#ece9e0;padding:40px;border-radius:12px"><h1 style="color:#d4af37;text-align:center">LexAI</h1><h2>Your login link</h2><p style="color:#aaa">Click below to log in — expires in 15 minutes.</p><div style="text-align:center;margin:24px 0"><a href="${appUrl}/auth/verify/${token}" style="background:#d4af37;color:#070709;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700">Log In to LexAI</a></div></div>`
    })
    res.json({ success: true, message: 'Magic link sent.' })
  } catch (e) {
    res.status(500).json({ error: 'Failed to send magic link' })
  }
})

router.post('/logout', (req, res) => { req.session.destroy(() => res.json({ success: true })) })
router.get('/logout', (req, res) => { req.session.destroy(() => res.redirect('/')) })

router.get('/me', async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return res.json({ authenticated: false })
    const { rows } = await pool.query('SELECT id, email, plan, doc_count, doc_limit, email_verified, created_at FROM users WHERE id = $1', [userId])
    if (!rows.length) return res.json({ authenticated: false })
    res.json({ authenticated: true, user: rows[0] })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }), (req, res) => { if (req.user) { req.session.userId = req.user.id; req.session.userEmail = req.user.email } res.redirect('/') })

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login?error=github_failed' }), (req, res) => { if (req.user) { req.session.userId = req.user.id; req.session.userEmail = req.user.email } res.redirect('/') })

module.exports = router
