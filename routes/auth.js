const router = require('express').Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')

const JWT_SECRET = process.env.JWT_SECRET || 'lexai-jwt-secret-change-me'

function syncSession(req, res, next) {
  if (req.user) req.session.user = req.user
  next()
}

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google_token' }),
  syncSession,
  (req, res) => res.redirect('/dashboard')
)

// GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login?error=github_token' }),
  syncSession,
  (req, res) => res.redirect('/dashboard')
)

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT')
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email])
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const r = await pool.query(
      "INSERT INTO users(email,name,password_hash,provider,plan,role) VALUES($1,$2,$3,$4,'trial','user') RETURNING id,email,name,plan,role",
      [email, name || email.split('@')[0], hash, 'email']
    )
    const user = r.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
    req.session.user = user
    res.json({ token, user })
  } catch(err) {
    console.error('[auth] register:', err.message)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' })
    const user = r.rows[0]
    if (!user.password_hash) return res.status(401).json({ error: 'Use Google or GitHub login' })
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
    req.session.user = { id: user.id, email: user.email, name: user.name, plan: user.plan || 'free', role: user.role || 'user' }
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan || 'free', role: user.role || 'user' } })
  } catch(err) {
    console.error('[auth] login:', err.message)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Me
router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' })
  res.json({ user: req.session.user, plan: req.session.user?.plan, role: req.session.user?.role })
})

// Logout
router.post('/logout', (req, res) => {
  req.session.user = null
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' })
    res.json({ success: true })
  })
})

module.exports = router
