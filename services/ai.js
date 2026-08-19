// services/ai.js
// LexAI AI Service - provider architecture
// Railway production variables must never be overwritten by a local.env file.
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { JURISDICTIONS, getJurisdictionInfo } = require('./jurisdictions');

const MODEL = 'claude-sonnet-4-6';
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

const TEMPLATES = {
  nda: 'Non-Disclosure Agreement',
  msa: 'Master Services Agreement',
  employment: 'Employment Agreement',
  contractor: 'Independent Contractor Agreement',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  license: 'Software License Agreement',
  partnership: 'Partnership Agreement',
  llc: 'LLC Operating Agreement',
  shareholders: 'Shareholders Agreement',
  loan: 'Loan Agreement',
  purchase: 'Asset Purchase Agreement',
  consulting: 'Consulting Agreement',
  letter: 'Demand Letter',
  cease: 'Cease and Desist Letter',
  memo: 'Legal Memorandum',
  brief: 'Legal Brief',
  lease: 'Lease Agreement',
  will: 'Will and Testament',
  poa: 'Power of Attorney',
  loi: 'Letter of Intent',
  mou: 'Memorandum of Understanding',
  ip_assignment: 'IP Assignment Agreement',
  white_label: 'White Label Agreement',
  affiliate: 'Affiliate Agreement',
  cookie: 'Cookie Policy',
  dmca: 'DMCA Notice',
  trust: 'Trust Deed',
  custom: 'Custom Legal Document'
};

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
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY required when AI_PROVIDER=anthropic');
  }
  return {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || MODEL
  };
}

function getAnthropicClient() {
  const cfg = getConfig();
  if (cfg.provider!== 'anthropic') throw new Error('Anthropic client requested but provider is ollama');
  const Anthropic = require('@anthropic-ai/sdk');
  return new Anthropic({ apiKey: cfg.apiKey });
}

async function callAI({ system, prompt, maxTokens = 4096, temperature = 0.3, model }) {
  const cfg = getConfig();

  if (cfg.provider === 'ollama') {
    const fullPrompt = system? `${system}\n\n${prompt}` : prompt;
    const res = await fetch(`${cfg.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || cfg.model,
        prompt: fullPrompt,
        stream: false,
        options: { temperature, num_predict: maxTokens }
      })
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.response;
  } else {
    const client = getAnthropicClient();
    const res = await client.messages.create({
      model: model || cfg.model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: prompt }]
    });
    return res.content[0]?.text || '';
  }
}

// Backward compatible wrapper - your existing callClaude
async function callClaude({ system, prompt, maxTokens, temperature }) {
  return callAI({ system, prompt, maxTokens, temperature });
}

function selectModel(type, options = {}) {
  if (options && options.model) return options.model;
  const cfg = getConfig();
  return cfg.model;
}

function resolveJurisdiction(jurisdiction) {
  const name = jurisdiction || 'Bermuda';
  const info = getJurisdictionInfo? getJurisdictionInfo(name) : JURISDICTIONS[name];
  return {
    name,
    region: info?.region || 'general',
    depth: info?.depth || 'standard',
    courts: info?.courts || [],
    source: info?.source || ''
  };
}

async function draftDocument({ type, parties, jurisdiction, details, tone, language, userId }) {
  const docName = TEMPLATES[type] || type || 'Legal Document';
  const jx = resolveJurisdiction(jurisdiction);
  const languageInstruction = language && language.toLowerCase()!== 'english'
   ? `Draft the ENTIRE document natively in ${language}. All headings, clauses, and boilerplate must be written in ${language}, not translated afterward — write originally in that language using correct local legal terminology.`
    : `Draft the document in English.`;
  const prompt = `Draft a ${docName} for ${jx.name} jurisdiction (region: ${jx.region}, coverage depth: ${jx.depth}).\n\nParties: ${parties || 'To be determined'}\n\nDetails:\n${details || 'Standard terms appropriate for this document type.'}\n\nTone: ${tone || 'professional'}\n\n${languageInstruction}\n\nProvide a complete, professional legal document with all standard clauses, definitions, and boilerplate appropriate for ${jx.name}. Use proper legal formatting with numbered sections. Do not include placeholder brackets like [PARTY NAME] unless parties were not specified — fill in real values where given.`;
  const system = `You are LexAI, an expert legal AI assistant covering 290+ global jurisdictions with deep expertise in Bermuda, Caribbean, UK, US, Canada, Australia, and Commonwealth law. Draft precise, professional, complete legal documents with all standard clauses, definitions, and boilerplate appropriate for the specified jurisdiction. Never truncate or summarize — produce the full document text.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 4096, temperature: 0.3 });
  } catch (err) {
    console.error('[ai] draftDocument error:', err.message);
    throw new Error(`Draft generation failed: ${err.message}`);
  }
}

