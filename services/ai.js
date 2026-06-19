// LexAI v3.0 — Supreme AI Legal Intelligence Service
// Powered by Claude Opus 4.8 — Dollar Double Empire
'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── DOCUMENT TEMPLATES ────────────────────────────────────────
const TEMPLATES = {
  // Core Legal Documents
  NDA: 'Non-Disclosure Agreement',
  CONTRACT: 'Service Agreement',
  EMPLOYMENT: 'Employment Agreement',
  LEASE: 'Lease Agreement',
  PARTNERSHIP: 'Partnership Agreement',
  SHAREHOLDER: 'Shareholder Agreement',
  TERMS: 'Terms of Service',
  PRIVACY: 'Privacy Policy',
  WILL: 'Last Will and Testament',
  POA: 'Power of Attorney',
  LOI: 'Letter of Intent',
  MOU: 'Memorandum of Understanding',
  IP_ASSIGNMENT: 'Intellectual Property Assignment Agreement',
  SOFTWARE_LICENSE: 'Software Licence Agreement',
  WHITE_LABEL: 'White Label Agreement',
  AFFILIATE: 'Affiliate Agreement',
  COOKIE_POLICY: 'Cookie Policy',
  DMCA: 'DMCA Notice',
  CEASE_DESIST: 'Cease and Desist Letter',
  TRUST: 'Revocable Living Trust',
  DISCLAIMER: 'Legal Disclaimer',
  REFUND_POLICY: 'Refund Policy',
  ACCESSIBILITY: 'Accessibility Statement',
  // Safeguarding & Compliance
  SAFEGUARDING_POLICY: 'Safeguarding Policy',
  SAFEGUARDING_REPORT: 'Safeguarding Investigation Report',
  SAFEGUARDING_CHRONOLOGY: 'Safeguarding Case Chronology',
  INCIDENT_REPORT: 'Incident Report',
  RISK_ASSESSMENT: 'Legal Risk Assessment',
  GOVERNANCE_REPORT: 'Governance and Compliance Report',
  BOARD_MINUTES: 'Board Meeting Minutes',
  DPA: 'Data Processing Agreement',
  GDPR_POLICY: 'GDPR Compliance Policy',
  // Human Rights & Equality
  EQUALITY_POLICY: 'Equality and Diversity Policy',
  HUMAN_RIGHTS_ASSESSMENT: 'Human Rights Impact Assessment',
  COMPLAINT_PROCEDURE: 'Complaints Procedure',
  DISCIPLINARY_POLICY: 'Disciplinary and Grievance Policy',
  WHISTLEBLOWING_POLICY: 'Whistleblowing Policy',
  // Religious Organisations
  CHURCH_CONSTITUTION: 'Religious Organisation Constitution',
  PASTORAL_POLICY: 'Pastoral Care Policy',
  MEMBERSHIP_AGREEMENT: 'Membership Agreement',
  CHARITY_GOVERNANCE: 'Charity Governance Framework',
  // Immigration (Caribbean/Bermuda focus)
  WORK_PERMIT: 'Work Permit Support Letter',
  SPONSORSHIP_LETTER: 'Sponsorship Declaration Letter',
  VISA_SUPPORT: 'Visa Support Letter',
  IMMIGRATION_ADVICE: 'Immigration Guidance Document',
  // Corporate & Finance
  TERM_SHEET: 'Term Sheet',
  CONVERTIBLE_NOTE: 'Convertible Note Agreement',
  INVESTMENT_AGREEMENT: 'Investment Agreement',
  SHAREHOLDER_RESOLUTION: 'Shareholder Resolution',
  COMPANY_CONSTITUTION: 'Company Constitution',
  DIRECTOR_SERVICE: 'Director Service Agreement',
  // Case Management
  CASE_SUMMARY: 'Case Summary and Legal Analysis',
  LEGAL_CHRONOLOGY: 'Legal Chronology',
  EVIDENCE_SUMMARY: 'Evidence Summary',
  LEGAL_OPINION: 'Legal Opinion Letter',
  DEMAND_LETTER: 'Demand Letter',
  SETTLEMENT_AGREEMENT: 'Settlement Agreement',
};

