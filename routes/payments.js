// LexAI v3.0 — Payments Route
// Real PayPal Plan IDs — NVIDIA CUDA Lock-in Model
'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// ── REAL PAYPAL PLAN IDs ──────────────────────────────────────
const PLANS = {

  // ── CORE PLATFORM ────────────────────────────────────────────
  solo: {
    id: 'solo',
    name: 'LexAI Solo',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-5L658710MJ5062539NIX2A7I',
    category: 'platform',
    description: '1 lawyer. Full LexAI power. All jurisdictions.',
    features: [
      'Unlimited AI legal queries',
      'All document templates (60+ types)',
      'Case law research — all jurisdictions',
      'Safeguarding case support',
      'Human rights jurisprudence',
      'Evidence audit chain (SHA256)',
      'Legal chronology builder',
      'Horizon scanning — weekly updates',
      'Litigation prediction',
      'Comparative law analysis',
      'Bermuda, Caribbean, UK, US, Commonwealth',
      'Email support',
    ],
    users: 1,
    lock_in: 'Your entire legal workflow, case history, and evidence chain lives here. Switching means starting over.',
  },

  team: {
    id: 'team',
    name: 'LexAI Team',
    price: 1200,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-5WU2852088101912NNIX2ECA',
    category: 'platform',
    description: 'Your whole firm on one platform.',
    features: [
      'Everything in Solo',
      'Up to 10 lawyers',
      'Shared matter database',
      'Team case management',
      'Collaborative document drafting',
      'Shared evidence vault',
      'Matter assignment and tracking',
      'Firm-wide analytics dashboard',
      'Priority support',
      'API access',
      'White-label options available',
      'Dedicated onboarding session',
    ],
    users: 10,
    lock_in: 'Your firm\'s entire case database, shared evidence vault, and analytics live here. The longer you use it, the more valuable it becomes.',
  },

  enterprise: {
    id: 'enterprise',
    name: 'LexAI Enterprise',
    price: 2500,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-2BK077787P9308024NIX2FLQ',
    category: 'platform',
    setup_fee: 25000,
    description: 'Full enterprise deployment. Your AI. Your infrastructure.',
    features: [
      'Everything in Team',
      'Unlimited lawyers and staff',
      'Dedicated LexAI instance',
      'Custom AI training on your case library',
      'Custom jurisdiction depth',
      'White-label with your branding',
      'Custom domain and SSL',
      'SLA guarantee 99.9% uptime',
      'Dedicated account manager',
      'On-site training available',
      'Integration with your case management system',
      'Custom API endpoints',
      'Regulatory compliance reporting',
      'Board-level governance reports',
    ],
    users: 'unlimited',
    lock_in: 'Your AI is trained on YOUR case library. It knows YOUR jurisdiction. It knows YOUR clients. Nobody else has this. Switching means losing your competitive advantage.',
  },

  // ── LEXAI ACADEMY ─────────────────────────────────────────────
  academy_corporate: {
    id: 'academy_corporate',
    name: 'LexAI Academy — Corporate Law',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-75G90458J5657421PNIZB6PI',
    category: 'academy',
    description: 'Master corporate law with AI-powered case analysis.',
    features: [
      'Corporate law AI research engine',
      'Company formation and governance',
      'M&A documentation and analysis',
      'Shareholder agreements and disputes',
      'Director duties and liability',
      'Corporate finance and securities',
      'Regulatory compliance (BMA, FCA, SEC)',
      'Caribbean and Bermuda company law',
      'Weekly case law updates',
      'Exam preparation (Bar, CLP, LPC)',
      'Certificate of completion',
    ],
    subjects: ['Company Law', 'M&A', 'Securities', 'Corporate Governance', 'Finance'],
  },

  academy_criminal: {
    id: 'academy_criminal',
    name: 'LexAI Academy — Criminal Law',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-31858684J9287430BNIZB7XQ',
    category: 'academy',
    description: 'Criminal law mastery with AI case analysis across jurisdictions.',
    features: [
      'Criminal law AI research engine',
      'UK, Caribbean, US criminal law',
      'Evidence and procedure',
      'Sentencing guidelines analysis',
      'Human rights in criminal proceedings',
      'Case preparation support',
      'Chronology and evidence tools',
      'Appeals and judicial review',
      'ECHR criminal law jurisprudence',
      'Weekly case law updates',
      'Certificate of completion',
    ],
    subjects: ['Criminal Procedure', 'Evidence', 'Sentencing', 'Appeals', 'Human Rights'],
  },

  academy_international: {
    id: 'academy_international',
    name: 'LexAI Academy — International Law',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-9MF23849LL3179905NIZCEOI',
    category: 'academy',
    description: 'International law, treaties, and cross-border practice.',
    features: [
      'International law AI research engine',
      'Public international law',
      'International trade law',
      'Investment treaty arbitration',
      'UNCITRAL, ICC, ICSID procedures',
      'Diplomatic and consular law',
      'International human rights law',
      'Cross-border dispute resolution',
      'Comparative law analysis',
      'Weekly updates from international tribunals',
      'Certificate of completion',
    ],
    subjects: ['Public International Law', 'Trade', 'Arbitration', 'Human Rights', 'Comparative Law'],
  },

  academy_property: {
    id: 'academy_property',
    name: 'LexAI Academy — Property Law',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-0UT36848CW9198400NIZCFGI',
    category: 'academy',
    description: 'Property law mastery — residential, commercial, and Caribbean.',
    features: [
      'Property law AI research engine',
      'Residential conveyancing',
      'Commercial real estate',
      'Leasehold and freehold',
      'Bermuda and Caribbean land law',
      'Registration and title',
      'Landlord and tenant law',
      'Planning and development law',
      'Property finance and mortgages',
      'Weekly case law updates',
      'Certificate of completion',
    ],
    subjects: ['Conveyancing', 'Commercial Property', 'Land Law', 'Landlord & Tenant', 'Planning'],
  },

  academy_family: {
    id: 'academy_family',
    name: 'LexAI Academy — Family Law',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-5GY51503Y6327514UNIZCGOY',
    category: 'academy',
    description: 'Family law with safeguarding and children law focus.',
    features: [
      'Family law AI research engine',
      'Divorce and financial remedies',
      'Children law and welfare',
      'Safeguarding in family proceedings',
      'Domestic abuse law',
      'International family law (Hague Convention)',
      'Caribbean and Bermuda family law',
      'Mediation and alternative dispute resolution',
      'Human rights in family proceedings',
      'Weekly case law updates',
      'Certificate of completion',
    ],
    subjects: ['Divorce', 'Children Law', 'Safeguarding', 'Domestic Abuse', 'International Family Law'],
  },

  academy_ip: {
    id: 'academy_ip',
    name: 'LexAI Academy — IP & Technology Law',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-7TP27582SP678264NNIZCHDY',
    category: 'academy',
    description: 'IP, tech law, AI regulation, and digital assets.',
    features: [
      'IP and technology law AI engine',
      'Copyright, trademark, and patent law',
      'AI regulation and liability',
      'Digital asset law (Bermuda DABA, MiCA)',
      'Data protection and privacy law',
      'Cybersecurity law',
      'Technology contracts and licensing',
      'Open source and software IP',
      'Social media and platform liability',
      'Weekly updates on AI/tech regulation',
      'Certificate of completion',
    ],
    subjects: ['Copyright', 'Patents', 'AI Law', 'Digital Assets', 'Data Protection', 'Tech Contracts'],
  },

  academy_tax: {
    id: 'academy_tax',
    name: 'LexAI Academy — Tax Law',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-1VY6463503138922HNIZCHTI',
    category: 'academy',
    description: 'Tax law across Caribbean, UK, US, and international frameworks.',
    features: [
      'Tax law AI research engine',
      'UK income and corporation tax',
      'US federal and state tax',
      'Bermuda — zero corporate tax framework',
      'Caribbean offshore tax structures',
      'International tax — OECD BEPS',
      'Tax treaty analysis',
      'VAT and indirect taxes',
      'Trust and estate tax planning',
      'Weekly legislative updates',
      'Certificate of completion',
    ],
    subjects: ['Income Tax', 'Corporation Tax', 'International Tax', 'VAT', 'Trust & Estate Tax'],
  },

  academy_caribbean: {
    id: 'academy_caribbean',
    name: 'LexAI Academy — Caribbean Law',
    price: 300,
    currency: 'USD',
    interval: 'MONTH',
    plan_id: 'P-7P782957TT3504412NIZCICQ',
    category: 'academy',
    description: 'The ONLY AI platform dedicated to Caribbean legal practice.',
    features: [
      'Caribbean law AI research engine — EXCLUSIVE',
      'Bermuda law (full depth)',
      'BVI, Cayman Islands, Bahamas',
      'Jamaica, Barbados, Trinidad & Tobago',
      'Eastern Caribbean Supreme Court',
      'Caribbean Court of Justice',
      'Privy Council decisions (Caribbean)',
      'Caribbean company and trust law',
      'Caribbean immigration and work permits',
      'Caribbean property and conveyancing',
      'Weekly Caribbean case law updates',
      'Certificate of completion',
    ],
    subjects: ['Bermuda Law', 'BVI/Cayman', 'Caribbean Jurisdictions', 'Privy Council', 'Caribbean Practice'],
    exclusive: true,
  },

  // ── BAR EXAM PREP ─────────────────────────────────────────────
  bar_attempt: {
    id: 'bar_attempt',
    name: 'LexAI Academy Bar Exam Prep',
    price: 99,
    currency: 'USD',
    interval: 'ONE_TIME',
    plan_id: null, // one-time payment via PayPal order
    category: 'exam',
    description: 'AI-powered Bar exam preparation. Per attempt.',
    features: [
      'Full AI-powered exam preparation',
      'Practice questions with AI feedback',
      'Case law summaries for exam topics',
      'Essay structure and technique',
      'Model answers with AI analysis',
      'Weak area identification',
      'Jurisdiction-specific exam prep',
      'Mock exam with scoring',
      '90-day access per attempt',
    ],
    per_attempt: true,
  },
};

