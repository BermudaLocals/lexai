require('dotenv').config()

const express = require('express')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const helmet = require('helmet')
const cors = require('cors')
const path = require('path')

const { pool, initDB } = require('./db')
const { requireAuth } = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1)

app.use(helmet({
  contentSecurityPolicy: false
}))

app.use(cors({
  origin: process.env.APP_URL,
  credentials: true
}))

// ============================================================
// PAYPAL WEBHOOK
// Must receive the raw request body BEFORE express.json()
// ============================================================

app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/payments')
)

// ============================================================
// BODY PARSERS
// ============================================================

app.use(express.json({
  limit: '50mb'
}))

app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}))

// ============================================================
// SESSION
// ============================================================

app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session'
  }),

  secret: process.env.SESSION_SECRET || 'lexai-dev-change-in-prod',

  resave: false,

  saveUninitialized: false,

  cookie: {
    secure: process.env.NODE_ENV === 'production',

    httpOnly: true,

    maxAge: 30 * 24 * 60 * 60 * 1000,

    sameSite:
      process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax'
  }
}))

// ============================================================
// PASSPORT
// ============================================================

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const r = await pool.query(
      'SELECT * FROM users WHERE id=$1',
      [id]
    )

    done(null, r.rows[0] || null)
  } catch (e) {
    done(e, null)
  }
})

// ============================================================
// OAUTH USER CREATION
// ============================================================

async function findOrCreate(profile, provider) {
  const email =
    profile.emails?.[0]?.value ||
    `${profile.id}@${provider}.oauth`

  const name =
    profile.displayName ||
    profile.username ||
    email.split('@')[0]

  const avatar_url =
    profile.photos?.[0]?.value || null

  let r = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  )

  if (!r.rows.length) {
    r = await pool.query(
      `INSERT INTO users
        (email, name, avatar_url, provider, provider_id, plan, role)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        email,
        name,
        avatar_url,
        provider,
        profile.id,
        'trial',
        'user'
      ]
    )
  }

  return r.rows[0]
}

// ============================================================
// GOOGLE OAUTH
// ============================================================

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,

        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        callbackURL:
          `${process.env.APP_URL}/auth/google/callback`
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const user =
            await findOrCreate(profile, 'google')

          done(null, user)
        } catch (e) {
          done(e)
        }
      }
    )
  )
}

// ============================================================
// GITHUB OAUTH
// ============================================================

if (
  process.env.GITHUB_CLIENT_ID &&
  process.env.GITHUB_CLIENT_SECRET
) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,

        clientSecret: process.env.GITHUB_CLIENT_SECRET,

        callbackURL:
          `${process.env.APP_URL}/auth/github/callback`
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const user =
            await findOrCreate(profile, 'github')

          done(null, user)
        } catch (e) {
          done(e)
        }
      }
    )
  )
}

// ============================================================
// ROUTES
// ============================================================

// Authentication
app.use(
  '/auth',
  require('./routes/auth')
)

app.use(
  '/api/auth',
  require('./routes/auth')
)

// Payments
app.use(
  '/api/payments',
  require('./routes/payments')
)

// Admin
app.use(
  '/api/admin',
  require('./routes/admin')
)

// Main API
app.use(
  '/api',
  require('./routes/api')
)

// Affiliate
app.use(
  '/api',
  require('./routes/affiliate')
)

// ============================================================
// VAULT
//
// IMPORTANT:
// requireAuth runs BEFORE every Vault route.
//
// It converts:
//     req.session.user
//
// into:
//     req.user
//
// so routes/vault.js can safely use:
//     req.user.id
// ============================================================

app.use(
  '/api/vault',
  requireAuth,
  require('./routes/vault')
)

// ============================================================
// HEALTH
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'lexai',
    version: '3.0.0',
    env: process.env.NODE_ENV
  })
})

// ============================================================
// STATIC FILES
// ============================================================

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
)

// ============================================================
// CLEAN PAGE ROUTES
// ============================================================

[
  'dashboard',
  'login',
  'pricing',
  'vault',
  'research',
  'agents',
  'analyze',
  'predict',
  'workflows',
  'privacy',
  'terms',
  'admin'
].forEach(p => {
  app.get(
    `/${p}`,
    (req, res) => {
      res.sendFile(
        path.join(
          __dirname,
          'public',
          `${p}.html`
        )
      )
    }
  )
})

// ============================================================
// HOME
// ============================================================

app.get(
  '/',
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        'public',
        'index.html'
      )
    )
  }
)

// ============================================================
// FALLBACK
// ============================================================

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res
      .status(404)
      .json({
        error: 'Not found'
      })
  }

  res.sendFile(
    path.join(
      __dirname,
      'public',
      'index.html'
    )
  )
})

// ============================================================
// START SERVER
// ============================================================

async function start() {
  await initDB()

  app.listen(PORT, () => {
    console.log(
      `\n⚖️  LexAI.llc v3.0 — ${process.env.NODE_ENV || 'development'}`
    )

    console.log(
      `   ${process.env.APP_URL || `http://localhost:${PORT}`}`
    )

    console.log(
      '   Routes: auth · payments · admin · api · affiliate · vault'
    )

    console.log(
      '   Features: Draft · Analyze · Research · Case Law · Litigation Prediction'
    )

    console.log(
      '   All 12 PayPal plans · Affiliate system · Admin god mode ✓\n'
    )
  })
}

start().catch(console.error)

module.exports = app
