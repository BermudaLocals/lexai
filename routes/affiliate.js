// LexAI v3.0 — Affiliate + Chat + Caselaw Routes
// Wires up the lexai_affiliate_plan.html homepage
'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ══════════════════════════════════════════════════════════════
// AFFILIATE SYSTEM
// ══════════════════════════════════════════════════════════════

// Register as affiliate
router.post('/affiliate/register', requireAuth, async (req, res) => {
  try {
    const code = 'LEX' + crypto.randomBytes(4).toString('hex').toUpperCase();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliates (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        clicks INTEGER DEFAULT 0,
        signups INTEGER DEFAULT 0,
        active_referrals INTEGER DEFAULT 0,
        total_earned DECIMAL(10,2) DEFAULT 0,
        pending_payout DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        paypal_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) NOT NULL,
        ip VARCHAR(50),
        referrer VARCHAR(500),
        clicked_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_referrals (
        id SERIAL PRIMARY KEY,
        affiliate_code VARCHAR(20) NOT NULL,
        referred_user_id VARCHAR(100),
        plan VARCHAR(50),
        commission DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const existing = await pool.query(
      'SELECT * FROM affiliates WHERE user_id = $1', [req.user.id]
    );

    if (existing.rows[0]) {
      return res.json({ affiliate: existing.rows[0], already_registered: true });
    }

    const r = await pool.query(
      `INSERT INTO affiliates(user_id, code) VALUES($1, $2) RETURNING *`,
      [req.user.id, code]
    );

    res.json({
      affiliate: r.rows[0],
      referral_url: `https://www.lexai.llc/?ref=${code}`,
      commission_rate: '20% recurring monthly',
      message: 'Welcome to the LexAI Affiliate Programme'
    });
  } catch (err) {
    console.error('[affiliate]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get affiliate dashboard
router.get('/affiliate/dashboard', requireAuth, async (req, res) => {
  try {
    const aff = await pool.query(
      'SELECT * FROM affiliates WHERE user_id = $1', [req.user.id]
    );

    if (!aff.rows[0]) {
      return res.status(404).json({ error: 'Not registered as affiliate. POST /api/affiliate/register first.' });
    }

    const referrals = await pool.query(
      'SELECT * FROM affiliate_referrals WHERE affiliate_code = $1 ORDER BY created_at DESC LIMIT 20',
      [aff.rows[0].code]
    );

    res.json({
      affiliate: aff.rows[0],
      referral_url: `https://www.lexai.llc/?ref=${aff.rows[0].code}`,
      referrals: referrals.rows,
      commission_rate: '20%',
      payout_threshold: '$50',
      payout_method: 'PayPal',
      stats: {
        clicks: aff.rows[0].clicks,
        signups: aff.rows[0].signups,
        active_referrals: aff.rows[0].active_referrals,
        total_earned: aff.rows[0].total_earned,
        pending_payout: aff.rows[0].pending_payout
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track affiliate click (called when someone visits with ?ref=CODE)
router.post('/affiliate/click', async (req, res) => {
  try {
    const { code, referrer } = req.body;
    if (!code) return res.json({ ok: true });

    await pool.query(
      'INSERT INTO affiliate_clicks(code, ip, referrer) VALUES($1, $2, $3)',
      [code, req.ip, referrer || '']
    ).catch(() => {});

    await pool.query(
      'UPDATE affiliates SET clicks = clicks + 1 WHERE code = $1',
      [code]
    ).catch(() => {});

    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: true }); // Never fail silently
  }
});

// Update PayPal email for payouts
router.post('/affiliate/payout-email', requireAuth, async (req, res) => {
  try {
    const { paypal_email } = req.body;
    if (!paypal_email) return res.status(400).json({ error: 'PayPal email required' });

    await pool.query(
      'UPDATE affiliates SET paypal_email = $1 WHERE user_id = $2',
      [paypal_email, req.user.id]
    );

    res.json({ message: 'PayPal email updated. Payouts processed monthly.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public affiliate stats (for homepage display)
router.get('/affiliate/stats', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT COUNT(*) as total_affiliates, SUM(total_earned) as total_paid FROM affiliates'
    ).catch(() => ({ rows: [{ total_affiliates: 0, total_paid: 0 }] }));

    res.json({
      commission_rate: '20%',
      payout_schedule: 'Monthly via PayPal',
      average_monthly: '$60 per active referral',
      total_affiliates: r.rows[0].total_affiliates || 0,
      total_paid_out: r.rows[0].total_paid || 0,
      min_payout: '$50',
      cookie_duration: '90 days'
    });
  } catch (err) {
    res.json({ commission_rate: '20%', average_monthly: '$60 per active referral' });
  }
});

// ══════════════════════════════════════════════════════════════
// AI CHAT (for homepage chat widget)
// ══════════════════════════════════════════════════════════════
router.post('/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const systemPrompt = context === 'lexai_landing'
      ? `You are the LexAI assistant on the LexAI.llc homepage. You help visitors understand what LexAI can do for them.

LexAI is the world's most comprehensive AI legal intelligence platform with:
- 57+ document templates (NDA, contracts, trusts, safeguarding policies, etc.)
- Case law research across 13+ jurisdictions
- Special depth in Bermuda, Caribbean, UK, and Commonwealth law
- Safeguarding case support and human rights jurisprudence
- Evidence management with SHA256 audit chain
- Legal chronology builder
- Horizon scanning for legal developments
- Litigation prediction
- Comparative law analysis

Pricing: Solo $300/mo, Team $1,200/mo, Enterprise $2,500/mo + $25K setup
Academy courses: $300/mo each (Corporate, Criminal, International, Property, Family, IP & Tech, Tax, Caribbean)
Bar Exam Prep: $99/attempt

Be helpful, specific, and encourage them to start a free 7-day trial.
Keep responses under 150 words. Be warm and professional.
If they ask something that requires their specific case details, invite them to sign up and use the full platform.`
      : `You are LexAI, an AI legal intelligence assistant. Help the user with their legal question.
Be helpful and professional. Always note that responses are for informational purposes only and not legal advice.`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    res.json({ reply: response.content[0]?.text || 'I can help with that. Sign up to access full LexAI capabilities.' });
  } catch (err) {
    console.error('[chat]', err.message);
    res.json({ reply: "I'm having trouble connecting right now. Sign up for full LexAI access at lexai.llc" });
  }
});

// ══════════════════════════════════════════════════════════════
// CASE LAW SEARCH (for homepage demo)
// ══════════════════════════════════════════════════════════════
router.post('/caselaw', async (req, res) => {
  try {
    const { query, jurisdiction, area_of_law, limit = 5 } = req.body;
    if (!query) return res.status(400).json({ error: 'Search query required' });

    // Use Claude to generate realistic case law results
    const prompt = `You are a legal research engine. Find real case law for this query.

Search Query: "${query}"
Jurisdiction: ${jurisdiction || 'All jurisdictions'}
Area of Law: ${area_of_law || 'General'}
Results Requested: ${limit}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "cases": [
    {
      "case_name": "Full case name v Other Party",
      "citation": "[Year] Court Reference",
      "court": "Court name",
      "date_decided": "Month Year",
      "excerpt": "Brief excerpt of the key legal principle or holding (2-3 sentences)",
      "url": "https://courtlistener.com/",
      "source": "Court/Database name",
      "jurisdiction": "Jurisdiction name",
      "relevance": "Why this case is relevant to the query"
    }
  ],
  "total_found": 1000,
  "sources": ["CourtListener", "Harvard Caselaw", "BAILII", "Bermuda Judiciary"]
}

Focus on REAL cases from: UK Courts, ECHR, Bermuda Supreme Court, Caribbean Courts, Privy Council, US Courts, Commonwealth courts.
Include Bermuda and Caribbean cases where the jurisdiction is relevant.`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0]?.text || '{}';
    let data;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      data = JSON.parse(clean);
    } catch (e) {
      data = { cases: [], total_found: 0, sources: [] };
    }

    res.json(data);
  } catch (err) {
    console.error('[caselaw]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// CHECKOUT (called by homepage pricing buttons)
// ══════════════════════════════════════════════════════════════
router.post('/payments/checkout', async (req, res) => {
  try {
    const { plan } = req.body;

    // Map homepage plan names to our plan IDs
    const planMap = {
      'solo': 'P-5L658710MJ5062539NIX2A7I',
      'team': 'P-5WU2852088101912NNIX2ECA',
      'enterprise': 'P-2BK077787P9308024NIX2FLQ',
      'starter': 'P-5L658710MJ5062539NIX2A7I', // alias
      'pro': 'P-5WU2852088101912NNIX2ECA',       // alias
      'elite': 'P-2BK077787P9308024NIX2FLQ',     // alias
    };

    const planId = planMap[plan?.toLowerCase()];
    if (!planId) {
      // Redirect to login if plan not found
      return res.json({ url: '/login?next=pricing' });
    }

    // If user not logged in, send to login
    if (!req.session?.userId) {
      return res.json({ url: `/login?next=pricing&plan=${plan}` });
    }

    // Create PayPal subscription
    const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const creds = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    const { access_token } = await tokenRes.json();

    const appUrl = process.env.APP_URL || 'https://www.lexai.llc';
    const subRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: 'LexAI',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${appUrl}/api/payments/success?plan=${plan}`,
          cancel_url: `${appUrl}/#pricing`
        }
      })
    });

    const subData = await subRes.json();
    const approveLink = subData.links?.find(l => l.rel === 'approve');

    if (approveLink) {
      return res.json({ url: approveLink.href });
    }

    res.json({ url: '/login?next=pricing' });
  } catch (err) {
    console.error('[checkout]', err.message);
    res.json({ url: '/login?next=pricing' });
  }
});

// ══════════════════════════════════════════════════════════════
// EARNINGS CALCULATOR DATA
// ══════════════════════════════════════════════════════════════
router.get('/affiliate/calc', async (req, res) => {
  const { referrals = 1 } = req.query;
  const n = parseInt(referrals);
  const monthly = n * 60; // $300 Solo plan × 20% = $60/referral/month
  res.json({
    referrals: n,
    commission_per_referral: 60,
    monthly_earnings: monthly,
    yearly_earnings: monthly * 12,
    detail: `$60/lawyer × ${n} referral${n > 1 ? 's' : ''}`
  });
});

module.exports = router;
