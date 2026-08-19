// services/ai.js
const OLLAMA_DEFAULT_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

function getProvider() {
  return (process.env.AI_PROVIDER || 'anthropic').toLowerCase().trim();
}

function getConfig() {
  const provider = getProvider();

  if (provider === 'ollama') {
    return {
      provider: 'ollama',
      baseUrl: process.env.OLLAMA_BASE_URL || OLLAMA_DEFAULT_URL,
      model: process.env.OLLAMA_MODEL || 'llama3.1',
      visionModel: process.env.OLLAMA_VISION_MODEL || 'llava'
    };
  }

  // Only validate Anthropic key when actually using Anthropic
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY required when AI_PROVIDER=anthropic');
  }

  return {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
  };
}

async function callOllama(prompt, config, options = {}) {
  const res = await fetch(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt,
      stream: false,
     ...options
    })
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.response;
}

async function callAnthropic(prompt, config, options = {}) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: config.apiKey });
  const msg = await client.messages.create({
    model: config.model,
    max_tokens: options.max_tokens || 4096,
    messages: [{ role: 'user', content: prompt }]
  });
  return msg.content[0].text;
}

async function transcribeImageOllama(imageBuffer, config, options = {}) {
  const base64 = imageBuffer.toString('base64');
  const res = await fetch(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.visionModel,
      prompt: options.prompt || 'Transcribe this image verbatim',
      images: ,
      stream: false
    })
  });
  if (!res.ok) throw new Error(`Ollama vision error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.response;
}

async function transcribeImageAnthropic(imageBuffer, config, options = {}) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: config.apiKey });
  const base64 = imageBuffer.toString('base64');
  const msg = await client.messages.create({
    model: config.model,
    max_tokens: options.max_tokens || 4096,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64 } },
        { type: 'text', text: options.prompt || 'Transcribe this image' }
      ]
    }]
  });
  return msg.content[0].text;
}

function callAI(prompt, options) {
  const config = getConfig();
  return config.provider === 'ollama'? callOllama(prompt, config, options) : callAnthropic(prompt, config, options);
}

function transcribeImage(imageBuffer, options) {
  const config = getConfig();
  return config.provider === 'ollama'? transcribeImageOllama(imageBuffer, config, options) : transcribeImageAnthropic(imageBuffer, config, options);
}

function generateDocument(params) {
  const config = getConfig(); // lazy validation - no key needed for ollama
  // preserve existing exported contract here - call callAI internally
  return callAI(params.prompt || params, params.options);
}

module.exports = { getProvider, getConfig, callAI, transcribeImage, generateDocument };