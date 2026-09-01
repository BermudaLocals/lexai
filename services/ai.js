const TEMPLATES = {
  NDA: 'Non-Disclosure Agreement', nda: 'Non-Disclosure Agreement',
  CONTRACT: 'Contract', contract: 'Contract',
  EMPLOYMENT: 'Employment Agreement', LEASE: 'Lease Agreement',
  PARTNERSHIP: 'Partnership Agreement', TERMS: 'Terms of Service',
  PRIVACY: 'Privacy Policy', WILL: 'Will', POA: 'Power of Attorney'
};
const JURISDICTIONS = {
  Bermuda: 'Bermuda Law', UK: 'UK Law', USA: 'US Law', General: 'General', Multiple: 'Multiple'
};

async function generateWithKimi({ type, jurisdiction, details, language }) {
  const apiKey = (process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '').trim();
  const base = (process.env.KIMI_BASE_URL || process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
  const model = (process.env.KIMI_MODEL || 'kimi-k3').trim();
  console.log(`[Kimi] Base=${base} Model=${model} Key=${apiKey.slice(0,8)}...`);
  if (!apiKey) throw new Error('KIMI_API_KEY not set on Railway');
  const prompt = `You are a legal drafting assistant for ${jurisdiction}. Task: Draft a ${type}. Details: ${details}. Language: ${language||'English'}. Professional legal formatting.`;
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 1, max_tokens: 8000, reasoning_effort: 'high' })
  });
  if (!res.ok) throw new Error(`Kimi ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function draftDocument(p){ return await generateWithKimi(p); }
async function generateDraft(p){ return await generateWithKimi(p); }
async function draft(p){ return await generateWithKimi(p); }
async function generateDocument(prompt){
  const apiKey = (process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '').trim();
  const base = (process.env.KIMI_BASE_URL || process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
  const model = (process.env.KIMI_MODEL || 'kimi-k3').trim();
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 1, max_tokens: 1500 })
  });
  const data = await res.json();
  return { draft: data.choices?.[0]?.message?.content || '' };
}
async function researchCaseLaw(p){ return await generateWithKimi({ type: 'RESEARCH', jurisdiction: 'General', details: p.query }); }
async function analyzeDocument(p){ return await generateWithKimi({ type: 'ANALYSIS', jurisdiction: p.jurisdiction||'General', details: p.content }); }
async function safeguardingSupport(p){ return await generateWithKimi({ type: 'SAFEGUARDING', jurisdiction: p.jurisdiction||'General', details: p.facts }); }
async function buildCaseSummary(p){ return await generateWithKimi({ type: 'CASE_SUMMARY', jurisdiction: p.jurisdiction||'General', details: p.case_facts }); }
async function buildChronology(p){ return await generateWithKimi({ type: 'CHRONOLOGY', jurisdiction: p.jurisdiction||'General', details: p.events }); }
async function horizonScan(p){ return await generateWithKimi({ type: 'HORIZON', jurisdiction: 'Multiple', details: JSON.stringify(p) }); }
async function predictLitigation(p){ return await generateWithKimi({ type: 'PREDICTION', jurisdiction: p.jurisdiction||'General', details: p.facts }); }
async function comparativeLaw(p){ return await generateWithKimi({ type: 'COMPARATIVE', jurisdiction: 'Multiple', details: p.topic }); }
async function learnFromDocument(){ return true; }

module.exports = {
  TEMPLATES, JURISDICTIONS, generateDraft, draftDocument, draft, generateWithKimi, generate: generateWithKimi,
  generateDocument, researchCaseLaw, analyzeDocument, safeguardingSupport, buildCaseSummary, buildChronology, horizonScan, predictLitigation, comparativeLaw, learnFromDocument
};
