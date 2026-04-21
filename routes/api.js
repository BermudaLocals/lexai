const express = require('express')
const router = express.Router()
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../db')
const ai = require('../services/ai')
const caselaw = require('../services/caselaw')
const learning = require('../services/learning')
const { requireAuth, requirePaid, requirePro, requireFirm, checkDocLimit } = require('../middleware/auth')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: (parseInt(process.env.MAX_UPLOAD_MB) || 50) * 1024 * 1024 } })

// ── Helper: extract text from uploaded file ───────────────
async function extractText(file) {
  if (!file) return null
  if (file.mimetype === 'application/pdf') {
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(file.buffer)
    return data.text
  }
  if (file.mimetype.includes('word') || file.originalname.endsWith('.docx')) {
    const mammoth = require('mammoth')
    const r = await mammoth.extractRawText({ buffer: file.buffer })
    return r.value
  }
  return file.buffer.toString('utf-8')
}

// ── Helper: audit log ─────────────────────────────────────
async function audit(userId, action, resourceType, resourceId, meta = {}) {
  try {
    await pool.query(
      'INSERT INTO audit_log(user_id,action,resource_type,resource_id,metadata) VALUES($1,$2,$3,$4,$5)',
      [userId, action, resourceType, resourceId, JSON.stringify(meta)]
    )
  } catch {}
}

// ── HEALTH ────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'lexai', version: '2.0.0' }))

// ── DASHBOARD ─────────────────────────────────────────────
router.get('/dashboard', requireAuth, async (req, res) => {
  const [docs, analyses, workflows, agents, stats, learning_stats] = await Promise.all([
    pool.query('SELECT id,title,type,status,created_at,word_count FROM documents WHERE user_id=$1 ORDER BY created_at DESC LIMIT 8', [req.user.id]),
    pool.query('SELECT id,title,type,risk_score,created_at FROM analyses WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5', [req.user.id]),
    pool.query('SELECT id,name,run_count FROM workflows WHERE user_id=$1 ORDER BY run_count DESC LIMIT 5', [req.user.id]),
    pool.query('SELECT id,name,type,run_count FROM agents WHERE is_public=TRUE ORDER BY run_count DESC LIMIT 6'),
    pool.query('SELECT COUNT(*) as docs FROM documents WHERE user_id=$1', [req.user.id]),
    learning.getLearningStats(req.user.id),
  ])

  res.json({
    user: { name: req.user.name, email: req.user.email, plan: req.user.plan, avatar_url: req.user.avatar_url, firm_name: req.user.firm_name },
    stats: { total_documents: parseInt(stats.rows[0].docs), docs_this_month: req.user.docs_used_this_month, ...learning_stats },
    recent_docs: docs.rows, recent_analyses: analyses.rows,
    workflows: workflows.rows, featured_agents: agents.rows,
    templates: Object.entries(ai.TEMPLATES).map(([k, v]) => ({ key: k, name: v })),
  })
})