// ── PAYPAL TOKEN ──────────────────────────────────────────────
async function getPayPalToken() {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('PayPal auth failed: ' + JSON.stringify(data));
  return data.access_token;
}

// ── GET ALL PLANS ─────────────────────────────────────────────
router.get('/plans', (req, res) => {
  const platform = Object.values(PLANS).filter(p => p.category === 'platform');
  const academy = Object.values(PLANS).filter(p => p.category === 'academy');
  const exam = Object.values(PLANS).filter(p => p.category === 'exam');
  res.json({ platform, academy, exam, total: Object.keys(PLANS).length });
});

// ── CREATE SUBSCRIPTION ────────────────────────────────────────
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { plan_id } = req.body;
    const plan = PLANS[plan_id];
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    // Bar exam is one-time payment
    if (plan.per_attempt) {
      return await createOneTimePayment(req, res, plan);
    }

    if (!process.env.PAYPAL_CLIENT_ID) {
      return res.status(503).json({ error: 'PayPal not configured' });
    }

    const token = await getPayPalToken();
    const appUrl = process.env.APP_URL || 'https://www.lexai.llc';

    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        plan_id: plan.plan_id,
        subscriber: {
          email_address: req.user.email,
        },
        application_context: {
          brand_name: 'LexAI',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${appUrl}/api/payments/success?plan=${plan_id}`,
          cancel_url: `${appUrl}/pricing`,
        },
      }),
    });

    const data = await response.json();
    const approveLink = data.links?.find(l => l.rel === 'approve');

    if (!approveLink) {
      console.error('[payments] PayPal subscription error:', JSON.stringify(data));
      return res.status(500).json({ error: 'PayPal error', detail: data.message || data });
    }

    // Log to DB
    await pool.query(
      `INSERT INTO subscriptions(user_id, plan, status, paypal_subscription_id)
       VALUES($1,$2,'pending',$3)
       ON CONFLICT DO NOTHING`,
      [req.user.id, plan_id, data.id]
    ).catch(e => console.error('[payments] DB log error:', e.message));

    res.json({
      approval_url: approveLink.href,
      subscription_id: data.id,
      plan: plan.name,
      price: plan.price,
    });
  } catch (err) {
    console.error('[payments] subscribe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── ONE-TIME PAYMENT (Bar Exam) ────────────────────────────────
async function createOneTimePayment(req, res, plan) {
  try {
    const token = await getPayPalToken();
    const appUrl = process.env.APP_URL || 'https://www.lexai.llc';

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: plan.price.toString(),
          },
          description: plan.name,
        }],
        application_context: {
          brand_name: 'LexAI',
          return_url: `${appUrl}/api/payments/success?plan=${plan.id}`,
          cancel_url: `${appUrl}/pricing`,
        },
      }),
    });

    const data = await response.json();
    const approveLink = data.links?.find(l => l.rel === 'approve');

    if (!approveLink) {
      return res.status(500).json({ error: 'PayPal error', detail: data.message || data });
    }

    res.json({ approval_url: approveLink.href, order_id: data.id, plan: plan.name, price: plan.price });
  } catch (err) {
    console.error('[payments] one-time error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// ── SUCCESS REDIRECT ──────────────────────────────────────────
router.get('/success', async (req, res) => {
  const { plan, subscription_id, token } = req.query;
  const planInfo = PLANS[plan];

  // Update subscription status in DB
  if (subscription_id && req.user) {
    await pool.query(
      `UPDATE subscriptions SET status='active' WHERE paypal_subscription_id=$1`,
      [subscription_id]
    ).catch(() => {});
    await pool.query(
      `UPDATE users SET plan=$1 WHERE id=$2`,
      [plan, req.user.id]
    ).catch(() => {});
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to LexAI</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0A0A14;color:#F0F0FF;font-family:'Outfit',sans-serif;
  display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.box{text-align:center;max-width:520px}
.icon{font-size:64px;margin-bottom:24px}
h1{font-size:32px;font-weight:800;color:#C9A84C;margin-bottom:12px}
p{color:#A0A0CC;line-height:1.7;margin-bottom:8px;font-size:16px}
.plan-name{color:#F0F0FF;font-weight:700;font-size:18px;
  background:#16162A;border:1px solid #2A2A44;border-radius:8px;
  padding:12px 24px;display:inline-block;margin:16px 0}
.btn{display:inline-block;background:#C9A84C;color:#000;
  padding:16px 40px;border-radius:10px;font-weight:700;font-size:16px;
  text-decoration:none;margin-top:24px;transition:background .2s}
.btn:hover{background:#F0D080}
.ref{font-size:12px;color:#606080;margin-top:16px}
</style>
</head>
<body>
<div class="box">
  <div class="icon">⚖️</div>
  <h1>Welcome to LexAI</h1>
  <p>Your subscription is now active.</p>
  <div class="plan-name">${planInfo?.name || plan || 'LexAI'}</div>
  <p>You now have access to the world's most comprehensive AI legal intelligence platform — covering all jurisdictions, all document types, safeguarding, human rights, evidence management, and more.</p>
  <a href="/" class="btn">Enter LexAI →</a>
  ${subscription_id ? `<p class="ref">Reference: ${subscription_id}</p>` : ''}
</div>
</body>
</html>`);
});

