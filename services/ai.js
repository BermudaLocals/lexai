async function generateWithKimi({ type, jurisdiction, details, language }) {
  const apiKey = (process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '').trim();
  const base = (process.env.KIMI_BASE_URL || process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
  const model = (process.env.KIMI_MODEL || 'kimi-k3').trim();
  console.log(`[Kimi] Base=${base} Model=${model} Key=${apiKey.slice(0,8)}...`);
  if (!apiKey) throw new Error('KIMI_API_KEY not set on Railway');
  const prompt = `You are a legal drafting assistant for ${jurisdiction}. Task: Draft a ${type}. Details: ${details}. Language: ${language||'English'}. Professional legal formatting.`;
  const isK3 = model.includes('k3');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 1,
      max_tokens: 8000,
     ...(isK3? { reasoning_effort: 'high' } : {})
    })
  });
  if (!res.ok) throw new Error(`Kimi ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
async function generateDraft(p){ return await generateWithKimi(p); }
async function draftDocument(p){ return await generateWithKimi(p); }
async function draft(p){ return await generateWithKimi(p); }
module.exports = { generateDraft, draftDocument, draft, generateWithKimi, generate: generateWithKimi };