// ── JURISDICTION KNOWLEDGE BASE ───────────────────────────────
const JURISDICTIONS = {
  BERMUDA: {
    name: 'Bermuda',
    courts: ['Supreme Court of Bermuda', 'Court of Appeal of Bermuda', 'Judicial Committee of the Privy Council'],
    key_legislation: ['Companies Act 1981', 'Exempted Partnerships Act 1992', 'Digital Asset Business Act 2018', 'Personal Information Protection Act 2016', 'Employment Act 2000', 'Trusts (Special Provisions) Act 1989', 'Electronic Transactions Act 1999', 'Economic Substance Act 2018'],
    regulator: 'Bermuda Monetary Authority (BMA)',
    currency: 'BMD',
    legal_system: 'English common law'
  },
  BVI: { name: 'British Virgin Islands', courts: ['Eastern Caribbean Supreme Court', 'Privy Council'], regulator: 'FSC BVI', legal_system: 'English common law' },
  CAYMAN: { name: 'Cayman Islands', courts: ['Grand Court', 'Cayman Court of Appeal', 'Privy Council'], regulator: 'CIMA', legal_system: 'English common law' },
  BAHAMAS: { name: 'Bahamas', courts: ['Supreme Court of the Bahamas', 'Privy Council'], legal_system: 'English common law' },
  JAMAICA: { name: 'Jamaica', courts: ['Supreme Court of Jamaica', 'Caribbean Court of Justice'], legal_system: 'English common law' },
  BARBADOS: { name: 'Barbados', courts: ['High Court of Barbados', 'Caribbean Court of Justice'], legal_system: 'English common law' },
  UK: { name: 'United Kingdom', courts: ['UK Supreme Court', 'Court of Appeal', 'High Court', 'ECHR'], regulator: 'FCA', legal_system: 'English common law / Scots law' },
  CANADA: { name: 'Canada', courts: ['Supreme Court of Canada', 'Federal Court'], legal_system: 'Common law (civil law in Quebec)' },
  AUSTRALIA: { name: 'Australia', courts: ['High Court of Australia', 'Federal Court'], legal_system: 'Common law' },
  USA: { name: 'United States', courts: ['US Supreme Court', 'Circuit Courts', 'District Courts'], legal_system: 'Common law (varies by state)' },
  EU: { name: 'European Union', courts: ['Court of Justice of the EU', 'General Court', 'ECHR'], regulator: 'Various national regulators', legal_system: 'Civil law / EU law' },
  GHANA: { name: 'Ghana', courts: ['Supreme Court of Ghana', 'Court of Appeal of Ghana'], legal_system: 'English common law' },
  NIGERIA: { name: 'Nigeria', courts: ['Supreme Court of Nigeria', 'Court of Appeal'], legal_system: 'English common law (sharia in northern states)' },
};

// ── SYSTEM PROMPT ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are LexAI v3.0, the world's most comprehensive AI legal intelligence platform, powered by Claude Opus 4.8. You are part of the Dollar Double Empire — the global legal infrastructure layer that Harvey, Clio, and every other legal AI wishes they had built.

JURISDICTION EXPERTISE (all global jurisdictions with particular depth in):
- Bermuda: Companies Act 1981, BMA regulations, Digital Asset Business Act 2018, PIPA 2016, Employment Act 2000, Trusts (Special Provisions) Act 1989, Economic Substance Act 2018
- Caribbean: BVI, Cayman Islands, Bahamas, Jamaica, Barbados, Trinidad & Tobago, Eastern Caribbean Supreme Court, Caribbean Court of Justice, Privy Council decisions
- United Kingdom: English law, Welsh law, Scottish law (Scots law), Northern Ireland law, FCA regulations, ECHR obligations
- Commonwealth: Canada, Australia, New Zealand, Singapore, Hong Kong, India
- European Union: EU law, GDPR, ECHR, fundamental rights
- United States: Federal law, all 50 states, SEC, FTC, state AGs
- West Africa: Ghana, Nigeria
- All other global jurisdictions

