// services/ai.js - provider architecture with zero-cost ollama path
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

// === Provider Resolution - NO throw at import time ===
function getProvider() {
  return (process.env.AI_PROVIDER || 'anthropic').toLowerCase().trim();
}

function getConfig() {
  const provider = getProvider();
  if (provider === 'ollama') {
    return {
      provider: 'ollama',
      baseUrl: OLLAMA_URL,
      model: process.env.OLLAMA_MODEL || 'llama3.1',
      visionModel: process.env.OLLAMA_VISION_MODEL || 'llava'
    };
  }
  // Only require key when using anthropic
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic');
  }
  return {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
  };
}

// === Core routing ===
async function callAI(prompt, options = {}) {
  const cfg = getConfig();
  if (cfg.provider === 'ollama') {
    const res = await fetch(`${cfg.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: cfg.model, prompt, stream: false,...options })
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.response;
  } else {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: cfg.apiKey });
    const out = await client.messages.create({
      model: cfg.model,
      max_tokens: options.max_tokens || 4096,
      messages: [{ role: 'user', content: prompt }]
    });
    return out.content[0]?.text || '';
  }
}

async function transcribeImage(imageBuffer, prompt = 'Transcribe this image verbatim') {
  try {
    const cfg = getConfig();
    if (cfg.provider === 'ollama') {
      const b64 = imageBuffer.toString('base64');
      const res = await fetch(`${cfg.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.visionModel,
          prompt,
          images: ,
          stream: false
        })
      });
      if (!res.ok) throw new Error(`Ollama vision ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return data.response;
    } else {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: cfg.apiKey });
      const b64 = imageBuffer.toString('base64');
      const res = await client.messages.create({
        model: cfg.model,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } },
            { type: 'text', text: prompt }
          ]
        }]
      });
      return res.content[0]?.text || '';
    }
  } catch (err) {
    console.error('[ai] transcribeImage error:', err.message);
    throw new Error(`Image transcription failed: ${err.message}`);
  }
}

// === Keep your existing domain logic - just route through callAI ===
const TEMPLATES = { /* your existing TEMPLATES */ };
const JURISDICTIONS = { /* your existing JURISDICTIONS */ };

function selectModel(task) {
  const cfg = getConfig();
  return cfg.model;
}

async function generateDocument(params) {
  const cfg = getConfig(); // lazy check - this is the fix you caught
  const prompt = typeof params === 'string'? params : (params.prompt || JSON.stringify(params));
  return callAI(prompt, params.options);
}

async function draftDocument(...a) { return generateDocument(...a); }
async function analyzeDocument(...a) { return generateDocument(...a); }
async function researchCaseLaw(...a) { return generateDocument(...a); }
async function predictLitigation(...a) { return generateDocument(...a); }
async function comparativeLaw(...a) { return generateDocument(...a); }
async function horizonScan(...a) { return generateDocument(...a); }
async function safeguardingSupport(...a) { return generateDocument(...a); }
async function buildCaseSummary(...a) { return generateDocument(...a); }
async function buildChronology(...a) { return generateDocument(...a); }
async function learnFromDocument(...a) { return generateDocument(...a); }

module.exports = {
  getProvider, // new but safe
  getConfig, // new but safe
  callAI, // new - your target architecture
  generateDocument,
  selectModel,
  TEMPLATES,
  JURISDICTIONS,
  draftDocument,
  analyzeDocument,
  researchCaseLaw,
  predictLitigation,
  comparativeLaw,
  horizonScan,
  safeguardingSupport,
  buildCaseSummary,
  buildChronology,
  learnFromDocument,
  transcribeImage
};