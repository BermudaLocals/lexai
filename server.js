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

const PORT = Number(process.env.PORT) || 3000
const APP_URL = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/+$/, '')
const NODE_ENV = process.env.NODE_ENV || 'development'

app.set('trust proxy', 1)

/* ============================================================
   SECURITY
   ============================================================ */

app.use(
  helmet({
    contentSecurityPolicy: false
  })
)

/* ============================================================
   CORS
   ============================================================ */

app.use(
  cors({
    origin: APP_URL,
    credentials: true
  })
)

/* ============================================================
   PAYPAL WEBHOOK
   Raw body MUST be received before express.json()
   ============================================================ */

app.use(
  '/api/payments/webhook',
  express.raw({
    type: 'application/json'
  }),
  require('./routes/payments')
)

/* ============================================================
   BODY PARSERS
   ============================================================ */

app.use(
  express.json({
    limit: '50mb'
  })
)

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb'
  })
)

/* ============================================================
   SESSION
   ============================================================ */

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: 'session'
    }),

    secret:
      process.env.SESSION_SECRET ||
      'lexai-dev-change-this-in-production',

    resave: false,

    saveUninitialized: false,

    cookie: {
      secure: NODE_ENV === 'production',

      httpOnly: true,

      maxAge: 30 * 24 * 60 * 60 * 1000,

      sameSite:
        NODE_ENV === 'production'
          ? 'none'
          : 'lax'
    }
  })
)

/* ============================================================
   PASSPORT
   ============================================================ */

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    )

    done(null, result.rows[0] || null)
  } catch (error) {
    console.error('Passport deserialize error:', error)
    done(error, null)
  }
})

/* ============================================================
   OAUTH USER CREATION
   ============================================================ */

async function findOrCreate(profile, provider) {
  const email =
    profile?.emails?.[0]?.value ||
    `${profile.id}@${provider}.oauth`

  const name =
    profile?.displayName ||
    profile?.username ||
    email.split('@')[0]

  const avatar_url =
    profile?.photos?.[0]?.value ||
    null

  let result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )

  if (result.rows.length === 0) {
    result = await pool.query(
      `
      INSERT INTO users
        (
          email,
          name,
          avatar_url,
          provider,
          provider_id,
          plan,
          role
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
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

  return result.rows[0]
}

/* ============================================================
   GOOGLE OAUTH
   ============================================================ */

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {
  console.log('Google OAuth: configured')

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,

        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        callbackURL:
          `${APP_URL}/auth/google/callback`
      },

      async (
        accessToken,
        refreshToken,
        profile,
        done
      ) => {
        try {
          const user =
            await findOrCreate(
              profile,
              'google'
            )

          done(null, user)
        } catch (error) {
          console.error(
            'Google OAuth user error:',
            error
          )

          done(error)
        }
      }
    )
  )
} else {
  console.warn(
    'Google OAuth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing'
  )
}

/* ============================================================
   GITHUB OAUTH
   ============================================================ */

if (
  process.env.GITHUB_CLIENT_ID &&
  process.env.GITHUB_CLIENT_SECRET
) {
  console.log('GitHub OAuth: configured')

  passport.use(
    new GitHubStrategy(
      {
        clientID:
          process.env.GITHUB_CLIENT_ID,

        clientSecret:
          process.env.GITHUB_CLIENT_SECRET,

        callbackURL:
          `${APP_URL}/auth/github/callback`
      },

      async (
        accessToken,
        refreshToken,
        profile,
        done
      ) => {
        try {
          const user =
            await findOrCreate(
              profile,
              'github'
            )

          done(null, user)
        } catch (error) {
          console.error(
            'GitHub OAuth user error:',
            error
          )

          done(error)
        }
      }
    )
  )
} else {
  console.log(
    'GitHub OAuth: not configured'
  )
}

/* ============================================================
   ROUTES
   ============================================================ */

/* Authentication */
app.use(
  '/auth',
  require('./routes/auth')
)

app.use(
  '/api/auth',
  require('./routes/auth')
)

/* Payments */
app.use(
  '/api/payments',
  require('./routes/payments')
)

/* Admin */
app.use(
  '/api/admin',
  require('./routes/admin')
)

/* Main API */
app.use(
  '/api',
  require('./routes/api')
)

/* Affiliate */
app.use(
  '/api',
  require('./routes/affiliate')
)

/* ============================================================
   VAULT (File Upload/Download)
   Authentication required.
   ============================================================ */

app.use(
  '/api/vault',
  requireAuth,
  require('./routes/vault')
)

/* ============================================================
   RAG (Retrieval-Augmented Generation)
   Ingest precedent docs + query with sentence-level citations.
   Authentication required.
   ============================================================ */

app.use(
  '/api/rag',
  requireAuth,
  require('./routes/rag')
)

/* ============================================================
   WORKFLOWS (Harvey-style chained legal automation)
   Draft → Analyze → Redline → Memo pipelines.
   Authentication required.
   ============================================================ */

app.use(
  '/api/workflows',
  requireAuth,
  require('./routes/workflows')
)

/* ============================================================
   HEALTH
   ============================================================ */

app.get(
  '/health',
  (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'lexai',
      version: '3.1.0',
      env: NODE_ENV,
      features: [
        'auth',
        'payments',
        'admin',
        'api',
        'affiliate',
        'vault',
        'rag',
        'workflows'
      ]
    })
  }
)

/* ============================================================
   STATIC FILES
   ============================================================ */

app.use(
  express.static(
    path.join(
      __dirname,
      'public'
    )
  )
)

/* ============================================================
   CLEAN PAGE ROUTES
   ============================================================ */

const CLEAN_PAGE_ROUTES = [
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
]

for (
  const page of CLEAN_PAGE_ROUTES
) {
  app.get(
    `/${page}`,
    (req, res) => {
      res.sendFile(
        path.join(
          __dirname,
          'public',
          `${page}.html`
        )
      )
    }
  )
}

/* ============================================================
   HOME
   ============================================================ */

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

/* ============================================================
   API 404
   ============================================================ */

app.use(
  (req, res, next) => {
    if (
      req.path.startsWith('/api')
    ) {
      return res
        .status(404)
        .json({
          error: 'Not found'
        })
    }

    next()
  }
)

/* ============================================================
   FRONTEND FALLBACK
   ============================================================ */

app.use(
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

/* ============================================================
   START SERVER
   ============================================================ */

async function start() {
  try {
    await initDB()

    console.log(
      '✅ Database connected and tables verified'
    )

    app.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log('')
        console.log(
          `⚖️  LexAI.llc v3.1 — ${NODE_ENV}`
        )
        console.log(
          `   ${APP_URL}`
        )
        console.log(
          `   Port: ${PORT}`
        )
        console.log(
          '   Routes: auth · payments · admin · api · affiliate · vault · rag · workflows'
        )
        console.log(
          '   Features: Draft · Analyze · Research · Case Law · Litigation · Redline · RAG · Workflows'
        )
        console.log(
          '   AI Provider: ' + (process.env.AI_PROVIDER || 'anthropic')
        )
        console.log(
          '   All 12 PayPal plans · Affiliate system · Admin god mode ✓'
        )
        console.log('')
      }
    )
  } catch (error) {
    console.error(
      '❌ LexAI startup failed:'
    )

    console.error(error)

    process.exit(1)
  }
}

start()

module.exports = app
