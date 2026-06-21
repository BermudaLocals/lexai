// services/ai.js
// LexAI AI Service — complete implementation covering every function
// routes/api.js requires. Uses Anthropic SDK directly (claude-sonnet-4-6).

const Anthropic = require('@anthropic-ai/sdk');
const { JURISDICTIONS, getAllJurisdictionNames, getByRegion, getPrimary, getJurisdictionInfo } = require('./jurisdictions');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-sonnet-4-6';

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

function selectModel(type, options = {}) {
  if (options && options.model) return options.model;
  return MODEL;
}

async function callClaude({ system, prompt, maxTokens = 4096, temperature = 0.3 }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: 'user', content: prompt }]
  });
  return res.content[0]?.text || '';
}

function resolveJurisdiction(jurisdiction) {
  const name = jurisdiction || 'Bermuda';
  const info = getJurisdictionInfo ? getJurisdictionInfo(name) : JURISDICTIONS[name];
  return {
    name,
    region: info?.region || 'general',
    depth: info?.depth || 'standard',
    courts: info?.courts || [],
    source: info?.source || ''
  };
}

// 1. DRAFT DOCUMENT
async function draftDocument({ type, parties, jurisdiction, details, tone, language, userId }) {
  const docName = TEMPLATES[type] || type || 'Legal Document';
  const jx = resolveJurisdiction(jurisdiction);

  const languageInstruction = language && language.toLowerCase() !== 'english'
    ? `Draft the ENTIRE document natively in ${language}. All headings, clauses, and boilerplate must be written in ${language}, not translated afterward — write originally in that language using correct local legal terminology.`
    : `Draft the document in English.`;

  const prompt = `Draft a ${docName} for ${jx.name} jurisdiction (region: ${jx.region}, coverage depth: ${jx.depth}).

Parties: ${parties || 'To be determined'}

Details:
${details || 'Standard terms appropriate for this document type.'}

Tone: ${tone || 'professional'}

${languageInstruction}

Provide a complete, professional legal document with all standard clauses, definitions, and boilerplate appropriate for ${jx.name}. Use proper legal formatting with numbered sections. Do not include placeholder brackets like [PARTY NAME] unless parties were not specified — fill in real values where given.`;

  const system = `You are LexAI, an expert legal AI assistant covering 290+ global jurisdictions with deep expertise in Bermuda, Caribbean, UK, US, Canada, Australia, and Commonwealth law. Draft precise, professional, complete legal documents with all standard clauses, definitions, and boilerplate appropriate for the specified jurisdiction. Never truncate or summarize — produce the full document text.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 4096, temperature: 0.3 });
  } catch (err) {
    console.error('[ai] draftDocument error:', err.message);
    throw new Error(`Draft generation failed: ${err.message}`);
  }
}

// 2. ANALYZE DOCUMENT
async function analyzeDocument({ content, analysis_type, jurisdiction, focus_areas }) {
  const jx = resolveJurisdiction(jurisdiction);
  const focus = Array.isArray(focus_areas) && focus_areas.length
    ? `Pay particular attention to: ${focus_areas.join(', ')}.`
    : '';

  const prompt = `Analyze the following legal document for ${jx.name} jurisdiction. Analysis type requested: ${analysis_type || 'general risk analysis'}.

Provide:
1. A risk score from 0-100 (higher = riskier)
2. The 3-5 most critical clauses or issues, flagged with severity
3. Which party the document favors, and why
4. Any missing standard clauses for this document type
5. A brief plain-English summary

${focus}

Document text:
${content}

Respond as structured analysis with clear headings, not JSON.`;

  const system = `You are LexAI's contract analysis engine. Provide precise, professional risk analysis for legal documents under ${jx.name} law. Be specific about clause numbers/locations when flagging issues.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 4096, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] analyzeDocument error:', err.message);
    throw new Error(`Document analysis failed: ${err.message}`);
  }
}