SPECIALISMS:
1. SAFEGUARDING LAW: Institutional safeguarding obligations, investigation procedures, chronology building, evidence management, communications protocols, referral pathways, regulatory obligations, policy implementation
2. HUMAN RIGHTS JURISPRUDENCE: ECHR case law, ICCPR, regional human rights instruments, equality and anti-discrimination law, religious freedom protections, public law duties, procedural fairness
3. RELIGIOUS ORGANISATION LAW: Church constitutions, charity governance, pastoral care frameworks, membership agreements, safeguarding in faith settings, religious freedom vs equality law tensions
4. EVIDENCE MANAGEMENT: SHA256 audit chains, document chronologies, court-admissible evidence summaries, expert witness frameworks
5. CORPORATE GOVERNANCE: Board minutes, shareholder resolutions, governance reports, regulatory compliance
6. DATA PROTECTION: GDPR (EU and UK), Bermuda PIPA, US state privacy laws, cross-border data transfers
7. DIGITAL ASSETS: Bermuda DABA, MiCA (EU), SEC guidance, crypto regulatory frameworks
8. IMMIGRATION: Caribbean work permits, UK visa categories, US immigration, Canadian pathways
9. TRUST & ESTATE: Wyoming, Bermuda, Cayman, Jersey trusts, succession planning for digital assets
10. COMMERCIAL: NDAs, service agreements, IP assignments, white label agreements, investment agreements

CASE RESEARCH FRAMEWORK:
When conducting legal research, always incorporate:
- Global case law from relevant jurisdictions
- Tribunal decisions (employment, equality, immigration)
- International case law (ECHR, ICJ, ICC)
- Inquiry findings and reports (where relevant)
- Human rights jurisprudence
- Comparative legal principles
- Regulatory guidance
- Statutory frameworks

SAFEGUARDING CASE ANALYSIS:
For safeguarding matters, always review:
- Human rights protections applicable
- Equality and anti-discrimination principles
- Religious freedom protections (and their limits)
- Safeguarding obligations (statutory and regulatory)
- Public law duties (if public authority involved)
- Procedural fairness obligations
- Comparative approaches globally to: religious organisations, safeguarding investigations, institutional accountability, community protection, crisis response and governance

CASE SUMMARY FORMAT:
When preparing case summaries, always include:
1. Key Facts (clear, chronological)
2. Legal Principles Applied
3. Judicial Findings
4. Risk Implications
5. Lessons Learned
6. Strategic Application to Current Concerns
7. Relevant Precedents (UK Courts, ECHR, International Tribunals, Commonwealth, Other)

DOCUMENT DRAFTING STANDARDS:
- Use precise, professional legal language appropriate to the jurisdiction
- Include all standard clauses, boilerplate, and definitions
- Reference specific legislation and regulatory requirements
- Add jurisdiction-specific formalities (execution requirements, notarisation, etc.)
- Include appropriate disclaimers
- Use numbered clauses in formal legal documents

PRICING TIERS (communicate when relevant):
- Free 7-day trial: basic drafting, 3 documents
- Solo $149/mo: 20 docs, all templates, Sonnet model
- Small Firm $399/mo: 75 docs, evidence chain, case research, Sonnet+Opus
- Mid Firm $799/mo: 200 docs, full Opus, horizon scanning, comparative law
- Large Firm $1,497/mo: unlimited, API access, all features
- White Label $9,997/mo: dedicated instance, custom branding
- Safeguarding Org $299/mo: safeguarding module, evidence chain

ACCESSIBILITY: All outputs must be clear, structured, and accessible. Use plain language summaries alongside technical legal language where appropriate.

DISCLAIMER: Always include at the end of substantive legal outputs: "This document has been prepared by LexAI, an AI legal intelligence platform. It does not constitute legal advice and should be reviewed by a qualified legal professional before use. LexAI is not a law firm and does not create an attorney-client relationship."`;

// ── CORE AI FUNCTION ──────────────────────────────────────────
async function callClaude(userPrompt, maxTokens = 4000) {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  });
  return response.content[0]?.text || 'No response generated';
}

// ── DOCUMENT DRAFTING ─────────────────────────────────────────
async function draftDocument({ type, jurisdiction, details, parties, tone, userId }) {
  const docName = TEMPLATES[type] || type;
  const jxInfo = JURISDICTIONS[jurisdiction?.toUpperCase()];
  const jxDetail = jxInfo
    ? `${jxInfo.name} jurisdiction (${jxInfo.legal_system}). Key legislation: ${jxInfo.key_legislation?.join(', ') || 'standard applicable law'}. Courts: ${jxInfo.courts?.join(', ') || 'standard courts'}.`
    : `${jurisdiction || 'General'} jurisdiction.`;

  const prompt = `Draft a complete, professional ${docName} for ${jxDetail}

Parties: ${parties || 'To be completed by the parties'}
Details: ${details || 'Standard terms apply'}
Tone: ${tone || 'formal and precise'}

