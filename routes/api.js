// LexAI v3.0 — Complete API Routes
// Dollar Double Empire — Harvey seat model
'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../db');
const ai = require('../services/ai');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|docx?|txt|rtf|png|jpe?g|gif|webp|csv|xlsx?|eml|msg|mp3|mp4|wav|m4a|ogg|webm|flac|aac)$/i;
    if (allowed.test(file.originalname)) return cb(null, true);
    cb(new Error('File type not allowed'));
  }
});

async function audit(userId, action, resource, resourceId, meta = {}) {
  try {
    await pool.query(
      'INSERT INTO audit_log(user_id,action,resource,resource_id,meta) VALUES($1,$2,$3,$4,$5)',
      [userId, action, resource, resourceId, JSON.stringify(meta)]
    );
  } catch (e) { console.error('[audit]', e.message); }
}

// ── HARVEY: credits + firm + overage ──
async function consumeCredit(userId, firm) {
  if (firm) {
    await pool.query('UPDATE firms SET credits = credits -1 WHERE id=$1', [firm.id]);
    if (firm.credits <= 0) {
      await pool.query('INSERT INTO overage_log (firm_id, user_id, type, cost) VALUES ($1,$2,$3,0.75)', [firm.id, userId, 'doc']);
    }
  } else {
    await pool.query('UPDATE users SET docs_credits = COALESCE(docs_credits,3) -1, docs_used_this_month = COALESCE(docs_used_this_month,0)+1 WHERE id=$1', [userId]);
  }
}