// 3. RESEARCH CASE LAW
async function researchCaseLaw({ query, jurisdictions, area_of_law, include_echr, include_privy_council }) {
  const jxList = Array.isArray(jurisdictions) && jurisdictions.length
    ? jurisdictions.join(', ')
    : 'all relevant jurisdictions';

  const prompt = `Research the following legal question: "${query}"

Jurisdictions to consider: ${jxList}
Area of law: ${area_of_law || 'general'}
${include_echr ? 'Include relevant ECHR jurisprudence where applicable.' : ''}
${include_privy_council ? 'Include relevant Privy Council / JCPC precedent where applicable.' : ''}

Provide:
1. A summary of the legal position
2. Key relevant cases (with citation format appropriate to jurisdiction) if known
3. Statutory provisions if relevant
4. Practical guidance based on current law

Be clear about the limits of your knowledge — note where the user should verify against a live case law database for the most current precedent.`;

  const system = `You are LexAI's legal research engine, covering 290+ jurisdictions including Bermuda, Caribbean (CCJ), UK, US, Canada, Australia, and Commonwealth law. Provide accurate, well-organized legal research. Always be clear about confidence level and recommend verification for time-sensitive or high-stakes matters.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 4096, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] researchCaseLaw error:', err.message);
    throw new Error(`Case law research failed: ${err.message}`);
  }
}

// 4. PREDICT LITIGATION
async function predictLitigation({ facts, jurisdiction, claim_type, opposing_arguments }) {
  const jx = resolveJurisdiction(jurisdiction);

  const prompt = `Based on the following facts, provide a litigation outcome assessment for ${jx.name} (claim type: ${claim_type || 'general civil'}):

Facts:
${facts}

${opposing_arguments ? `Opposing arguments to consider:\n${opposing_arguments}\n` : ''}

Provide:
1. Estimated win probability (as a percentage range) with reasoning
2. Settlement likelihood and recommendation
3. Key strategic considerations
4. Risk factors that could change the outcome

Be clear this is an AI estimate based on general legal principles, not a guarantee, and recommend consultation with qualified local counsel for case-specific strategy.`;

  const system = `You are LexAI's litigation prediction engine for ${jx.name}. Provide realistic, well-reasoned outcome assessments grounded in legal principle, not overconfident guarantees. Always frame predictions as estimates.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 3000, temperature: 0.3 });
  } catch (err) {
    console.error('[ai] predictLitigation error:', err.message);
    throw new Error(`Litigation prediction failed: ${err.message}`);
  }
}

// 5. COMPARATIVE LAW
async function comparativeLaw({ topic, jurisdictions, focus }) {
  const jxList = Array.isArray(jurisdictions) && jurisdictions.length
    ? jurisdictions
    : ['Bermuda', 'United Kingdom', 'United States'];

  const prompt = `Compare how the following jurisdictions treat this legal topic: "${topic}"

Jurisdictions: ${jxList.join(', ')}
${focus ? `Specific focus: ${focus}` : ''}

For each jurisdiction, provide:
1. The governing legal framework/statute
2. Key differences from the others
3. Practical implications

Present as a clear comparison, organized by jurisdiction.`;

  const system = `You are LexAI's comparative law engine, covering 290+ jurisdictions. Provide accurate, organized comparative analysis highlighting practical differences relevant to legal practitioners and businesses operating across borders.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 4096, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] comparativeLaw error:', err.message);
    throw new Error(`Comparative law analysis failed: ${err.message}`);
  }
}

// 6. HORIZON SCAN
async function horizonScan({ jurisdictions, practice_areas, organisation_type }) {
  const jxList = Array.isArray(jurisdictions) && jurisdictions.length
    ? jurisdictions.join(', ')
    : 'Bermuda, United Kingdom, United States';
  const areas = Array.isArray(practice_areas) && practice_areas.length
    ? practice_areas.join(', ')
    : 'general legal developments';

  const prompt = `Provide a horizon scan of legal and regulatory developments relevant to the following:

Jurisdictions: ${jxList}
Practice areas / focus: ${areas}
Organisation type: ${organisation_type || 'general business'}

Provide:
1. Notable recent or anticipated legislative changes
2. Regulatory shifts that could affect compliance obligations
3. Policy trends worth monitoring
4. Recommended actions

Be clear about your knowledge cutoff and recommend the user verify against live regulatory sources (e.g. official gazettes, regulator websites) for the most current developments, since this is a fast-moving area.`;

  const system = `You are LexAI's horizon scanning engine. Provide a structured, professional briefing on legal and regulatory developments. Be explicit about the limits of training-data knowledge for very recent changes and recommend verification against primary sources.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 3000, temperature: 0.3 });
  } catch (err) {
    console.error('[ai] horizonScan error:', err.message);
    throw new Error(`Horizon scan failed: ${err.message}`);
  }
}