async function analyzeDocument({ content, analysis_type, jurisdiction, focus_areas }) {
  const jx = resolveJurisdiction(jurisdiction);
  const focus = Array.isArray(focus_areas) && focus_areas.length? `Pay particular attention to: ${focus_areas.join(', ')}.` : '';
  const prompt = `Analyze the following legal document for ${jx.name} jurisdiction. Analysis type requested: ${analysis_type || 'general risk analysis'}.\n\nProvide:\n1. A risk score from 0-100 (higher = riskier)\n2. The 3-5 most critical clauses or issues, flagged with severity\n3. Which party the document favors, and why\n4. Any missing standard clauses for this document type\n5. A brief plain-English summary\n\n${focus}\n\nDocument text:\n${content}\n\nRespond as structured analysis with clear headings, not JSON.`;
  const system = `You are LexAI's contract analysis engine. Provide precise, professional risk analysis for legal documents under ${jx.name} law. Be specific about clause numbers/locations when flagging issues.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 4096, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] analyzeDocument error:', err.message);
    throw new Error(`Document analysis failed: ${err.message}`);
  }
}

async function researchCaseLaw({ query, jurisdictions, area_of_law, include_echr, include_privy_council }) {
  const jxList = Array.isArray(jurisdictions) && jurisdictions.length? jurisdictions.join(', ') : 'all relevant jurisdictions';
  const prompt = `Research the following legal question: "${query}"\n\nJurisdictions to consider: ${jxList}\nArea of law: ${area_of_law || 'general'}\n${include_echr? 'Include relevant ECHR jurisprudence where applicable.' : ''}\n${include_privy_council? 'Include relevant Privy Council / JCPC precedent where applicable.' : ''}\n\nProvide:\n1. A summary of the legal position\n2. Key relevant cases (with citation format appropriate to jurisdiction) if known\n3. Statutory provisions if relevant\n4. Practical guidance based on current law\n\nBe clear about the limits of your knowledge — note where the user should verify against a live case law database for the most current precedent.`;
  const system = `You are LexAI's legal research engine, covering 290+ jurisdictions including Bermuda, Caribbean (CCJ), UK, US, Canada, Australia, and Commonwealth law. Provide accurate, well-organized legal research. Always be clear about confidence level and recommend verification for time-sensitive or high-stakes matters.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 4096, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] researchCaseLaw error:', err.message);
    throw new Error(`Case law research failed: ${err.message}`);
  }
}