// ── WEBHOOK ───────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());
    console.log('[payments] webhook:', event.event_type);

    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subId = event.resource?.id;
      await pool.query(
        `UPDATE subscriptions SET status='active' WHERE paypal_subscription_id=$1`,
        [subId]
      ).catch(() => {});
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
      const subId = event.resource?.id;
      await pool.query(
        `UPDATE subscriptions SET status='cancelled' WHERE paypal_subscription_id=$1`,
        [subId]
      ).catch(() => {});
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[payments] webhook error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ── USER SUBSCRIPTION STATUS ───────────────────────────────────
router.get('/my-plan', requireAuth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT plan, docs_used_this_month FROM users WHERE id=$1`,
      [req.user.id]
    );
    const sub = await pool.query(
      `SELECT plan, status, paypal_subscription_id, started_at
       FROM subscriptions WHERE user_id=$1 AND status='active' ORDER BY started_at DESC LIMIT 1`,
      [req.user.id]
    );

    const planKey = r.rows[0]?.plan;
    const planInfo = PLANS[planKey] || null;

    res.json({
      plan: planKey || 'free',
      plan_name: planInfo?.name || 'Free Trial',
      price: planInfo?.price || 0,
      docs_used: r.rows[0]?.docs_used_this_month || 0,
      subscription: sub.rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.PLANS = PLANS;