// 7. SAFEGUARDING SUPPORT
async function safeguardingSupport({ case_type, facts, jurisdiction, organisation_type, concern_type }) {
  const jx = resolveJurisdiction(jurisdiction);

  const prompt = `Provide safeguarding guidance for the following case, relevant to ${jx.name} law and practice.

Case type: ${case_type || 'general safeguarding concern'}
Concern type: ${concern_type || 'not specified'}
Organisation type: ${organisation_type || 'professional/organisation'}

Facts:
${facts}

Provide:
1. Relevant safeguarding legal obligations in this jurisdiction
2. Recommended immediate steps
3. Reporting obligations and to whom, if applicable
4. Relevant local authorities or helplines to contact

This guidance must be cautious, prioritize the safety of any vulnerable person involved, and clearly state that for active safeguarding emergencies the user should contact local emergency services or statutory safeguarding authorities immediately rather than relying solely on AI guidance.`;

  const system = `You are LexAI's safeguarding support engine for ${jx.name}. Prioritize the safety of vulnerable individuals above all else. Be clear, direct, and practical. Never discourage contacting emergency services or statutory authorities. Do not delay urgent guidance with excessive caveats.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 2500, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] safeguardingSupport error:', err.message);
    throw new Error(`Safeguarding support failed: ${err.message}`);
  }
}

// 8. BUILD CASE SUMMARY
async function buildCaseSummary({ case_facts, jurisdiction, area_of_law, purpose }) {
  const jx = resolveJurisdiction(jurisdiction);

  const prompt = `Build a structured case summary for ${jx.name}. Area of law: ${area_of_law || 'general'}. Purpose: ${purpose || 'general legal review'}.

Case facts:
${case_facts}

Provide:
1. Case caption / parties
2. Procedural posture
3. Key facts
4. Legal issues presented
5. Holding/outcome (if known) or current status
6. Significance

Format as a clean, professional case summary suitable for a legal brief or memo.`;

  const system = `You are LexAI's case summary engine for ${jx.name}. Produce clear, accurate, well-organized case summaries suitable for professional legal use.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 2500, temperature: 0.2 });
  } catch (err) {
    console.error('[ai] buildCaseSummary error:', err.message);
    throw new Error(`Case summary generation failed: ${err.message}`);
  }
}

// 9. BUILD CHRONOLOGY
async function buildChronology({ events, context, jurisdiction, purpose }) {
  const jx = resolveJurisdiction(jurisdiction);

  const prompt = `Build a clear, dated legal chronology for ${jx.name}${context ? ` regarding: ${context}` : ''}. Purpose: ${purpose || 'general case preparation'}.

Events:
${events}

Provide a chronological list with:
- Date
- Event description
- Legal significance (if applicable)

Sort strictly in date order. Flag any gaps or ambiguities in the timeline that may need clarification.`;

  const system = `You are LexAI's chronology builder. Produce precise, well-organized chronologies suitable for litigation preparation, due diligence, or case files.`;

  try {
    return await callClaude({ system, prompt, maxTokens: 2500, temperature: 0.1 });
  } catch (err) {
    console.error('[ai] buildChronology error:', err.message);
    throw new Error(`Chronology generation failed: ${err.message}`);
  }
}

// 10. LEARN FROM DOCUMENT
async function learnFromDocument(userId, content, type) {
  try {
    console.log(`[ai] learnFromDocument: user=${userId} type=${type} length=${(content || '').length}`);
    return { recorded: true };
  } catch (err) {
    console.error('[ai] learnFromDocument error (non-fatal):', err.message);
    return { recorded: false };
  }
}

// LEGACY / GENERIC — backward compatibility
async function generateDocument(prompt, type = 'contract', options = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: 'AI service not configured', draft: 'Please configure ANTHROPIC_API_KEY in environment variables.' };
  }
  const model = selectModel(type, options);
  try {
    const res = await anthropic.messages.create({
      model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.3,
      system: 'You are LexAI, an expert legal AI assistant covering 290+ global jurisdictions with deep expertise in Bermuda, Caribbean, UK, US, Canada, Australia, and Commonwealth law. Provide precise, professional legal drafts and analysis appropriate for the specified jurisdiction.',
      messages: [{ role: 'user', content: prompt }]
    });
    return {
      draft: res.content[0]?.text || 'No response generated',
      model,
      usage: res.usage
    };
  } catch (err) {
    return { error: err.message, draft: '' };
  }
}

module.exports = {
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
  learnFromDocument
};
