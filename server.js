require('dotenv').config()
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const helmet = require('helmet')
const cors = require('cors')
const path = require('path')
const { pool, initDB } = require('./db')

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1)
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.APP_URL, credentials: true }))

// Stripe webhook needs raw body — mount before json parser
app.use('/api/payments/webhook', require('./routes/payments'))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(session({
  secret: process.env.SESSION_SECRET || 'lexai-dev-change-in-prod',
  resave: false, saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' }
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const r = await pool.query('SELECT * FROM users WHERE id=$1', [id])
    done(null, r.rows[0] || null)
  } catch (e) { done(e, null) }
})

async function findOrCreate(profile, provider) {
  const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.oauth`
  const name = profile.displayName || profile.username || email.split('@')[0]
  const avatar_url = profile.photos?.[0]?.value || null
  let r = await pool.query('SELECT * FROM users WHERE email=$1', [email])
  if (!r.rows.length) r = await pool.query('INSERT INTO users(email,name,avatar_url,provider,provider_id) VALUES($1,$2,$3,$4,$5) RETURNING *', [email, name, avatar_url, provider, profile.id])
  return r.rows[0]
}

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/google/callback`
  }, async (at, rt, profile, done) => {
    try { done(null, await findOrCreate(profile, 'google')) } catch (e) { done(e) }
  }))
}

if (process.env.GITHUB_CLIENT_ID) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/github/callback`
  }, async (at, rt, profile, done) => {
    try { done(null, await findOrCreate(profile, 'github')) } catch (e) { done(e) }
  }))
}

app.use('/auth', require('./routes/auth'))
app.use('/api', require('./routes/api'))
app.use('/api/affiliate', require('./routes/affiliate'))
app.use('/api/payments', require('./routes/payments'))

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'lexai', version: '2.0.0', env: process.env.NODE_ENV }))

app.use(express.static(path.join(__dirname, 'public')))
;['dashboard', 'login', 'pricing', 'vault', 'research', 'agents', 'analyze', 'predict', 'workflows', 'privacy', 'terms'].forEach(p => {
  app.get(`/${p}`, (req, res) => res.sendFile(path.join(__dirname, 'public', `${p}.html`)))
})
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))
app.use((req, res) => req.path.startsWith('/api') ? res.status(404).json({ error: 'Not found' }) : res.sendFile(path.join(__dirname, 'public', 'index.html')))

async function start() {
  await initDB()
  app.listen(PORT, () => {
    console.log(`\n⚖️  LexAI.llc v2.0 — ${process.env.NODE_ENV || 'development'}`)
    console.log(`   ${process.env.APP_URL || `http://localhost:${PORT}`}`)
    console.log(`   Features: Draft · Analyze · Research · Case Law · Litigation Prediction`)
    console.log(`   Self-Learning: Active ✓\n`)
  })
}

start().catch(err => {
  console.error('Startup error (server still starting):', err.message)
  // Start without DB if initDB failed
  app.listen(PORT, () => {
    console.log(`
⚖️  LexAI.llc v2.0 — ${process.env.NODE_ENV || 'development'} (limited mode)`)
    console.log(`   PORT: ${PORT} — DB unavailable`)
  })
})