// ── 1. DRAFT DOCUMENT ─────────────────────────────────────
router.post('/draft', requireAuth, checkDocLimit, async (req, res) => {
  const { type, parties, jurisdiction, details, tone } = req.body
  if (!type) return res.status(400).json({ error: 'Type required' })
  try {
    const content = await ai.draftDocument({ type, parties, jurisdiction, details, tone, userId: req.user.id })
    const title = `${ai.TEMPLATES[type] || type} — ${new Date().toLocaleDateString()}`
    const r = await pool.query(
      'INSERT INTO documents(user_id,title,type,content,status,word_count,jurisdiction) VALUES($1,$2,$3,$4,\'draft\',$5,$6) RETURNING id',
      [req.user.id, title, type, content, content.split(/\s+/).length, jurisdiction || 'United States']
    )
    await pool.query('UPDATE users SET docs_used_this_month=docs_used_this_month+1 WHERE id=$1', [req.user.id])
    await learning.learnFromDocument(req.user.id, content, type)
    await audit(req.user.id, 'draft_document', 'document', r.rows[0].id, { type })
    res.json({ content, doc_id: r.rows[0].id, word_count: content.split(/\s+/).length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 2. CONTRACT ANALYSIS ─────────────────────────────────
router.post('/analyze', requireAuth, requirePaid, upload.single('file'), async (req, res) => {
  try {
    let text = req.body.text || ''
    if (req.file) text = await extractText(req.file) || text
    if (!text?.trim()) return res.status(400).json({ error: 'Text or file required' })
    const analysis = await ai.analyzeContract(text, req.user.id)
    const r = await pool.query(
      'INSERT INTO analyses(user_id,type,title,result,risk_score) VALUES($1,\'contract\',$2,$3,$4) RETURNING id',
      [req.user.id, `Contract Analysis — ${new Date().toLocaleDateString()}`, JSON.stringify(analysis), analysis.risk_score]
    )
    await learning.learnFromDocument(req.user.id, text, 'contract')
    res.json({ analysis, analysis_id: r.rows[0].id })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 3. LEGAL RESEARCH + REAL CASE LAW ────────────────────
router.post('/research', requireAuth, requirePaid, async (req, res) => {
  const { query, jurisdiction, area_of_law } = req.body
  if (!query) return res.status(400).json({ error: 'Query required' })
  try {
    const result = await ai.legalResearch({ query, jurisdiction, area_of_law, userId: req.user.id })
    await pool.query(
      'INSERT INTO research_queries(user_id,query,jurisdiction,area_of_law,result,case_law_results) VALUES($1,$2,$3,$4,$5,$6)',
      [req.user.id, query, jurisdiction, area_of_law, result.memo, JSON.stringify(result.cases)]
    )
    res.json(result)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 4. CASE LAW SEARCH (Westlaw/Juris equivalent) ────────
router.post('/caselaw', requireAuth, requirePaid, async (req, res) => {
  const { query, jurisdiction, area_of_law, limit, after_date, source } = req.body
  if (!query) return res.status(400).json({ error: 'Query required' })
  try {
    const n = limit || 10
    const opts = { query, jurisdiction, area_of_law, limit: n, after_date }
    const sourceMap = {
      'courtlistener':     () => caselaw.searchCourtListener({ query, jurisdiction, limit: n, after_date }),
      'harvard':           () => caselaw.searchHarvardCAP({ query, jurisdiction, limit: n }),
      'bermuda':           () => caselaw.searchBermudaGov({ query, limit: n }),
      'privycouncil':      () => caselaw.searchBermudaPrivyCouncil({ query, limit: n }),
      'canlii':            () => caselaw.searchCanLII({ query, jurisdiction, limit: n }),
      'ccj':               () => caselaw.searchCCJ({ query, limit: n }),
      'commonlii':         () => caselaw.searchCommonLII({ query, jurisdiction, limit: n }),
      'statutes':          () => caselaw.searchStatutes({ query, jurisdiction, limit: n }),
    }
    const fn = source && sourceMap[source.toLowerCase()]
    const results = fn ? await fn() : await caselaw.searchCaseLaw(opts)
    res.json(results)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/caselaw/case/:caseId', requireAuth, requirePaid, async (req, res) => {
  try {
    const c = await caselaw.getCaseByID(req.params.caseId)
    if (!c) return res.status(404).json({ error: 'Case not found' })
    res.json(c)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 5. LITIGATION PREDICTION ─────────────────────────────
router.post('/predict', requireAuth, requirePro, async (req, res) => {
  const { case_summary, jurisdiction, area_of_law } = req.body
  if (!case_summary) return res.status(400).json({ error: 'Case summary required' })
  try {
    const result = await ai.predictLitigation({ caseSummary: case_summary, jurisdiction, areaOfLaw: area_of_law, userId: req.user.id })
    const r = await pool.query(
      'INSERT INTO litigation_predictions(user_id,case_summary,jurisdiction,area_of_law,prediction,confidence_score,case_law_cited) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [req.user.id, case_summary, jurisdiction, area_of_law, JSON.stringify(result.prediction), result.prediction.confidence_score / 100, JSON.stringify(result.case_law)]
    )
    res.json({ ...result, prediction_id: r.rows[0].id })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 6. DUE DILIGENCE ─────────────────────────────────────
router.post('/due-diligence', requireAuth, requirePro, upload.array('files', 15), async (req, res) => {
  try {
    const texts = []
    for (const f of req.files || []) {
      const t = await extractText(f)
      if (t) texts.push(`[${f.originalname}]\n${t}`)
    }
    if (req.body.texts) texts.push(...(Array.isArray(req.body.texts) ? req.body.texts : [req.body.texts]))
    if (!texts.length) return res.status(400).json({ error: 'At least 1 document required' })
    const result = await ai.dueDiligence(texts, req.user.id)
    res.json({ result })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 7. DEEP ANALYSIS (Harvey flagship) ───────────────────
router.post('/deep-analysis', requireAuth, requirePro, upload.array('files', 20), async (req, res) => {
  try {
    const docs = []
    for (const f of req.files || []) {
      const t = await extractText(f)
      if (t) docs.push(t)
    }
    if (req.body.documents) docs.push(...(Array.isArray(req.body.documents) ? req.body.documents : [req.body.documents]))
    if (!docs.length) return res.status(400).json({ error: 'Documents required' })
    const result = await ai.deepAnalysis({ documents: docs, analysisType: req.body.analysis_type, questions: req.body.questions, userId: req.user.id })
    res.json({ result })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 8. RISK ANALYSIS ─────────────────────────────────────
router.post('/risk', requireAuth, requirePaid, async (req, res) => {
  if (!req.body.text) return res.status(400).json({ error: 'Text required' })
  try {
    const risk = await ai.riskAnalysis(req.body.text, req.user.id)
    res.json({ risk })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 9. CLAUSE EXTRACTION ─────────────────────────────────
router.post('/clauses', requireAuth, requirePaid, async (req, res) => {
  if (!req.body.text) return res.status(400).json({ error: 'Text required' })
  try { res.json({ clauses: await ai.extractClauses(req.body.text) }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 10. COMPLIANCE CHECK ─────────────────────────────────
router.post('/compliance', requireAuth, requirePaid, async (req, res) => {
  const { text, regulations, jurisdiction } = req.body
  if (!text) return res.status(400).json({ error: 'Text required' })
  try { res.json({ compliance: await ai.complianceCheck({ text, regulations, jurisdiction }) }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 11. M&A WORKFLOW ─────────────────────────────────────
router.post('/ma', requireAuth, requirePro, upload.array('files', 10), async (req, res) => {
  try {
    const docs = []
    for (const f of req.files || []) { const t = await extractText(f); if (t) docs.push(t) }
    const result = await ai.maWorkflow({ targetName: req.body.target_name, dealType: req.body.deal_type, documents: docs, userId: req.user.id })
    res.json({ result })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 12. TRANSLATE ─────────────────────────────────────────
router.post('/translate', requireAuth, requirePaid, async (req, res) => {
  const { text, target_language } = req.body
  if (!text || !target_language) return res.status(400).json({ error: 'Text and language required' })
  try { res.json({ result: await ai.translateDocument(text, target_language), target_language }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 13. PROOFREAD ─────────────────────────────────────────
router.post('/proofread', requireAuth, async (req, res) => {
  if (!req.body.text) return res.status(400).json({ error: 'Text required' })
  try { res.json(await ai.proofreadDocument(req.body.text)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 14. TRANSCRIPT SUMMARY ───────────────────────────────
router.post('/transcribe', requireAuth, requirePaid, async (req, res) => {
  if (!req.body.transcript) return res.status(400).json({ error: 'Transcript required' })
  try { res.json({ result: await ai.summarizeTranscript(req.body.transcript) }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 15. WORDS TO WORKFLOW ────────────────────────────────
router.post('/words-to-workflow', requireAuth, requirePaid, async (req, res) => {
  if (!req.body.description) return res.status(400).json({ error: 'Description required' })
  try {
    const workflow = await ai.wordsToWorkflow(req.body.description)
    const r = await pool.query(
      'INSERT INTO workflows(user_id,name,description,natural_language_prompt,steps,category) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      [req.user.id, workflow.name, workflow.description, req.body.description, JSON.stringify(workflow.steps), workflow.category]
    )
    res.json({ ...workflow, workflow_id: r.rows[0].id })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 16. AGENTS ────────────────────────────────────────────
router.get('/agents', requireAuth, async (req, res) => {
  const [own, pub] = await Promise.all([
    pool.query('SELECT * FROM agents WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]),
    pool.query('SELECT * FROM agents WHERE is_public=TRUE ORDER BY run_count DESC LIMIT 20'),
  ])
  res.json({ own: own.rows, prebuilt: pub.rows })
})

router.post('/agents', requireAuth, requirePaid, async (req, res) => {
  const { name, description, system_prompt, steps, tools, model, is_long_horizon } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  try {
    const r = await pool.query(
      'INSERT INTO agents(user_id,name,description,system_prompt,steps,tools,model,is_long_horizon) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [req.user.id, name, description, system_prompt, JSON.stringify(steps || []), tools || [], model || 'claude-haiku-4-5-20251001', is_long_horizon || false]
    )
    res.json(r.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/agents/:id/run', requireAuth, requirePaid, async (req, res) => {
  const agentR = await pool.query('SELECT * FROM agents WHERE id=$1 AND (user_id=$2 OR is_public=TRUE)', [req.params.id, req.user.id])
  if (!agentR.rows.length) return res.status(404).json({ error: 'Agent not found' })
  const agent = agentR.rows[0]
  const start = Date.now()
  try {
    const run = await ai.runAgent({ agent, inputs: req.body.inputs || {}, userId: req.user.id, isLongHorizon: agent.is_long_horizon })
    const duration = Date.now() - start
    const r = await pool.query(
      'INSERT INTO agent_runs(agent_id,user_id,inputs,outputs,steps_completed,status,duration_ms) VALUES($1,$2,$3,$4,$5,\'complete\',$6) RETURNING id',
      [agent.id, req.user.id, JSON.stringify(req.body.inputs), JSON.stringify(run.results), run.results.length, duration]
    )
    await pool.query('UPDATE agents SET run_count=run_count+1 WHERE id=$1', [agent.id])
    res.json({ run_id: r.rows[0].id, ...run, duration_ms: duration })
  } catch (err) {
    await pool.query('INSERT INTO agent_runs(agent_id,user_id,inputs,status,error) VALUES($1,$2,$3,\'failed\',$4)', [agent.id, req.user.id, JSON.stringify(req.body.inputs), err.message])
    res.status(500).json({ error: err.message })
  }
})

// ── 17. WORKFLOWS ─────────────────────────────────────────
router.get('/workflows', requireAuth, async (req, res) => {
  const [own, pub] = await Promise.all([
    pool.query('SELECT * FROM workflows WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]),
    pool.query('SELECT * FROM workflows WHERE is_public=TRUE ORDER BY run_count DESC LIMIT 10'),
  ])
  res.json({ own: own.rows, public: pub.rows })
})

router.post('/workflows/:id/run', requireAuth, requirePaid, async (req, res) => {
  const wf = await pool.query('SELECT * FROM workflows WHERE id=$1', [req.params.id])
  if (!wf.rows.length) return res.status(404).json({ error: 'Workflow not found' })
  try {
    const agentRun = await ai.runAgent({ agent: wf.rows[0], inputs: req.body.inputs || {}, userId: req.user.id })
    await pool.query('UPDATE workflows SET run_count=run_count+1 WHERE id=$1', [wf.rows[0].id])
    res.json(agentRun)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 18. VAULT ─────────────────────────────────────────────
router.get('/vault', requireAuth, async (req, res) => {
  const { type, search, page = 1 } = req.query
  const limit = 20, offset = (page - 1) * limit
  let q = 'SELECT id,title,type,status,word_count,tags,jurisdiction,created_at FROM documents WHERE user_id=$1'
  const params = [req.user.id]
  if (type) { q += ` AND type=$${params.length + 1}`; params.push(type) }
  if (search) { q += ` AND title ILIKE $${params.length + 1}`; params.push(`%${search}%`) }
  q += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
  params.push(limit, offset)
  const [docs, count] = await Promise.all([pool.query(q, params), pool.query('SELECT COUNT(*) FROM documents WHERE user_id=$1', [req.user.id])])
  res.json({ documents: docs.rows, total: parseInt(count.rows[0].count), page, limit })
})

router.get('/vault/:id', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM documents WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' })
  res.json(r.rows[0])
})

router.put('/vault/:id', requireAuth, async (req, res) => {
  const { title, content, status, tags } = req.body
  await pool.query('UPDATE documents SET title=$1,content=$2,status=$3,tags=$4,updated_at=NOW() WHERE id=$5 AND user_id=$6', [title, content, status, tags, req.params.id, req.user.id])
  res.json({ success: true })
})

router.delete('/vault/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM documents WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
  res.json({ success: true })
})

// ── 19. SHARED SPACES ─────────────────────────────────────
router.post('/spaces', requireAuth, requirePro, async (req, res) => {
  const { name, description, client_email, permissions } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const token = uuidv4().replace(/-/g, '')
  const r = await pool.query(
    'INSERT INTO shared_spaces(owner_id,name,description,client_email,access_token,permissions,expires_at) VALUES($1,$2,$3,$4,$5,$6,NOW()+INTERVAL\'30 days\') RETURNING *',
    [req.user.id, name, description, client_email, token, JSON.stringify(permissions || { read: true })]
  )
  res.json({ space: r.rows[0], share_url: `${process.env.APP_URL}/space/${token}` })
})

router.get('/spaces', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM shared_spaces WHERE owner_id=$1 ORDER BY created_at DESC', [req.user.id])
  res.json({ spaces: r.rows })
})

// ── 20. SELF-LEARNING: Feedback ───────────────────────────
router.post('/feedback', requireAuth, async (req, res) => {
  const { resource_type, resource_id, original_output, corrected_output, score, notes } = req.body
  if (!score || !resource_type) return res.status(400).json({ error: 'Score and resource_type required' })
  try {
    await learning.recordFeedback({ userId: req.user.id, resourceType: resource_type, resourceId: resource_id, originalOutput: original_output, correctedOutput: corrected_output, score, notes })
    res.json({ success: true, message: 'Feedback recorded — LexAI is learning from this' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/learning-stats', requireAuth, async (req, res) => {
  try { res.json(await learning.getLearningStats(req.user.id)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 21. FREE PREVIEW ─────────────────────────────────────
router.post('/preview', async (req, res) => {
  const { type } = req.body
  if (!type) return res.status(400).json({ error: 'Type required' })
  try {
    const content = await ai.generatePreview(type)
    res.json({ content: `⚠️ PREVIEW ONLY — Create your free account to generate the full document\n\n${content}\n\n...[Full document requires a free account. Starter plan from $97/mo for unlimited access.]`, is_preview: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── 22. AUDIT LOG ─────────────────────────────────────────
router.get('/audit', requireAuth, requireFirm, async (req, res) => {
  const r = await pool.query('SELECT * FROM audit_log WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100', [req.user.id])
  res.json({ events: r.rows })
})

module.exports = router
