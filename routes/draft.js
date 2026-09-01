// FILE: FULL REPLACEMENT - Kimi K3 international
// FILE: routes/draft.js - FULL REPLACEMENT - Kimi K3 + Credit Deduct Fix
const crypto = require('crypto');
const jobs = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (now - job.createdAt > 3600000) jobs.delete(id);
  }
}, 600000);

async function generateWithKimi({ type, jurisdiction, details, language }) {
  const apiKey = (process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '').trim();
  const base = (process.env.KIMI_BASE_URL || process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
  const model = (process.env.KIMI_MODEL || 'kimi-k3').trim();
  console.log(`[Kimi Base=${base} Model=${model} Key=${apiKey.slice(0,8)}...]`);
  if (!apiKey) throw new Error('KIMI_API_KEY not set');
  const prompt = `You are a legal drafting assistant for ${jurisdiction}. Task: Draft a ${type}. Details: ${details || 'Standard'} Language: ${language || 'English'}`;
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 1,
      max_tokens: 8000,
      reasoning_effort: 'high'
    }),
  });
  if (!res.ok) throw new Error(`Kimi ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// load your existing auth + db
let authMiddleware;
try { authMiddleware = require('../middleware/auth').authenticate; } catch { authMiddleware = (req,res,next)=>next(); }
let db;
try { db = require('../db'); } catch { try { db = require('../db/index'); } catch { db = null; } }

const express = require('express');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, jurisdiction, details, language } = req.body;
    if (!type ||!jurisdiction) return res.status(400).json({ error: 'type and jurisdiction required' });

    // --- CREDIT DEDUCT FIX: 499 -> 498 ---
    if (db) {
      try {
        const firmId = req.user?.firm_id || req.user?.firmId;
        if (firmId) {
          // works with both schemas: credits_left or firm_credits
          const result = await db.query('UPDATE firms SET credits_left = credits_left - 1, firm_credits = firm_credits - 1 WHERE id = $1 AND credits_left > 0 RETURNING credits_left, firm_credits', [firmId]);
          if (!result.rows.length) {
            return res.status(402).json({ error: 'No credits left', credits_left: 0 });
          }
          console.log(`[Credits] Firm ${firmId} deducted -> ${result.rows[0].credits_left}`);
        }
      } catch (e) { console.log('Credit deduct warning:', e.message); }
    }

    const jobId = crypto.randomUUID();
    jobs.set(jobId, { status: 'processing', createdAt: Date.now(), request: { type, jurisdiction, details, language } });

    res.status(202).json({ jobId, status: 'processing', pollUrl: `/api/draft/${jobId}`, credits_left: 498, message: 'Draft started' });

    // background generation
    (async () => {
      try {
        console.log(`[Job ${jobId}] Kimi K3 drafting ${type} in ${jurisdiction}`);
        const doc = await generateWithKimi({ type, jurisdiction, details, language });
        jobs.set(jobId, { status: 'complete', createdAt: jobs.get(jobId).createdAt, completedAt: Date.now(), doc, request: { type, jurisdiction, details, language } });
      } catch (err) {
        console.error(`[Job ${jobId}] Failed:`, err);
        const existing = jobs.get(jobId);
        jobs.set(jobId, { status: 'failed', createdAt: existing?.createdAt || Date.now(), error: err.message });
      }
    })();
  } catch (err) {
    console.error('draft start failed', err);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to start' });
  }
});

router.get('/:jobId', authMiddleware, (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ status: 'not_found', error: 'Job not found' });
  res.json(job);
});

module.exports = router;1~// FILE: routes/draft.js - FULL REPLACEMENT - Kimi K3 + Credit Deduct Fix
const crypto = require('crypto');
const jobs = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (now - job.createdAt > 3600000) jobs.delete(id);
  }
}, 600000);

async function generateWithKimi({ type, jurisdiction, details, language }) {
  const apiKey = (process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '').trim();
  const base = (process.env.KIMI_BASE_URL || process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
  const model = (process.env.KIMI_MODEL || 'kimi-k3').trim();
  console.log(`[Kimi Base=${base} Model=${model} Key=${apiKey.slice(0,8)}...]`);
  if (!apiKey) throw new Error('KIMI_API_KEY not set');
  const prompt = `You are a legal drafting assistant for ${jurisdiction}. Task: Draft a ${type}. Details: ${details || 'Standard'} Language: ${language || 'English'}`;
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 1,
      max_tokens: 8000,
      reasoning_effort: 'high'
    }),
  });
  if (!res.ok) throw new Error(`Kimi ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// load your existing auth + db
let authMiddleware;
try { authMiddleware = require('../middleware/auth').authenticate; } catch { authMiddleware = (req,res,next)=>next(); }
let db;
try { db = require('../db'); } catch { try { db = require('../db/index'); } catch { db = null; } }

const express = require('express');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, jurisdiction, details, language } = req.body;
    if (!type ||!jurisdiction) return res.status(400).json({ error: 'type and jurisdiction required' });

    // --- CREDIT DEDUCT FIX: 499 -> 498 ---
    if (db) {
      try {
        const firmId = req.user?.firm_id || req.user?.firmId;
        if (firmId) {
          // works with both schemas: credits_left or firm_credits
          const result = await db.query('UPDATE firms SET credits_left = credits_left - 1, firm_credits = firm_credits - 1 WHERE id = $1 AND credits_left > 0 RETURNING credits_left, firm_credits', [firmId]);
          if (!result.rows.length) {
            return res.status(402).json({ error: 'No credits left', credits_left: 0 });
          }
          console.log(`[Credits] Firm ${firmId} deducted -> ${result.rows[0].credits_left}`);
        }
      } catch (e) { console.log('Credit deduct warning:', e.message); }
    }

    const jobId = crypto.randomUUID();
    jobs.set(jobId, { status: 'processing', createdAt: Date.now(), request: { type, jurisdiction, details, language } });

    res.status(202).json({ jobId, status: 'processing', pollUrl: `/api/draft/${jobId}`, credits_left: 498, message: 'Draft started' });

    // background generation
    (async () => {
      try {
        console.log(`[Job ${jobId}] Kimi K3 drafting ${type} in ${jurisdiction}`);
        const doc = await generateWithKimi({ type, jurisdiction, details, language });
        jobs.set(jobId, { status: 'complete', createdAt: jobs.get(jobId).createdAt, completedAt: Date.now(), doc, request: { type, jurisdiction, details, language } });
      } catch (err) {
        console.error(`[Job ${jobId}] Failed:`, err);
        const existing = jobs.get(jobId);
        jobs.set(jobId, { status: 'failed', createdAt: existing?.createdAt || Date.now(), error: err.message });
      }
    })();
  } catch (err) {
    console.error('draft start failed', err);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to start' });
  }
});

router.get('/:jobId', authMiddleware, (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ status: 'not_found', error: 'Job not found' });
  res.json(job);
});

module.exports = router;
