// LexAI AI Service - handles LLM interactions
// Uses Anthropic SDK for Claude Sonnet 4.6 access

const Anthropic = require('@anthropic-ai/sdk');
const { JURISDICTIONS, getJurisdictionInfo, getPrimary } = require('./jurisdictions');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Smart model routing for 98% margin
function selectModel(type, options) {
  if (options.model) return options.model
  const simpleTasks = ['proofread', 'translate', 'format', 'summarize']
  const complexTasks = ['ma', 'litigation', 'deep_research', 'strategy']
  if (simpleTasks.includes(type)) return 'claude-haiku-4-5-20251001'
  if (complexTasks.includes(type)) return 'claude-opus-4-8'
  return 'claude-sonnet-4-6'
}

async function generateDocument(prompt, type = 'contract', options = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: 'AI service not configured', draft: 'Please configure ANTHROPIC_API_KEY in environment variables.' }
  }

  const model = selectModel(type, options)

  try {
    const res = await anthropic.messages.create({
      model: model,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.3,
      system: 'You are LexAI, an expert legal AI assistant covering 290+ global jurisdictions with deep expertise in Bermuda, Caribbean, UK, US, Canada, Australia, and Commonwealth law. Provide precise, professional legal drafts and analysis appropriate for the specified jurisdiction.',
      messages: [
        { role: 'user', content: prompt }
      ]
    })
    return {
      draft: res.content[0]?.text || 'No response generated',
      model,
      usage: res.usage
    }
  } catch (err) {
    return { error: err.message, draft: '' }
  }
}

// New function for /api/draft endpoint - uses Claude Sonnet 4.6
async function draftDocument({ type, parties, jurisdiction, details, tone, userId }) {
  const documentTypes = {
    'nda': 'Non-Disclosure Agreement',
    'msa': 'Master Services Agreement',
    'employment': 'Employment Agreement',
    'contractor': 'Independent Contractor Agreement',
    'terms': 'Terms of Service',
    'privacy': 'Privacy Policy',
    'license': 'Software License Agreement',
    'partnership': 'Partnership Agreement',
    'llc': 'LLC Operating Agreement',
    'shareholders': 'Shareholders Agreement',
    'loan': 'Loan Agreement',
    'purchase': 'Asset Purchase Agreement',
    'consulting': 'Consulting Agreement',
    'letter': 'Demand Letter',
    'cease': 'Cease and Desist Letter',
    'memo': 'Legal Memorandum',
    'brief': 'Legal Brief',
    'custom': 'Custom Legal Document'
  }

  const docName = documentTypes[type] || type
  const jx = jurisdiction || 'Bermuda'
  
  const prompt = `Draft a ${docName} for ${jx} jurisdiction.

Parties: ${parties || 'To be determined'}

Details:
${details}

Tone: ${tone || 'professional'}

Provide a complete, professional legal document with all standard clauses, definitions, and boilerplate appropriate for ${jx}. Use proper legal formatting.`

  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      temperature: 0.3,
      system: `You are LexAI, an expert legal AI assistant covering 290+ global jurisdictions with deep expertise in Bermuda, Caribbean, UK, US, Canada, Australia, and Commonwealth law. Draft precise, professional legal documents with all standard clauses, definitions, and boilerplate appropriate for the specified jurisdiction.`, 
      messages: [{ role: 'user', content: prompt }]
    })
    return res.content[0]?.text || 'No response generated'
  } catch (err) {
    console.error('[ai] draftDocument error:', err.message)
    throw new Error(`Draft generation failed: ${err.message}`)
  }
}

module.exports = { generateDocument, selectModel, draftDocument, JURISDICTIONS, getJurisdictionInfo, getPrimary }