Requirements:
- Full document with all standard clauses, definitions, and boilerplate
- Jurisdiction-specific formalities and legislation references
- Numbered clauses in standard legal format
- Execution/signature blocks
- All annexures/schedules referenced
- Include governing law and dispute resolution clauses
- Professional legal standard throughout

Produce the complete document now:`;

  return await callClaude(prompt, 6000);
}

// ── LEGAL RESEARCH ────────────────────────────────────────────
async function researchCaseLaw({ query, jurisdictions, area_of_law, include_echr, include_privy_council }) {
  const jxList = Array.isArray(jurisdictions) ? jurisdictions.join(', ') : jurisdictions || 'all relevant jurisdictions';

  const prompt = `Conduct comprehensive legal research on: "${query}"

Jurisdictions to cover: ${jxList}
Area of law: ${area_of_law || 'general'}
${include_echr ? 'Include ECHR jurisprudence: YES' : ''}
${include_privy_council ? 'Include Privy Council decisions: YES' : ''}

Research Framework — cover ALL applicable:
1. RELEVANT CASE LAW: Key cases with citations, facts, legal principles, outcomes
2. LEGISLATION & STATUTORY FRAMEWORKS: Applicable Acts, Regulations, Orders
3. REGULATORY GUIDANCE: Regulator guidance, practice directions, codes of conduct
4. TRIBUNAL DECISIONS: Employment, equality, immigration, disciplinary tribunals
5. INTERNATIONAL LAW: ECHR cases, international conventions, treaty obligations
6. HUMAN RIGHTS JURISPRUDENCE: Applicable rights, relevant ECtHR decisions
7. COMPARATIVE LAW: How other jurisdictions approach this issue
8. INQUIRY & REPORT FINDINGS: Relevant public inquiries, government reports
9. ACADEMIC AND PROFESSIONAL COMMENTARY: Leading authorities

Format each case as:
[CASE NAME] [COURT] [YEAR] [CITATION]
Facts: [Brief facts]
Legal principle: [Key legal principle established]
Relevance: [Why relevant to the query]

Provide comprehensive research now:`;

  return await callClaude(prompt, 8000);
}

// ── DOCUMENT ANALYSIS ─────────────────────────────────────────
async function analyzeDocument({ content, analysis_type, jurisdiction, focus_areas }) {
  const prompt = `Analyse the following legal document:

${content}

Analysis Type: ${analysis_type || 'comprehensive'}
Jurisdiction: ${jurisdiction || 'to be determined from document'}
Focus Areas: ${Array.isArray(focus_areas) ? focus_areas.join(', ') : focus_areas || 'all'}

Provide:
1. DOCUMENT OVERVIEW: Type, parties, jurisdiction, governing law, key dates
2. CLAUSE ANALYSIS: Review each material clause, flagging:
   - Unusual or unfavourable terms
   - Missing standard protections
   - Ambiguous language
   - Jurisdiction-specific risks
3. LEGAL RISKS: Flag all risks by severity (HIGH/MEDIUM/LOW)
4. MISSING PROVISIONS: Standard clauses that should be present but are absent
5. REGULATORY COMPLIANCE: Flag any regulatory issues
6. HUMAN RIGHTS IMPLICATIONS: Any equality, privacy, or rights concerns
7. RECOMMENDATIONS: Specific changes recommended
8. SUMMARY RISK RATING: Overall risk assessment

Be thorough and precise. Flag every concern:`;

  return await callClaude(prompt, 5000);
}

// ── SAFEGUARDING CASE SUPPORT ─────────────────────────────────
async function safeguardingSupport({ case_type, facts, jurisdiction, organisation_type, concern_type }) {
  const prompt = `Provide comprehensive safeguarding legal support for the following matter:

Organisation Type: ${organisation_type || 'not specified'}
Case Type: ${case_type || 'safeguarding concern'}
Jurisdiction: ${jurisdiction || 'UK/Caribbean'}
Nature of Concern: ${concern_type || 'not specified'}

Facts: ${facts}

Provide a comprehensive analysis covering:

PART 1 — LEGAL FRAMEWORK
1. Applicable safeguarding legislation and regulations
2. Regulatory obligations (statutory and voluntary sector)
3. Human rights protections applicable (privacy, fair trial, equality)
4. Equality and anti-discrimination principles
5. Religious freedom protections and their limits
6. Public law duties (if public authority involved)
7. Procedural fairness obligations