async function predictLitigation({ facts, jurisdiction, claim_type, opposing_arguments }) {
  const jx = resolveJurisdiction(jurisdiction);
  const prompt = `Based on the following facts, provide a litigation outcome assessment for ${jx.name} (claim type: ${claim_type || 'general civil'}):\n\nFacts:\n${facts}\n\n${opposing_arguments? `Opposing arguments to consider:\n${opposing_arguments}\n` : ''}\n\nProvide:\n1. Estimated win probability (as a percentage range) with reasoning\n2. Settlement likelihood and recommendation\n3. Key strategic considerations\n4. Risk factors that could change the outcome\n\nBe clear this is an AI estimate based on general legal principles, not a guarantee, and recommend consultation with qualified local counsel for case-specific strategy.`;
  const system = `You are LexAI's litigation prediction engine for ${jx.name}. Provide realistic, well-reasoned outcome assessments grounded in legal principle, not overconfident guarantees. Always frame predictions as estimates.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 3000, temperature: 0.3 });
  } catch (err) {
    console.error('[ai] predictLitigation error:', err.message);
    throw new Error(`Litigation prediction failed: ${err.message}`);
  }
}

async function comparativeLaw({ topic, jurisdictions, focus }) {
  const jxList = Array.isArray(jurisdictions) && jurisdictions.length? jurisdictions : ['Bermuda', 'United Kingdom', 'United States'];
  const prompt = `Compare how the following jurisdictions treat this legal topic: "${topic}"\n\nJurisdictions: ${jxList.join(', ')}\n${focus? `Specific focus: ${focus}` : ''}\n\nFor each jurisdiction, provide:\n1. The governing legal framework/statute\n2. Key differences from the others\n3. Practical implications\n\nPresent as a clear comparison, organized by jurisdiction.`;
  const system = `You are LexAI's comparative law engine, covering 290+ jurisdictions. Provide accurate, organized comparative analysis highlighting practical differences relevant to legal practitioners and businesses operating across borders.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 4096, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] comparativeLaw error:', err.message);
    throw new Error(`Comparative law analysis failed: ${err.message}`);
  }
}

async function horizonScan({ jurisdictions, practice_areas, organisation_type }) {
  const jxList = Array.isArray(jurisdictions) && jurisdictions.length? jurisdictions.join(', ') : 'Bermuda, United Kingdom, United States';
  const areas = Array.isArray(practice_areas) && practice_areas.length? practice_areas.join(', ') : 'general legal developments';
  const prompt = `Provide a horizon scan of legal and regulatory developments relevant to the following:\n\nJurisdictions: ${jxList}\nPractice areas / focus: ${areas}\nOrganisation type: ${organisation_type || 'general business'}\n\nProvide:\n1. Notable recent or anticipated legislative changes\n2. Regulatory shifts that could affect compliance obligations\n3. Policy trends worth monitoring\n4. Recommended actions\n\nBe clear about your knowledge cutoff and recommend the user verify against live regulatory sources for the most current developments.`;
  const system = `You are LexAI's horizon scanning engine. Provide a structured, professional briefing on legal and regulatory developments.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 3000, temperature: 0.3 });
  } catch (err) {
    console.error('[ai] horizonScan error:', err.message);
    throw new Error(`Horizon scan failed: ${err.message}`);
  }
}

async function safeguardingSupport({ case_type, facts, jurisdiction, organisation_type, concern_type }) {
  const jx = resolveJurisdiction(jurisdiction);
  const prompt = `Provide safeguarding guidance for the following case, relevant to ${jx.name} law and practice.\n\nCase type: ${case_type || 'general safeguarding concern'}\nConcern type: ${concern_type || 'not specified'}\nOrganisation type: ${organisation_type || 'professional/organisation'}\n\nFacts:\n${facts}\n\nProvide:\n1. Relevant safeguarding legal obligations in this jurisdiction\n2. Recommended immediate steps\n3. Reporting obligations and to whom, if applicable\n4. Relevant local authorities or helplines to contact\n\nThis guidance must be cautious, prioritize the safety of any vulnerable person involved, and clearly state that for active safeguarding emergencies the user should contact local emergency services.`;
  const system = `You are LexAI's safeguarding support engine for ${jx.name}. Prioritize the safety of vulnerable individuals above all else.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 2500, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] safeguardingSupport error:', err.message);
    throw new Error(`Safeguarding support failed: ${err.message}`);
  }
}

