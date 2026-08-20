// services/embeddings.js
// LexAI Embedding Service — zero-cost local first, cloud fallback
// Works with Ollama (nomic-embed-text) or OpenAI embeddings

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const EMBED_MODEL = process.env.EMBED_MODEL || 'nomic-embed-text';

async function embed(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('embed() requires a non-empty string');
  }

  // 1. Always try Ollama first (zero cost, fast, works even when AI_PROVIDER=anthropic)
  try {
    const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBED_MODEL, prompt: text })
    });
    if (!res.ok) throw new Error(`Ollama embed HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data.embedding)) return data.embedding;
    throw new Error('Ollama returned invalid embedding format');
  } catch (err) {
    console.error('[embeddings] Ollama failed:', err.message);
  }

  // 2. Fallback: OpenAI (if key exists)
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
      });
      const data = await res.json();
      if (data.data && data.data[0] && data.data[0].embedding) {
        return data.data[0].embedding;
      }
      throw new Error('OpenAI returned invalid embedding format');
    } catch (err) {
      console.error('[embeddings] OpenAI failed:', err.message);
    }
  }

  throw new Error(
    'No embedding provider available. ' +
    'Start Ollama (ollama pull nomic-embed-text) or set OPENAI_API_KEY.'
  );
}

module.exports = { embed };
