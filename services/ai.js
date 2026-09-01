async function generateWithKimi({ type, jurisdiction, details, language }) {
  const apiKey = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
  if (!apiKey) throw new Error('KIMI_API_KEY not set on Railway');
  const prompt = `You are a legal drafting assistant for ${jurisdiction}. Task: Draft a ${type}. Details: ${details}. Language: ${language||'English'}. Professional legal formatting.`;
  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'moonshot-v1-128k', messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 8000 })
  });
  if (!res.ok) throw new Error(`Kimi ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
async function generateDraft(p){ return await generateWithKimi(p); }
async function draftDocument(p){ return await generateWithKimi(p); }
async function draft(p){ return await generateWithKimi(p); }
module.exports = { generateDraft, draftDocument, draft, generateWithKimi, generate: generateWithKimi };
