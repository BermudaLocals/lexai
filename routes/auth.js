const router = require('express').Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')

const JWT_SECRET = process.env.JWT_SECRET || 'lexai-jwt-secret-change-me'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const APP_URL = process.env.APP_URL || 'https://lexai.llc'

function syncSession(req, res, next) {
  if (req.user) req.session.user = req.user
  next()
}

// Setup Google OAuth only if credentials exist
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: APP_URL + '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      const name = profile.displayName
      const googleId = profile.id
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT')
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT')
      let user = await pool.query('SELECT * FROM users WHERE email=$1', [email])
      if (!user.rows.length) {
        user = await pool.query(
          "INSERT INTO users(email,name,google_id,provider,plan,role) VALUES($1,$2,$3,'google','trial','user') RETURNING id,email,name,plan,role",
          [email, name, googleId]
        )
      }
      return done(null, user.rows[0])
    } catch(err) { return done(err) }
  }))

  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(async (id, done) => {
    try {
      const r = await pool.query('SELECT id,email,name,plan,role FROM users WHERE id=$1', [id])
      done(null, r.rows[0])
    } catch(e) { done(e) }
  })

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
    (req, res) => {
      const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '30d' })
      req.session.user = req.user
      res.redirect('/dashboard?token=' + token)
    }
  )
} else {
  // No credentials yet — show friendly message
  router.get('/google', (req, res) => res.redirect('/login?msg=google_coming_soon'))
  router.get('/google/callback', (req, res) => res.redirect('/login?msg=google_coming_soon'))
}

// GitHub — disabled
router.get('/github', (req, res) => res.redirect('/login'))
router.get('/github/callback', (req, res) => res.redirect('/login'))

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
    if (!user.password_hash) return res.status(401).json({ error: 'Please use Google sign-in for this account' })
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
    req.session.user = user
    res.json({ token, user })
  } catch(err) {
    console.error('[auth] login:', err.message)
    res.status(500).json({ error: 'Login failed' })
  }
})

module.exports = router