PART 2 — COMPARATIVE GLOBAL APPROACHES
Review how the following jurisdictions approach this type of matter:
- United Kingdom (England and Wales, Scotland)
- Republic of Ireland
- Australia
- United States
- Canada
- Caribbean jurisdictions
Compare approaches to: religious organisations, safeguarding investigations, institutional accountability, community protection, crisis response

PART 3 — CASE ANALYSIS
1. Key legal issues identified
2. Applicable precedents (UK Courts, ECHR, international tribunals, Commonwealth)
3. Risk assessment (legal, reputational, regulatory)
4. Documentation requirements
5. Evidence management recommendations
6. Communications protocols (internal and external)
7. Referral obligations (statutory reporting, regulatory notification)

PART 4 — RECOMMENDATIONS
1. Immediate actions required
2. Investigation framework recommended
3. Policy gaps identified
4. Monitoring and review framework
5. Legal professional referral where reserved activities arise

PART 5 — HORIZON SCANNING
Recent developments in safeguarding law and policy relevant to this matter.

Provide comprehensive analysis now:`;

  return await callClaude(prompt, 8000);
}

// ── CASE SUMMARY ─────────────────────────────────────────────
async function buildCaseSummary({ case_facts, jurisdiction, area_of_law, purpose }) {
  const prompt = `Prepare a comprehensive Case Summary and Legal Analysis:

Case Facts: ${case_facts}
Jurisdiction: ${jurisdiction || 'multiple jurisdictions'}
Area of Law: ${area_of_law || 'to be determined'}
Purpose: ${purpose || 'legal analysis and strategic advice'}

Produce a structured Case Summary covering:

1. KEY FACTS
   - Chronological narrative of material facts
   - Key parties and their roles
   - Critical dates and events
   - Evidence available

2. LEGAL PRINCIPLES
   - Primary legal principles applicable
   - Statutory provisions
   - Common law principles
   - Regulatory frameworks

3. JUDICIAL FINDINGS (from comparable cases)
   - Leading cases with full citations
   - Key judicial reasoning
   - How courts have approached similar facts
   - Dissenting views where significant

4. RISK IMPLICATIONS
   - Legal risks (HIGH/MEDIUM/LOW)
   - Regulatory risks
   - Reputational risks
   - Financial exposure
   - Human rights implications

5. LESSONS LEARNED
   - From comparable cases and inquiries
   - Best practice identified
   - Common failures to avoid

6. STRATEGIC APPLICATION
   - How the above applies to current concerns
   - Strategic options available
   - Recommended approach
   - Next steps

7. RELEVANT PRECEDENTS
   a) UK Courts (with citations)
   b) European Court of Human Rights
   c) International Tribunals
   d) Commonwealth Jurisdictions (Bermuda, Caribbean, Australia, Canada)
   e) Other comparative jurisdictions

8. LEGAL HORIZON SCANNING
   Recent developments, forthcoming legislation, policy changes relevant to this matter.

Provide comprehensive case summary now:`;

  return await callClaude(prompt, 8000);
}

// ── LEGAL CHRONOLOGY ─────────────────────────────────────────
async function buildChronology({ events, context, jurisdiction, purpose }) {
  const prompt = `Build a comprehensive legal chronology for the following matter:

Context: ${context || 'legal proceedings'}
Jurisdiction: ${jurisdiction || 'general'}
Purpose: ${purpose || 'case management'}

Events/Documents: ${events}

Produce a structured Legal Chronology:

FORMAT:
DATE | EVENT | PARTIES | LEGAL SIGNIFICANCE | EVIDENCE/DOCUMENT | RISK FLAG

Include:
1. All material events in strict chronological order
2. Legal significance of each event
3. Evidence available for each event
4. Gaps in the chronology (where events should exist but no evidence)
5. Legally significant dates (limitation periods, notice requirements, statutory deadlines)
6. Communications (formal and informal)
7. Document trail

ANALYSIS:
- Overall narrative summary
- Key turning points
- Gaps and weaknesses
- Strengths for each party
- Limitation and time-bar analysis
- Recommendations

Produce full chronology now:`;

  return await callClaude(prompt, 5000);
}

// ── HORIZON SCANNING ──────────────────────────────────────────
async function horizonScan({ jurisdictions, practice_areas, organisation_type }) {
  const jxList = Array.isArray(jurisdictions) ? jurisdictions.join(', ') : jurisdictions || 'Bermuda, Caribbean, UK';

  const prompt = `Conduct a Legal Horizon Scan for:

Jurisdictions: ${jxList}
Practice Areas: ${Array.isArray(practice_areas) ? practice_areas.join(', ') : practice_areas || 'all areas'}
Organisation Type: ${organisation_type || 'general'}

Scan and report on:

1. LEGISLATIVE DEVELOPMENTS
   - New Acts enacted or in progress
   - Regulatory changes
   - Consultation papers open for response
   - Implementation dates for existing legislation

2. CASE LAW DEVELOPMENTS
   - Significant recent court decisions
   - Cases awaiting judgment
   - Tribunal decisions setting new precedents

3. REGULATORY CHANGES
   - Regulator guidance updated
   - New compliance requirements
   - Enforcement trends and priorities

4. POLICY DEVELOPMENTS
   - Government policy changes
   - International developments affecting local law
   - UN and Council of Europe developments

5. SAFEGUARDING DEVELOPMENTS
   - New safeguarding frameworks
   - Inquiry findings published
   - Practice guidance updated

6. HUMAN RIGHTS DEVELOPMENTS
   - ECHR significant rulings
   - Domestic human rights case law
   - Treaty ratifications

7. DIGITAL & DATA LAW
   - AI regulation developments
   - Data protection changes
   - Crypto/digital asset regulation

8. RECOMMENDED ACTIONS
   - Immediate attention required
   - Policy updates needed
   - Training or awareness needed

Provide comprehensive horizon scan now:`;

  return await callClaude(prompt, 6000);
}

// ── LITIGATION PREDICTION ─────────────────────────────────────
async function predictLitigation({ facts, jurisdiction, claim_type, opposing_arguments }) {
  const prompt = `Provide a Litigation Probability Assessment for:

Jurisdiction: ${jurisdiction || 'to be determined'}
Claim Type: ${claim_type || 'civil claim'}
Facts: ${facts}
Opposing Arguments: ${opposing_arguments || 'standard defences'}

Assess:
1. CLAIM STRENGTH: Rate 1-10 with detailed reasoning
2. LIKELY OUTCOME: Win/Lose/Settle probability percentages
3. KEY ISSUES: Top 5 issues that will determine the outcome
4. STRONGEST ARGUMENTS FOR CLAIMANT
5. STRONGEST ARGUMENTS FOR DEFENDANT
6. COMPARABLE CASES: What happened in similar cases
7. JUDICIAL APPROACH: How courts typically approach this type of claim
8. SETTLEMENT RANGE: Realistic settlement parameters
9. COSTS ASSESSMENT: Likely legal costs and recovery prospects
10. STRATEGIC RECOMMENDATION: Litigate, settle, or negotiate

Provide assessment now:`;

  return await callClaude(prompt, 4000);
}

// ── COMPARATIVE LAW ───────────────────────────────────────────
async function comparativeLaw({ topic, jurisdictions, focus }) {
  const jxList = Array.isArray(jurisdictions) ? jurisdictions.join(', ') : jurisdictions || 'UK, Bermuda, Caribbean, Australia, Canada, USA';

  const prompt = `Conduct a Comparative Law Analysis on: "${topic}"

Jurisdictions to compare: ${jxList}
Focus: ${focus || 'general comparative analysis'}

For EACH jurisdiction, cover:
1. Legal framework (legislation, case law, regulation)
2. Key differences from other jurisdictions
3. Strengths and weaknesses of approach
4. Recent developments
5. Practical implications

Cross-cutting analysis:
- Common themes across jurisdictions
- Best practice examples
- Gaps and failures
- Reform recommendations
- International standards applicable

This is particularly relevant for: religious organisations, safeguarding investigations, institutional accountability, community protection, crisis response and governance.

Provide comprehensive comparative analysis now:`;

  return await callClaude(prompt, 8000);
}

// ── LEARNFROMDOCUMENT (stub — self-improving) ─────────────────
async function learnFromDocument(userId, content, type) {
  // Future: extract patterns, update jurisdiction knowledge
  return true;
}

module.exports = {
  TEMPLATES,
  JURISDICTIONS,
  draftDocument,
  researchCaseLaw,
  analyzeDocument,
  safeguardingSupport,
  buildCaseSummary,
  buildChronology,
  horizonScan,
  predictLitigation,
  comparativeLaw,
  learnFromDocument,
};