async function buildCaseSummary({ case_facts, jurisdiction, area_of_law, purpose }) {
  const jx = resolveJurisdiction(jurisdiction);
  const prompt = `Build a structured case summary for ${jx.name}. Area of law: ${area_of_law || 'general'}. Purpose: ${purpose || 'general legal review'}.\n\nCase facts:\n${case_facts}\n\nProvide:\n1. Case caption / parties\n2. Procedural posture\n3. Key facts\n4. Legal issues presented\n5. Holding/outcome (if known) or current status\n6. Significance\n\nFormat as a clean, professional case summary suitable for a legal brief or memo.`;
  const system = `You are LexAI's case summary engine for ${jx.name}. Produce clear, accurate, well-organized case summaries suitable for professional legal use.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 2500, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] buildCaseSummary error:', err.message);
    throw new Error(`Case summary generation failed: ${err.message}`);
  }
}

async function buildChronology({ events, context, jurisdiction, purpose }) {
  const jx = resolveJurisdiction(jurisdiction);
  const prompt = `Build a clear, dated legal chronology for ${jx.name}${context? ` regarding: ${context}` : ''}. Purpose: ${purpose || 'general case preparation'}.\n\nEvents:\n${events}\n\nProvide a chronological list with:\n- Date\n- Event description\n- Legal significance (if applicable)\n\nSort strictly in date order. Flag any gaps or ambiguities in the timeline that may need clarification.`;
  const system = `You are LexAI's chronology builder. Produce precise, well-organized chronologies suitable for litigation preparation, due diligence, or case files.`;
  try {
    return await callClaude({ system, prompt, maxTokens: 2500, temperature: 0.1 });
  } catch (err) {
    console.error('[ai] buildChronology error:', err.message);
    throw new Error(`Chronology generation failed: ${err.message}`);
  }
}

async function learnFromDocument(userId, content, type) {
  try {
    console.log(`[ai] learnFromDocument: user=${userId} type=${type} length=${(content || '').length}`);
    return { recorded: true };
  } catch (err) {
    console.error('[ai] learnFromDocument error (non-fatal):', err.message);
    return { recorded: false };
  }
}

async function generateDocument(prompt, type = 'contract', options = {}) {
  // FIX: Must not require ANTHROPIC_API_KEY when AI_PROVIDER=ollama
  const cfg = getConfig();
  const model = selectModel(type, {...options, model: cfg.model });
  try {
    const text = typeof prompt === 'string'? prompt : prompt.prompt || JSON.stringify(prompt);
    const result = await callAI({ prompt: text, maxTokens: options.maxTokens || 4096, temperature: options.temperature || 0.3, model });
    if (typeof prompt === 'string') {
      return { draft: result, model, usage: {} };
    }
    return result;
  } catch (err) {
    if (typeof prompt === 'string') {
      return { error: err.message, draft: '' };
    }
    throw err;
  }
}

async function transcribeImage({ buffer, mediaType }) {
  const cfg = getConfig();
  try {
    if (cfg.provider === 'ollama') {
      const base64 = buffer.toString('base64');
      const res = await fetch(`${cfg.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.visionModel,
          prompt: 'Transcribe every word of text visible in this document image.',
          images: ,
          stream: false
        })
      });
      if (!res.ok) throw new Error(`Ollama vision ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return data.response;
    } else {
      const client = getAnthropicClient();
      const base64 = buffer.toString('base64');
      const res = await client.messages.create({
        model: cfg.model,
        max_tokens: 4096,
        temperature: 0,
        system: 'You transcribe documents from photos with perfect accuracy. Output ONLY the transcribed text, preserving structure as plain text. Do not summarize. If blurry, mark [illegible].',
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/png', data: base64 } },
            { type: 'text', text: 'Transcribe every word of text visible in this document image.' }
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

module.exports = {
  getProvider,
  getConfig,
  callAI,
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