// ══════════════════════════════════════════════════════════════
// 1. DOCUMENT DRAFTING
// ══════════════════════════════════════════════════════════════
router.post('/draft', requireAuth, async (req, res) => {
  try {
    const { type, jurisdiction, details, parties, tone } = req.body;
    if (!type) return res.status(400).json({ error: 'Document type required' });

    const gateRes = await pool.query('SELECT plan, docs_credits, docs_used_this_month, firm_id FROM users WHERE id=$1', [req.user.id]);
    const gateUser = gateRes.rows[0] || { docs_credits: 3 };

    let firm = null;
    if (gateUser.firm_id) {
      const f = await pool.query('SELECT * FROM firms WHERE id=$1', [gateUser.firm_id]);
      firm = f.rows[0] || null;
    }

    const freeLeft = 3 - (gateUser.docs_used_this_month || 0);
    const available = firm? firm.credits : (gateUser.docs_credits!= null? gateUser.docs_credits : freeLeft);

    if (available <= 0 &&!firm) {
      return res.status(402).json({
        error: 'free_limit_reached',
        message: 'You used your 3 free docs. Top up $19=20 docs, $49=100 docs, or create Firm 5 seats $299/mo',
        upgrade: true,
        business_portal: '/business-portal'
      });
    }

    const content = await ai.draftDocument({ type, jurisdiction, details, parties, tone, userId: req.user.id });
    const title = `${ai.TEMPLATES[type] || type} — ${new Date().toLocaleDateString()}`;
    const wordCount = content.split(/\s+/).length;

    const r = await pool.query(
      `INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction)
       VALUES($1,$2,$3,$4,'draft',$5,$6) RETURNING id`,
      [req.user.id, title, type, content, wordCount, jurisdiction || 'General']
    );

    await consumeCredit(req.user.id, firm);
    await ai.learnFromDocument(req.user.id, content, type);
    await audit(req.user.id, 'draft_document', 'document', r.rows[0].id, { type, jurisdiction, firm_id: firm?.id });

    res.json({ content, doc_id: r.rows[0].id, word_count: wordCount, title, credits_left: firm? firm.credits -1 : available -1 });
  } catch (err) {
    console.error('[draft]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── REST OF YOUR FILE STAYS SAME (research, analyze, safeguarding, etc) ──
// Paste your existing routes 2-14 here unchanged — they now also use consumeCredit if you want, but draft is the paywall

// For brevity: include your existing routes from original file below this line
// 2. LEGAL RESEARCH
router.post('/research', requireAuth, async (req, res) => {
  try {
    const { query, jurisdictions, area_of_law, include_echr, include_privy_council } = req.body;
    if (!query) return res.status(400).json({ error: 'Research query required' });
    const content = await ai.researchCaseLaw({ query, jurisdictions, area_of_law, include_echr: include_echr!== false, include_privy_council: include_privy_council!== false });
    const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,$2,'RESEARCH',$3,'complete',$4,$5) RETURNING id`, [req.user.id, `Research: ${query.substring(0, 80)}`, content, content.split(/\s+/).length, Array.isArray(jurisdictions)? jurisdictions.join(', ') : jurisdictions || 'Multiple']);
    await audit(req.user.id, 'legal_research', 'document', r.rows[0].id, { query, jurisdictions });
    res.json({ content, doc_id: r.rows[0].id, word_count: content.split(/\s+/).length });
  } catch (err) { console.error('[research]', err.message); res.status(500).json({ error: err.message }); }
});

// 3. DOCUMENT ANALYSIS, 4. SAFEGUARDING, 5. CASE SUMMARY, 6. CHRONOLOGY, 7. EVIDENCE, 8. HORIZON, 9. PREDICT, 10. COMPARE, 11. DOCUMENTS LIST, 12. TEMPLATES, 13. JURISDICTIONS, 14. STATUS, evidence/upload-file, transcribe, library/expand — copy from your old file

// --- Paste the rest from your old file exactly as it was ---
router.post('/analyze', requireAuth, async (req, res) => {
  try {
    const { content, analysis_type, jurisdiction, focus_areas } = req.body;
    if (!content) return res.status(400).json({ error: 'Document content required' });
    const analysis = await ai.analyzeDocument({ content, analysis_type, jurisdiction, focus_areas });
    const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,'Document Analysis','ANALYSIS',$2,'complete',$3,$4) RETURNING id`, [req.user.id, analysis, analysis.split(/\s+/).length, jurisdiction || 'General']);
    await audit(req.user.id, 'analyze_document', 'document', r.rows[0].id, { analysis_type });
    res.json({ analysis, doc_id: r.rows[0].id });
  } catch (err) { console.error('[analyze]', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/safeguarding', requireAuth, async (req, res) => {
  try {
    const { case_type, facts, jurisdiction, organisation_type, concern_type } = req.body;
    if (!facts) return res.status(400).json({ error: 'Case facts required' });
    const content = await ai.safeguardingSupport({ case_type, facts, jurisdiction, organisation_type, concern_type });
    const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,$2,'SAFEGUARDING',$3,'complete',$4,$5) RETURNING id`, [req.user.id, `Safeguarding: ${case_type || 'Case Analysis'}`, content, content.split(/\s+/).length, jurisdiction || 'Multiple']);
    await audit(req.user.id, 'safeguarding_support', 'document', r.rows[0].id, { case_type, organisation_type });
    res.json({ content, doc_id: r.rows[0].id, word_count: content.split(/\s+/).length });
  } catch (err) { console.error('[safeguarding]', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/case-summary', requireAuth, async (req, res) => {
  try {
    const { case_facts, jurisdiction, area_of_law, purpose } = req.body;
    if (!case_facts) return res.status(400).json({ error: 'Case facts required' });
    const content = await ai.buildCaseSummary({ case_facts, jurisdiction, area_of_law, purpose });
    const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,'Case Summary and Legal Analysis','CASE_SUMMARY',$2,'complete',$3,$4) RETURNING id`, [req.user.id, content, content.split(/\s+/).length, jurisdiction || 'Multiple']);
    await audit(req.user.id, 'case_summary', 'document', r.rows[0].id, { area_of_law });
    res.json({ content, doc_id: r.rows[0].id, word_count: content.split(/\s+/).length });
  } catch (err) { console.error('[case-summary]', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/chronology', requireAuth, async (req, res) => {
  try {
    const { events, context, jurisdiction, purpose } = req.body;
    if (!events) return res.status(400).json({ error: 'Events required' });
    const content = await ai.buildChronology({ events, context, jurisdiction, purpose });
    const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,'Legal Chronology','CHRONOLOGY',$2,'complete',$3,$4) RETURNING id`, [req.user.id, content, content.split(/\s+/).length, jurisdiction || 'General']);
    await audit(req.user.id, 'build_chronology', 'document', r.rows[0].id, { context });
    res.json({ content, doc_id: r.rows[0].id, word_count: content.split(/\s+/).length });
  } catch (err) { console.error('[chronology]', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/evidence/upload', requireAuth, async (req, res) => {
  try {
    const { filename, content, file_size, case_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Evidence content required' });
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');
    const prevResult = await pool.query('SELECT chain_hash FROM evidence WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT 1', [req.user.id]);
    const prevHash = prevResult.rows[0]?.chain_hash || '0'.repeat(64);
    const chainData = JSON.stringify({ sha256, prev: prevHash, ts: new Date().toISOString() });
    const chainHash = crypto.createHash('sha256').update(chainData).digest('hex');
    const r = await pool.query(`INSERT INTO evidence(user_id,case_id,filename,sha256,prev_hash,chain_hash,file_size,status) VALUES($1,$2,$3,$4,$5,$6,$7,'Admissible') RETURNING id`, [req.user.id, case_id || null, filename || 'document', sha256, prevHash, chainHash, file_size || content.length]);
    await audit(req.user.id, 'evidence_upload', 'evidence', r.rows[0].id, { filename, sha256 });
    res.json({ id: r.rows[0].id, filename: filename || 'document', sha256, chain_hash: chainHash, status: 'Admissible', timestamp: new Date().toISOString() });
  } catch (err) { console.error('[evidence]', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/evidence/chain', requireAuth, async (req, res) => {
  try {
    const { case_id } = req.query;
    const query = case_id? 'SELECT * FROM evidence WHERE user_id = $1 AND case_id = $2 ORDER BY uploaded_at ASC' : 'SELECT * FROM evidence WHERE user_id = $1 ORDER BY uploaded_at ASC';
    const params = case_id? [req.user.id, case_id] : [req.user.id];
    const r = await pool.query(query, params);
    res.json({ chain: r.rows, total: r.rows.length, verified: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/horizon', requireAuth, async (req, res) => {
  try {
    const { jurisdictions, practice_areas, organisation_type } = req.body;
    const content = await ai.horizonScan({ jurisdictions, practice_areas, organisation_type });
    const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,'Legal Horizon Scan','HORIZON',$2,'complete',$3,$4) RETURNING id`, [req.user.id, content, content.split(/\s+/).length, Array.isArray(jurisdictions)? jurisdictions.join(', ') : jurisdictions || 'Multiple']);
    await audit(req.user.id, 'horizon_scan', 'document', r.rows[0].id, { jurisdictions });
    res.json({ content, doc_id: r.rows[0].id, word_count: content.split(/\s+/).length });
  } catch (err) { console.error('[horizon]', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/predict', requireAuth, async (req, res) => {
  try {
    const { facts, jurisdiction, claim_type, opposing_arguments } = req.body;
    if (!facts) return res.status(400).json({ error: 'Case facts required' });
    const content = await ai.predictLitigation({ facts, jurisdiction, claim_type, opposing_arguments });
    await audit(req.user.id, 'litigation_prediction', 'analysis', null, { claim_type, jurisdiction });
    res.json({ prediction: content, word_count: content.split(/\s+/).length });
  } catch (err) { console.error('[predict]', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/compare', requireAuth, async (req, res) => {
  try {
    const { topic, jurisdictions, focus } = req.body;
    if (!topic) return res.status(400).json({ error: 'Comparison topic required' });
    const content = await ai.comparativeLaw({ topic, jurisdictions, focus });
    const r = await pool.query(`INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,$2,'COMPARATIVE',$3,'complete',$4,'Multiple') RETURNING id`, [req.user.id, `Comparative Law: ${topic.substring(0, 80)}`, content, content.split(/\s+/).length]);
    await audit(req.user.id, 'comparative_law', 'document', r.rows[0].id, { topic });
    res.json({ content, doc_id: r.rows[0].id, word_count: content.split(/\s+/).length });
  } catch (err) { console.error('[compare]', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/documents', requireAuth, async (req, res) => {
  try {
    const { type, limit = 20, offset = 0 } = req.query;
    const query = type? 'SELECT id,title,type,status,word_count,jurisdiction,created_at FROM documents WHERE user_id=$1 AND type=$2 ORDER BY created_at DESC LIMIT $3 OFFSET $4' : 'SELECT id,title,type,status,word_count,jurisdiction,created_at FROM documents WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    const params = type? [req.user.id, type, limit, offset] : [req.user.id, limit, offset];
    const r = await pool.query(query, params);
    const count = await pool.query('SELECT COUNT(*) FROM documents WHERE user_id=$1', [req.user.id]);
    res.json({ documents: r.rows, total: parseInt(count.rows[0].count), limit, offset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/documents/:id', requireAuth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM documents WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Document not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/templates', (req, res) => {
  const categories = {
    'Core Legal': ['NDA', 'CONTRACT', 'EMPLOYMENT', 'LEASE', 'PARTNERSHIP', 'SHAREHOLDER', 'TERMS', 'PRIVACY', 'WILL', 'POA', 'LOI', 'MOU', 'TRUST', 'DISCLAIMER', 'REFUND_POLICY', 'ACCESSIBILITY', 'IP_ASSIGNMENT', 'SOFTWARE_LICENSE', 'WHITE_LABEL', 'AFFILIATE', 'COOKIE_POLICY', 'DMCA', 'CEASE_DESIST'],
    'Safeguarding & Compliance': ['SAFEGUARDING_POLICY', 'SAFEGUARDING_REPORT', 'SAFEGUARDING_CHRONOLOGY', 'INCIDENT_REPORT', 'RISK_ASSESSMENT', 'GOVERNANCE_REPORT', 'BOARD_MINUTES', 'DPA', 'GDPR_POLICY'],
    'Human Rights & Equality': ['EQUALITY_POLICY', 'HUMAN_RIGHTS_ASSESSMENT', 'COMPLAINT_PROCEDURE', 'DISCIPLINARY_POLICY', 'WHISTLEBLOWING_POLICY'],
    'Religious Organisations': ['CHURCH_CONSTITUTION', 'PASTORAL_POLICY', 'MEMBERSHIP_AGREEMENT', 'CHARITY_GOVERNANCE'],
    'Immigration': ['WORK_PERMIT', 'SPONSORSHIP_LETTER', 'VISA_SUPPORT', 'IMMIGRATION_ADVICE'],
    'Corporate & Finance': ['TERM_SHEET', 'CONVERTIBLE_NOTE', 'INVESTMENT_AGREEMENT', 'SHAREHOLDER_RESOLUTION', 'COMPANY_CONSTITUTION', 'DIRECTOR_SERVICE'],
    'Case Management': ['CASE_SUMMARY', 'LEGAL_CHRONOLOGY', 'EVIDENCE_SUMMARY', 'LEGAL_OPINION', 'DEMAND_LETTER', 'SETTLEMENT_AGREEMENT'],
  };
  const templates = {};
  for (const [cat, keys] of Object.entries(categories)) {
    templates[cat] = keys.map(k => ({ key: k, name: ai.TEMPLATES[k] || k }));
  }
  res.json({ templates, total: Object.keys(ai.TEMPLATES).length });
});

router.get('/jurisdictions', (req, res) => {
  res.json({ jurisdictions: ai.JURISDICTIONS, total: Object.keys(ai.JURISDICTIONS).length });
});

router.get('/status', requireAuth, async (req, res) => {
  try {
    const docCount = await pool.query('SELECT COUNT(*) FROM documents WHERE user_id=$1', [req.user.id]);
    const evidenceCount = await pool.query('SELECT COUNT(*) FROM evidence WHERE user_id=$1', [req.user.id]).catch(() => ({ rows: [{ count: 0 }] }));
    const userInfo = await pool.query('SELECT email,plan,docs_used_this_month,docs_credits,firm_id FROM users WHERE id=$1', [req.user.id]);
    res.json({ status: 'active', version: '3.0', user: userInfo.rows[0], stats: { documents: parseInt(docCount.rows[0].count), evidence_items: parseInt(evidenceCount.rows[0].count) }, features: ['draft', 'research', 'analyze', 'safeguarding', 'case-summary', 'chronology', 'evidence', 'horizon', 'predict', 'compare'], jurisdictions: Object.keys(ai.JURISDICTIONS).length, templates: Object.keys(ai.TEMPLATES).length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/evidence/upload-file', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided (field name: file)' });
    const { case_id } = req.body;
    const filename = req.file.originalname;
    const fileSize = req.file.size;
    const sha256 = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    let extractedText = null;
    if (/\.pdf$/i.test(filename)) { try { const parsed = await pdfParse(req.file.buffer); extractedText = (parsed.text || '').slice(0, 100000); } catch (e) {} } else if (/\.(txt|csv|rtf)$/i.test(filename)) { extractedText = req.file.buffer.toString('utf8').slice(0, 100000); }
    const prevResult = await pool.query('SELECT chain_hash FROM evidence WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT 1', [req.user.id]);
    const prevHash = prevResult.rows[0]?.chain_hash || '0'.repeat(64);
    const chainData = JSON.stringify({ sha256, prev: prevHash, ts: new Date().toISOString() });
    const chainHash = crypto.createHash('sha256').update(chainData).digest('hex');
    const r = await pool.query(`INSERT INTO evidence(user_id,case_id,filename,sha256,prev_hash,chain_hash,file_size,status) VALUES($1,$2,$3,$4,$5,$6,$7,'Admissible') RETURNING id`, [req.user.id, case_id || null, filename, sha256, prevHash, chainHash, fileSize]);
    await audit(req.user.id, 'evidence_upload_file', 'evidence', r.rows[0].id, { filename, sha256, size: fileSize, mimetype: req.file.mimetype });
    res.json({ id: r.rows[0].id, filename, sha256, chain_hash: chainHash, file_size: fileSize, text_extracted:!!extractedText, status: 'Admissible', timestamp: new Date().toISOString() });
  } catch (err) { console.error('[evidence-file]', err.message); res.status(500).json({ error: err.message }); }
});

const AUDIO_EXT = /\.(mp3|mp4|wav|m4a|ogg|webm|flac|aac)$/i;
function formatTimestamp(seconds) { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = Math.floor(seconds % 60); return [h,m,s].map(v => String(v).padStart(2,'0')).join(':'); }
async function transcribeAudio(buffer, mimeType, language) {
  const REPLICATE_TOKEN = process.env.REPLICATE || process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) throw new Error('Replicate API key not configured');
  const b64 = buffer.toString('base64'); const dataUrl = `data:${mimeType};base64,${b64}`;
  const startRes = await fetch('https://api.replicate.com/v1/models/openai/whisper/predictions', { method: 'POST', headers: { 'Authorization': `Token ${REPLICATE_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ input: { audio: dataUrl, language: language === 'auto'? null : language, word_timestamps: false, temperature: 0, condition_on_previous_text: false } }) });
  const prediction = await startRes.json(); if (!prediction.id) throw new Error('Replicate start failed: ' + JSON.stringify(prediction));
  const pollUrl = `https://api.replicate.com/v1/predictions/${prediction.id}`; let result;
  for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 5000)); const pollRes = await fetch(pollUrl, { headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` } }); result = await pollRes.json(); if (result.status === 'succeeded') break; if (result.status === 'failed') throw new Error('Transcription failed: ' + result.error); }
  if (result.status!== 'succeeded') throw new Error('Transcription timed out'); return result.output;
}
function formatCourtTranscript(segments, detectedLang, filename) {
  const lines = []; lines.push(`COURT TRANSCRIPTION RECORD`); lines.push(`${'='.repeat(60)}`); lines.push(`File: ${filename}`); lines.push(`Language: ${detectedLang || 'Unknown'}`); lines.push(`Date: ${new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}`); lines.push(`${'='.repeat(60)}`); lines.push('');
  if (Array.isArray(segments)) { segments.forEach((seg, idx) => { const lineNum = String(idx + 1).padStart(4, '0'); const ts = `[${formatTimestamp(seg.start || 0)} - ${formatTimestamp(seg.end || 0)}]`; lines.push(`LINE ${lineNum} ${ts}`); lines.push(` ${(seg.text || '').trim()}`); lines.push(''); }); } else { const words = String(segments).split(' '); let cur = '', lineIdx = 1; words.forEach(w => { if ((cur + ' ' + w).length > 80) { lines.push(`LINE ${String(lineIdx++).padStart(4,'0')} ${cur.trim()}`); cur = w; } else { cur += (cur? ' ' : '') + w; } }); if (cur) lines.push(`LINE ${String(lineIdx).padStart(4,'0')} ${cur.trim()}`); }
  lines.push(''); lines.push(`${'='.repeat(60)}`); lines.push(`END OF TRANSCRIPTION`); return lines.join('\n');
}
function formatDocTranscript(text, filename) { const lines = []; lines.push(`DOCUMENT TRANSCRIPTION RECORD`); lines.push(`${'='.repeat(60)}`); lines.push(`File: ${filename}`); lines.push(`Date: ${new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}`); lines.push(`${'='.repeat(60)}`); lines.push(''); const paras = text.split(/\n+/).filter(l => l.trim()); paras.forEach((para, idx) => { const lineNum = String(idx + 1).padStart(4, '0'); lines.push(`LINE ${lineNum} ${para.trim()}`); }); lines.push(''); lines.push(`${'='.repeat(60)}`); lines.push(`END OF TRANSCRIPTION`); return lines.join('\n'); }

router.post('/transcribe', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filename = req.file.originalname; const language = req.body.language || 'auto';
    let transcript, detectedLang = language, type = 'document';
    if (AUDIO_EXT.test(filename)) { type = 'audio'; const output = await transcribeAudio(req.file.buffer, req.file.mimetype, language); detectedLang = output.detected_language || language; transcript = formatCourtTranscript(output.segments || output.transcription, detectedLang, filename); } else if (/\.pdf$/i.test(filename)) { const parsed = await pdfParse(req.file.buffer); transcript = formatDocTranscript(parsed.text, filename); } else if (/\.docx?$/i.test(filename)) { const mammoth = require('mammoth'); const result = await mammoth.extractRawText({ buffer: req.file.buffer }); transcript = formatDocTranscript(result.value, filename); } else { transcript = formatDocTranscript(req.file.buffer.toString('utf8'), filename); }
    await audit(req.user.id, 'transcribe', 'transcription', null, { filename, language, type });
    res.json({ transcript, filename, language: detectedLang, type, lines: transcript.split('\n').length });
  } catch (err) { console.error('[transcribe]', err.message); res.status(500).json({ error: err.message }); }
});

const _libRateMap = new Map();
router.post('/library/expand', async (req, res) => {
  try {
    const { topic, jurisdiction = 'General' } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const isAuthed =!!req.user;
    if (!isAuthed) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
      const today = new Date().toISOString().slice(0, 10); const key = ip + ':' + today;
      const entry = _libRateMap.get(key) || { count: 0 };
      if (entry.count >= 3) { return res.status(402).json({ limitReached: true, error: 'Free daily limit reached. Top up to continue.' }); }
      entry.count++; _libRateMap.set(key, entry);
      if (_libRateMap.size > 5000) { for (const [k] of _libRateMap) { if (!k.includes(today)) _libRateMap.delete(k); } }
    }
    const topicLabels = { origins: 'Origins & Sources of Law', public: 'Public Law & Government', contract: 'Contract Law', tort: 'Tort Law', trusts: 'Trusts & Equity', property: 'Property & Succession', criminal: 'Criminal Law', family: 'Family & Safeguarding', commercial: 'Commercial & Company Law', specialist: 'Specialist Branches of Law', procedure: 'Courts & Procedure', international: 'International & Comparative Law' };
    const topicName = topicLabels[topic] || topic;
    const jxNote = jurisdiction && jurisdiction!== 'General'? ` Focus specifically on how this applies in ${jurisdiction}, including local statutes, cases, and any unique rules.` : ' Give a general common law / international overview.';
    const prompt = `You are LexAI, an expert legal knowledge assistant. Provide a clear, educational explanation of "${topicName}" for a general audience (not legal advice).${jxNote}\n\nStructure your response with:\n1. A brief overview (2-3 sentences)\n2. Key principles and concepts (use plain English)\n3. How it works in practice (real examples where helpful)\n4. ${jurisdiction!== 'General'? jurisdiction + ' specific notes' : 'Jurisdiction variations to be aware of'}\n5. Common questions or misconceptions\n\nBe thorough but accessible. Use clear headings. Aim for 400-600 words.`;
    const result = await ai.generateDocument(prompt, 'research', { maxTokens: 1500, temperature: 0.3 });
    if (result.error) throw new Error(result.error);
    const content = result.draft;
    res.json({ content, topic, jurisdiction });
  } catch (err) { console.error('[library/expand]', err.message); res.status(500).json({ error: 'Failed to expand topic. Please try again.' }); }
});

module.exports = router;
