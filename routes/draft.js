// FILE: FULL REPLACEMENT - Kimi K3 international
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
  console.log(`[Kimi] Base=${base} Model=${model} Key=${apiKey.slice(0,8)}...`);
  if (!apiKey) throw new Error('KIMI_API_KEY not set');
  const prompt = `You are a legal drafting assistant for ${jurisdiction}. Task: Draft a ${type}. Details: ${details}. Language: ${language||'English'}. Requirements: Valid under ${jurisdiction} law, professional formatting, include parties, recitals, clauses, signatures. Return only document text.`;
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

const express = require('express');
const router = express.Router();
let authenticate = (req, res, next) => next();
try {
  const auth = require('../middleware/auth');
  if (auth.authenticate) authenticate = auth.authenticate;
  else if (auth.default) authenticate = auth.default;
} catch (e) {
  try { const auth2 = require('./auth'); if (auth2.authenticate) authenticate = auth2.authenticate; } catch {}
}

router.post('/', authenticate, async (req, res) => {
  try {
    const { type, jurisdiction, details, language } = req.body;
    if (!type || !jurisdiction) return res.status(400).json({ error: 'type and jurisdiction required' });
    const jobId = crypto.randomUUID();
    jobs.set(jobId, { status: 'processing', createdAt: Date.now(), request: { type, jurisdiction, details, language } });
    res.status(202).json({ jobId, status: 'processing', pollUrl: `/api/draft/${jobId}` });
    (async () => {
      try {
        console.log(`[Job ${jobId}] Starting Kimi for ${type} in ${jurisdiction}`);
        const doc = await generateWithKimi({ type, jurisdiction, details, language });
        console.log(`[Job ${jobId}] Complete ${doc.length} chars`);
        jobs.set(jobId, { status: 'complete', createdAt: jobs.get(jobId).createdAt, completedAt: Date.now(), doc, request: { type, jurisdiction, details, language } });
      } catch (err) {
        console.error(`[Job ${jobId}] Failed:`, err.message);
        const existing = jobs.get(jobId);
        jobs.set(jobId, { status: 'failed', createdAt: existing?.createdAt || Date.now(), error: err.message, request: existing?.request });
      }
    })();
  } catch (err) {
    console.error('Failed to start job:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to start draft generation' });
  }
});

router.get('/:jobId', authenticate, (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ status: 'not_found', error: 'Job not found' });
  res.json(job);
});

module.exports = router;
