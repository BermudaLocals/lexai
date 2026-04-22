const router = §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)('express').Router()
const passport = §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)('passport')
const crypto = §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)('crypto')
const nodemailer = §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)('nodemailer')
const { pool } = §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)('../db')

// ── EMAIL TRANSPORTER ────────────────────────────────────────────────────────
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
  const link = `${appUrl}/api/verify-email/${token}`
  await transporter.sendMail({
    from: `"LexAI" <${process.env.EMAIL_USER || 'aiprofitamplifier@gmail.com'}>`,
    to: email,
    subject: 'Verify your LexAI email address',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#07070f;color:#ece9e0;padding:40px;border-radius:12px">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="color:#d4af37;font-size:28px;margin:0">LexAI</h1>
          <p style="color:#666;font-size:12px;font-family:monospace">THE LUXURY AI LEGAL PLATFORM</p>
        </div>
        <h2 style="font-size:20px;margin-bottom:16px">Verify your email address</h2>
        <p style="color:#aaa;line-height:1.6;margin-bottom:24px">
          Thank you for signing up. Click the button below to verify your email and activate your account.
        </p>
        <div style="text-align:center;margin-bottom:32px">
          <a href="${link}" style="background:#d4af37;color:#070709;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">
            Verify Email Address →
          </a>
        </div>
        <p style="color:#555;font-size:12px;font-family:monospace">This link expires in 24 hours.</p>
        <p style="color:#555;font-size:12px;font-family:monospace">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border-color:#1a1a2e;margin:24px 0">
        <p style="color:#333;font-size:11px;text-align:center">LexAI.llc — AI Legal Intelligence Platform</p>
      </div>
    `
  })
}

// ── EMAIL/PASSWORD SIGNUP ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, name } = req.body
    if (!email) return res.status(400).json({ error: 'Email is §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)d' })

    // Check if user already exists
    const { rows: existing } = await pool.query('SELECT id, email_verified FROM users WHERE email = $1', [email.toLowerCase()])

    let userId
    const token = crypto.randomBytes(32).toString('hex')

    if (existing.length) {
      if (existing[0].email_verified) {
        return res.status(409).json({ error: 'Account already exists. Please log in.' })
      }
      // Resend verification
      await pool.query('UPDATE users SET email_verify_token = $1 WHERE id = $2', [token, existing[0].id])
      userId = existing[0].id
    } else {
      // Create new user
      const { rows } = await pool.query(
        `INSERT INTO users (email, name, email_verify_token, plan, doc_count, doc_limit)
         VALUES ($1, $2, $3, 'free', 0, 3) RETURNING id`,
        [email.toLowerCase(), name || email.split('@')[0], token]
      )
      userId = rows[0].id
    }

    // Send verification email
    await sendVerificationEmail(email.toLowerCase(), token)

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      email: email.toLowerCase()
    })
  } catch (e) {
    console.error('Signup error:', e)
    res.status(500).json({ error: 'Signup failed. Please try again.' })
  }
})

// ── EMAIL VERIFICATION ───────────────────────────────────────────────────────
router.get('/verify/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users SET email_verified = TRUE, email_verify_token = NULL
       WHERE email_verify_token = $1 RETURNING id, email`,
      [req.params.token]
    )
    if (!rows.length) {
      return res.redirect('/?error=invalid_token')
    }
    // Auto-login after verification
    req.session.userId = rows[0].id
    req.session.userEmail = rows[0].email
    res.redirect('/?verified=1')
  } catch (e) {
    res.redirect('/?error=verification_failed')
  }
})

// ── LOGIN (email lookup) ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)d' })

    const { rows } = await pool.query('SELECT id, email, email_verified, plan FROM users WHERE email = $1', [email.toLowerCase()])

    if (!rows.length) {
      // Auto-create and send verification
      return res.status(404).json({
        error: 'No account found. Please sign up first.',
        signup_url: '/login'
      })
    }

    const user = rows[0]
    if (!user.email_verified) {
      // Resend verification
      const token = crypto.randomBytes(32).toString('hex')
      await pool.query('UPDATE users SET email_verify_token = $1 WHERE id = $2', [token, user.id])
      await sendVerificationEmail(email.toLowerCase(), token)
      return res.status(403).json({
        error: 'Email not verified. A new verification link has been sent to your inbox.',
        resent: true
      })
    }

    // Create session
    req.session.userId = user.id
    req.session.userEmail = user.email
    req.session.userPlan = user.plan

    res.json({ success: true, plan: user.plan, redirect: '/' })
  } catch (e) {
    console.error('Login error:', e)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ── MAGIC LINK (passwordless) ─────────────────────────────────────────────────
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)d' })

    let { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (!rows.length) {
      // Auto-create user
      const ins = await pool.query(
        `INSERT INTO users (email, plan, email_verified) VALUES ($1, 'free', TRUE) RETURNING id`,
        [email.toLowerCase()]
      )
      rows = ins.rows
    }

    const token = crypto.randomBytes(32).toString('hex')
    await pool.query('UPDATE users SET email_verify_token = $1 WHERE id = $2', [token, rows[0].id])

    const appUrl = process.env.APP_URL || 'https://www.lexai.llc'
    await transporter.sendMail({
      from: `"LexAI" <${process.env.EMAIL_USER || 'aiprofitamplifier@gmail.com'}>`,
      to: email.toLowerCase(),
      subject: 'Your LexAI magic login link',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#07070f;color:#ece9e0;padding:40px;border-radius:12px">
          <h1 style="color:#d4af37;text-align:center">LexAI</h1>
          <h2>Your login link</h2>
          <p style="color:#aaa">Click below to log in — this link expires in 15 minutes.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${appUrl}/auth/verify/${token}" style="background:#d4af37;color:#070709;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700">Log In to LexAI →</a>
          </div>
          <p style="color:#555;font-size:11px">If you didn't request this, ignore this email.</p>
        </div>
      `
    })

    res.json({ success: true, message: 'Magic link sent to your email.' })
  } catch (e) {
    console.error('Magic link error:', e)
    res.status(500).json({ error: 'Failed to send magic link' })
  }
})

// ── LOGOUT ────────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }))
})

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'))
})

// ── ME (current user) ─────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.userId
    if (!userId) return res.json({ authenticated: false })
    const { rows } = await pool.query(
      'SELECT id, email, plan, doc_count, doc_limit, email_verified, created_at FROM users WHERE id = $1',
      [userId]
    )
    if (!rows.length) return res.json({ authenticated: false })
    res.json({ authenticated: true, user: rows[0] })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
  async (req, res) => {
    if (req.user) {
      req.session.userId = req.user.id
      req.session.userEmail = req.user.email
      req.session.userPlan = req.user.plan
    }
    res.redirect('/')
  }
)

// ── GITHUB OAUTH ──────────────────────────────────────────────────────────────
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login?error=github_failed' }),
  async (req, res) => {
    if (req.user) {
      req.session.userId = req.user.id
      req.session.userEmail = req.user.email
    }
    res.redirect('/')
  }
)

module.exports = router
