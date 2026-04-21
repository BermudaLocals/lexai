// LexAI AI Service - handles LLM interactions
// Uses OpenRouter API for Claude Opus 4.7 access

const fetch = require('node-fetch')

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

async function generateDocument(prompt, type = 'contract', options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return { error: 'AI service not configured', draft: 'Please configure OPENROUTER_API_KEY in environment variables.' }
  }

  // Smart model routing for 98% margin
  const model = selectModel(type, options)

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.lexai.llc',
        'X-Title': 'LexAI'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are LexAI, an expert legal AI assistant specializing in Commonwealth law (Bermuda, Caribbean, UK, Canada, Australia). Provide precise, professional legal drafts and analysis.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.3
      })
    })
    const data = await res.json()
    return {
      draft: data.choices?.[0]?.message?.content || 'No response generated',
      model,
      usage: data.usage
    }
  } catch (err) {
    return { error: err.message, draft: '' }
  }
}

function selectModel(type, options) {
  if (options.model) return options.model
  const simpleTasks = ['proofread', 'translate', 'format', 'summarize']
  const complexTasks = ['ma', 'litigation', 'deep_research', 'strategy']
  if (simpleTasks.includes(type)) return 'anthropic/claude-haiku-4'
  if (complexTasks.includes(type)) return 'anthropic/claude-opus-4'
  return 'anthropic/claude-sonnet-4.5'
}

module.exports = { generateDocument, selectModel }
