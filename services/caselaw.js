/**
 * LexAI Case Law Service v2.1
 * Sources:
 *   - CourtListener (courtlistener.com) — 4M+ US opinions
 *   - Harvard Caselaw Access Project (api.case.law) — 6.7M cases
 *   - Bermuda Judiciary (gov.bm/court-judgments) — FIXED v2.1
 *   - Bermuda Privy Council (jcpc.uk) — final appeals
 *   - CanLII (canlii.org) — Canada
 *   - Caribbean Court of Justice (ccj.org)
 *   - CommonLII (commonlii.org) — all 16 Caribbean jurisdictions
 */

const fetch = require('node-fetch')
const crypto = require('crypto')
const { pool } = require('../db')

const COURTLISTENER_BASE = 'https://www.courtlistener.com/api/rest/v4'
const HARVARD_CAP_BASE = 'https://api.case.law/v1'
const GOV_BM_BASE = 'https://www.gov.bm'

// ── COURT MAPS ───────────────────────────────────────────
const COURT_MAP = {
  'Supreme Court': 'scotus',
  'Federal Circuit': 'cafc',
  '1st Circuit': 'ca1', '2nd Circuit': 'ca2', '3rd Circuit': 'ca3',
  '4th Circuit': 'ca4', '5th Circuit': 'ca5', '6th Circuit': 'ca6',
  '7th Circuit': 'ca7', '8th Circuit': 'ca8', '9th Circuit': 'ca9',
  '10th Circuit': 'ca10', '11th Circuit': 'ca11', 'D.C. Circuit': 'cadc',
  'Delaware': 'deld', 'New York': 'ny', 'California': 'cal', 'Texas': 'tex',
}

const CARIBBEAN_JURISDICTIONS = [
  'Bahamas','Jamaica','Trinidad','Trinidad and Tobago','Barbados','Belize','Guyana',
  'BVI','British Virgin Islands','Cayman Islands','Dominica','Grenada','St Kitts',
  'Saint Kitts and Nevis','St Lucia','Saint Lucia','St Vincent','Montserrat',
  'Anguilla','Turks and Caicos','Turks & Caicos','Caribbean',
]

// ── MAIN SEARCH ──────────────────────────────────────────
async function searchCaseLaw({ query, jurisdiction, area_of_law, limit = 10, after_date }) {
  const cacheKey = crypto.createHash('md5')
    .update(`${query}${jurisdiction || ''}${area_of_law || ''}`)
    .digest('hex')

  // Check cache
  try {
    const cached = await pool.query(
      'SELECT results FROM case_law_cache WHERE query_hash=$1 AND expires_at>NOW()',
      [cacheKey]
    )
    if (cached.rows.length) {
      await pool.query(
        'UPDATE case_law_cache SET hit_count=hit_count+1 WHERE query_hash=$1',
        [cacheKey]
      )
      return cached.rows[0].results
    }
  } catch (e) { /* cache miss — continue */ }

  const isBermuda = !jurisdiction || ['Bermuda','bermuda'].includes(jurisdiction)
  const isCanada = jurisdiction && ['Canada','Ontario','British Columbia','BC','Alberta','Quebec','Nova Scotia','Manitoba','Saskatchewan'].includes(jurisdiction)
  const isCaribbean = !jurisdiction || isBermuda || CARIBBEAN_JURISDICTIONS.includes(jurisdiction)

  // Run all applicable searches in parallel
  const searches = [
    searchCourtListener({ query, jurisdiction, limit, after_date }).catch(() => ({ cases: [], total: 0 })),
    searchHarvardCAP({ query, jurisdiction, limit }).catch(() => ({ cases: [], total: 0 })),
  ]
  if (isBermuda) {
    searches.push(searchBermudaGov({ query, limit }).catch(() => ({ cases: [], total: 0 })))
    searches.push(searchBermudaPrivyCouncil({ query, limit }).catch(() => ({ cases: [], total: 0 })))
  }
  if (isCanada)    searches.push(searchCanLII({ query, jurisdiction, limit }).catch(() => ({ cases: [], total: 0 })))
  if (isCaribbean) searches.push(searchCCJ({ query, limit }).catch(() => ({ cases: [], total: 0 })))
  if (isCaribbean) searches.push(searchCommonLII({ query, jurisdiction, limit }).catch(() => ({ cases: [], total: 0 })))

  const settled = await Promise.allSettled(searches)

  const sources = ['CourtListener', 'Harvard Caselaw Access Project']
  if (isBermuda) sources.push('Bermuda Judiciary (gov.bm)', 'Privy Council (jcpc.uk)')
  if (isCanada) sources.push('CanLII')
  if (isCaribbean) sources.push('Caribbean Court of Justice', 'CommonLII Caribbean')

  const results = { cases: [], statutes: [], total_found: 0, sources, query, jurisdiction }
  const seenIds = new Set()

  for (const r of settled) {
    if (r.status === 'fulfilled' && r.value?.cases) {
      for (const c of r.value.cases) {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id)
          results.cases.push(c)
        }
      }
      results.total_found += r.value.total || 0
    }
  }

  results.cases.sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
  results.cases = results.cases.slice(0, limit)

  // Cache 24 hours
  try {
    await pool.query(
      `INSERT INTO case_law_cache (query_hash, query, jurisdiction, results, source, expires_at)
       VALUES ($1,$2,$3,$4,'combined',NOW()+INTERVAL '24 hours')
       ON CONFLICT (query_hash) DO UPDATE SET results=$4, expires_at=NOW()+INTERVAL '24 hours'`,
      [cacheKey, query, jurisdiction, JSON.stringify(results)]
    )
  } catch (e) { /* non-critical */ }

  return results
}

// ── COURTLISTENER ────────────────────────────────────────
async function searchCourtListener({ query, jurisdiction, limit = 10, after_date }) {
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'LexAI/2.1 (legal-research)',
  }
  if (process.env.COURTLISTENER_API_KEY) {
    headers['Authorization'] = `Token ${process.env.COURTLISTENER_API_KEY}`
  }

  const params = new URLSearchParams({
    q: query, type: 'o', order_by: 'score desc',
    stat_Precedential: 'on', count: limit, format: 'json',
  })
  if (jurisdiction && COURT_MAP[jurisdiction]) params.append('court', COURT_MAP[jurisdiction])
  if (after_date) params.append('filed_after', after_date)

  const res = await fetch(`${COURTLISTENER_BASE}/search/?${params}`, { headers, timeout: 10000 })
  if (!res.ok) throw new Error(`CourtListener ${res.status}`)
  const data = await res.json()

  return {
    cases: (data.results || []).map(c => ({
      id: `cl_${c.id}`,
      source: 'CourtListener',
      case_name: c.caseName || 'Unknown',
      citation: c.citation || c.citations?.[0]?.cite || '',
      court: c.court || '',
      date_decided: c.dateFiled || '',
      url: c.absolute_url ? `https://www.courtlistener.com${c.absolute_url}` : '',
      excerpt: c.snippet || '',
      relevance: c.score || 0,
      jurisdiction: jurisdiction || 'United States',
      status: 'Published',
    })),
    total: data.count || 0,
  }
}

// ── HARVARD CAP ──────────────────────────────────────────
async function searchHarvardCAP({ query, jurisdiction, limit = 10 }) {
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'LexAI/2.1 (legal-research)',
  }
  if (process.env.HARVARD_CAP_API_KEY) {
    headers['Authorization'] = `Token ${process.env.HARVARD_CAP_API_KEY}`
  }

  const params = new URLSearchParams({
    search: query, page_size: limit,
    ordering: '-decision_date', full_case: 'false',
  })
  const jMap = { 'United States': 'us', 'New York': 'ny', 'California': 'cal', 'Texas': 'tex', 'Delaware': 'del' }
  if (jurisdiction && jMap[jurisdiction]) params.append('jurisdiction', jMap[jurisdiction])

  const res = await fetch(`${HARVARD_CAP_BASE}/cases/?${params}`, { headers, timeout: 10000 })
  if (!res.ok) throw new Error(`Harvard CAP ${res.status}`)
  const data = await res.json()

  return {
    cases: (data.results || []).map(c => ({
      id: `cap_${c.id}`,
      source: 'Harvard Caselaw',
      case_name: c.name_abbreviation || c.name || 'Unknown',
      citation: c.citations?.[0]?.cite || '',
      court: c.court?.name || '',
      date_decided: c.decision_date || '',
      url: c.frontend_url || '',
      excerpt: c.preview?.[0] || '',
      relevance: 0.8,
      jurisdiction: c.jurisdiction?.name || '',
      status: 'Published',
    })),
    total: data.count || 0,
  }
}

// ── BERMUDA JUDICIARY (gov.bm) ────────────────────────────
// FIXED v2.1: Updated URL patterns + added /bermudas-court-system fallback
// gov.bm changed structure in 2024 — now uses multiple judgment index pages

async function searchBermudaGov({ query, limit = 10 }) {
  try {
    // Try multiple URL patterns — gov.bm has changed structure over the years
    const currentYear = new Date().getFullYear()
    const urlsToTry = [
      `${GOV_BM_BASE}/court-judgments`,                          // current year
      `${GOV_BM_BASE}/bermudas-court-system`,                    // court system overview
      `${GOV_BM_BASE}/court-judgments-${currentYear}`,           // explicit current year
      `${GOV_BM_BASE}/court-judgments-${currentYear - 1}`,       // last year
      `${GOV_BM_BASE}/court-judgments-${currentYear - 2}`,       // 2 years ago
    ]

    const pages = await Promise.allSettled(
      urlsToTry.map(url => fetchBermudaPage(url))
    )

    let allJudgments = []
    for (const p of pages) {
      if (p.status === 'fulfilled' && p.value?.length) {
        allJudgments.push(...p.value)
      }
    }

    // If main pages return nothing, try the court-system page for links
    if (allJudgments.length === 0) {
      const courtSystemLinks = await fetchBermudaCourtSystemLinks()
      const extraPages = await Promise.allSettled(
        courtSystemLinks.map(url => fetchBermudaPage(url))
      )
      for (const p of extraPages) {
        if (p.status === 'fulfilled' && p.value?.length) {
          allJudgments.push(...p.value)
        }
      }
    }

    // Deduplicate by citation
    const seen = new Set()
    allJudgments = allJudgments.filter(j => {
      if (seen.has(j.id)) return false
      seen.add(j.id)
      return true
    })

    // Score by relevance
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
    let scored = allJudgments.map(j => {
      const searchable = `${j.case_name} ${j.citation} ${j.court} ${j.excerpt}`.toLowerCase()
      let score = 0
      for (const term of queryTerms) {
        if (searchable.includes(term)) score++
        if (j.case_name.toLowerCase().includes(term)) score += 2
      }
      return { ...j, relevance: score }
    })

    // If no query matches, return most recent anyway (useful for "all Bermuda cases")
    if (queryTerms.length === 0 || scored.every(j => j.relevance === 0)) {
      scored = allJudgments.map(j => ({ ...j, relevance: 0.5 }))
    } else {
      scored = scored.filter(j => j.relevance > 0)
    }

    scored.sort((a, b) => b.relevance - a.relevance)
    return { cases: scored.slice(0, limit), total: scored.length }
  } catch (err) {
    console.error('Bermuda scraper error:', err.message)
    return { cases: [], total: 0 }
  }
}

async function fetchBermudaCourtSystemLinks() {
  try {
    const res = await fetch(`${GOV_BM_BASE}/bermudas-court-system`, {
      headers: { 'User-Agent': 'LexAI/2.1 (legal-research)', 'Accept': 'text/html' },
      timeout: 12000,
    })
    if (!res.ok) return []
    const html = await res.text()

    // Find links to judgment pages
    const links = []
    const pattern = /href="(\/[^"]*(?:judgment|ruling|decision|court)[^"]*)"/gi
    let m
    while ((m = pattern.exec(html)) !== null) {
      const url = `${GOV_BM_BASE}${m[1]}`
      if (!links.includes(url)) links.push(url)
    }
    return links.slice(0, 5)
  } catch {
    return []
  }
}

async function fetchBermudaPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'LexAI/2.1 (legal-research; bermuda-case-law)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      timeout: 15000,
    })
    if (!res.ok) return []
    const html = await res.text()
    return parseBermudaHtml(html, url)
  } catch {
    return []
  }
}

function parseBermudaHtml(html, sourceUrl) {
  const judgments = []
  const year = new Date().getFullYear()

  // Pattern 1: Direct PDF links with case names
  // <a href="/sites/default/files/YYYY-MM/CaseName [YEAR] SC (Bda) N type.pdf">
  const pdfPattern = /<a[^>]+href="(\/sites\/default\/files\/[^"]+\.pdf)"[^>]*>\s*([^<]{5,300})\s*<\/a>/gi
  let m
  while ((m = pdfPattern.exec(html)) !== null) {
    const pdfPath = m[1]
    const text = m[2].trim().replace(/\s+/g, ' ')
    const judgment = parseBermudaCitationText(text, pdfPath, year)
    if (judgment) judgments.push(judgment)
  }

  // Pattern 2: Table rows with judgment info
  // Some years use <tr><td>Case Name</td><td>Citation</td><td>Date</td><td><a href="...">PDF</a></td></tr>
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  while ((m = rowPattern.exec(html)) !== null) {
    const row = m[1]
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c =>
      c[1].replace(/<[^>]+>/g, '').trim()
    )
    if (cells.length >= 2) {
      const pdfMatch = row.match(/href="(\/[^"]+\.pdf)"/)
      const pdfPath = pdfMatch ? pdfMatch[1] : null
      const combinedText = cells.join(' ')
      if (combinedText.match(/\[\d{4}\]/) || combinedText.match(/\bv\b/i)) {
        const j = parseBermudaCitationText(combinedText, pdfPath, year)
        if (j && !judgments.find(existing => existing.id === j.id)) {
          judgments.push(j)
        }
      }
    }
  }

  // Pattern 3: Any link text containing Bermuda citations
  const linkPattern = /<a[^>]+href="([^"]+)"[^>]*>\s*([^<]{10,200})\s*<\/a>/gi
  while ((m = linkPattern.exec(html)) !== null) {
    const href = m[1]
    const text = m[2].trim().replace(/\s+/g, ' ')
    if (!text.match(/\[\d{4}\]\s*(SC|CA)\s*\(Bd[aA]\)/i)) continue
    const pdfPath = href.startsWith('/') ? href : null
    const fullUrl = href.startsWith('http') ? href : (pdfPath ? `${GOV_BM_BASE}${href}` : null)
    const j = parseBermudaCitationText(text, pdfPath, year, fullUrl)
    if (j && !judgments.find(ex => ex.id === j.id)) judgments.push(j)
  }

  return judgments
}

function parseBermudaCitationText(text, pdfPath, fallbackYear, fullUrl) {
  // Match: [YEAR] SC/CA (Bda/BDA) NUMBER type
  const citMatch = text.match(/\[(\d{4})\]\s+(SC|CA)\s+\(Bd[aA]\)\s+(\d+)\s*([\w.]+)?/i)
  if (!citMatch) return null

  const citeYear = citMatch[1]
  const courtCode = citMatch[2].toUpperCase()
  const citeNum = citMatch[3]
  const citeTypRaw = (citMatch[4] || 'civ').toLowerCase()
  const court = courtCode === 'CA' ? 'Court of Appeal of Bermuda' : 'Supreme Court of Bermuda'
  const citation = `[${citeYear}] ${courtCode} (Bda) ${citeNum} ${citeTypRaw}`

  let caseType = 'civil'
  if (citeTypRaw.startsWith('cri')) caseType = 'criminal'
  else if (citeTypRaw.startsWith('app')) caseType = 'appeal'
  else if (citeTypRaw.startsWith('com')) caseType = 'commercial'
  else if (citeTypRaw.startsWith('div')) caseType = 'family'
  else if (citeTypRaw.startsWith('const')) caseType = 'constitutional'

  // Extract case name (text before the citation)
  const caseName = text
    .replace(/\[[\d\s\w().,]+\].*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 120) || `[${citeYear}] ${courtCode} (Bda) ${citeNum}`

  // Extract date
  const dateMatch = text.match(/\((\d{1,2}\s+\w+\s+\d{4})\)/)
  const dateDecided = dateMatch ? dateMatch[1] : citeYear

  const docUrl = fullUrl || (pdfPath ? `${GOV_BM_BASE}${pdfPath}` : `${GOV_BM_BASE}/court-judgments`)

  return {
    id: `bda_${citeYear}_${courtCode.toLowerCase()}_${citeNum}`,
    source: 'Bermuda Judiciary',
    case_name: caseName,
    citation,
    court,
    date_decided: dateDecided,
    url: docUrl,
    excerpt: `${court} · ${caseType} · ${citation}`,
    relevance: 0.9,
    jurisdiction: 'Bermuda',
    case_type: caseType,
    pdf_url: docUrl,
    status: 'Published',
  }
}

// ── BERMUDA PRIVY COUNCIL ─────────────────────────────────
// Bermuda appeals go to the Judicial Committee of the Privy Council (jcpc.uk)
async function searchBermudaPrivyCouncil({ query, limit = 5 }) {
  try {
    const searchUrl = `https://www.jcpc.uk/cases/decided-cases/?search=${encodeURIComponent(query + ' Bermuda')}`
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'LexAI/2.1 (legal-research)', 'Accept': 'text/html' },
      timeout: 12000,
    })
    if (!res.ok) return { cases: [], total: 0 }
    const html = await res.text()

    const cases = []
    // JCPC page lists cases as: <a href="/cases/decided-cases/YYYY/JCPCYYYY_N.html">Party v Party [YEAR] UKPC N</a>
    const pattern = /<a[^>]+href="(\/cases\/decided-cases\/[^"]+)"[^>]*>([^<]{10,150})<\/a>/gi
    let m
    while ((m = pattern.exec(html)) !== null) {
      const href = m[1]
      const title = m[2].trim()
      if (!title.match(/bermuda/i) && !href.match(/bda|bermuda/i)) continue
      const yearMatch = title.match(/\[(\d{4})\]/)
      cases.push({
        id: `jcpc_bda_${href.replace(/\//g, '_')}`,
        source: 'Privy Council (JCPC)',
        case_name: title.replace(/\[\d{4}\].*$/, '').trim(),
        citation: title.match(/\[\d{4}\][^\)]+/)?.[0] || title,
        court: 'Judicial Committee of the Privy Council',
        date_decided: yearMatch?.[1] || '',
        url: `https://www.jcpc.uk${href}`,
        excerpt: 'Bermuda · Privy Council final appeal',
        relevance: 1.0,
        jurisdiction: 'Bermuda',
        status: 'Published',
      })
      if (cases.length >= limit) break
    }

    return { cases, total: cases.length }
  } catch (err) {
    return { cases: [], total: 0 }
  }
}

// ── STATUTES ─────────────────────────────────────────────
async function searchStatutes({ query, jurisdiction, limit = 5 }) {
  try {
    // Bermuda legislation at laws.gov.bm
    if (jurisdiction === 'Bermuda') {
      return searchBermudaStatutes({ query, limit })
    }

    const params = new URLSearchParams({ q: query, type: 'r', order_by: 'score desc', count: limit })
    const res = await fetch(`${COURTLISTENER_BASE}/search/?${params}`, {
      headers: { 'Accept': 'application/json' }, timeout: 8000,
    })
    if (!res.ok) return { statutes: [] }
    const data = await res.json()
    return {
      statutes: (data.results || []).slice(0, limit).map(s => ({
        title: s.caseName || s.title || 'Unknown',
        citation: s.citation || '',
        url: s.absolute_url ? `https://www.courtlistener.com${s.absolute_url}` : '',
        excerpt: s.snippet || '',
      }))
    }
  } catch { return { statutes: [] } }
}

async function searchBermudaStatutes({ query, limit = 5 }) {
  // Bermuda Laws Online: laws.gov.bm
  try {
    const url = `https://www.bermudalaws.bm/Laws/Consolidated%20Laws/Forms/AllItems.aspx`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LexAI/2.1', 'Accept': 'text/html' },
      timeout: 10000,
    })
    if (!res.ok) return { statutes: [] }
    const html = await res.text()
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
    const statutes = []
    const pattern = /<a[^>]+href="([^"]+\.pdf)"[^>]*>([^<]{5,150})<\/a>/gi
    let m
    while ((m = pattern.exec(html)) !== null) {
      const title = m[2].trim()
      const titleLower = title.toLowerCase()
      if (terms.some(t => titleLower.includes(t))) {
        statutes.push({
          title,
          citation: 'Bermuda Legislation',
          url: m[1].startsWith('http') ? m[1] : `https://www.bermudalaws.bm${m[1]}`,
          excerpt: 'Bermuda consolidated legislation',
          jurisdiction: 'Bermuda',
        })
        if (statutes.length >= limit) break
      }
    }
    return { statutes }
  } catch { return { statutes: [] } }
}

// ── GET CASE BY ID ────────────────────────────────────────
async function getCaseByID(caseId) {
  if (caseId.startsWith('cl_')) {
    const id = caseId.replace('cl_', '')
    const res = await fetch(`${COURTLISTENER_BASE}/opinions/${id}/`, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  }
  if (caseId.startsWith('cap_')) {
    const id = caseId.replace('cap_', '')
    const headers = { 'Accept': 'application/json' }
    if (process.env.HARVARD_CAP_API_KEY) headers['Authorization'] = `Token ${process.env.HARVARD_CAP_API_KEY}`
    const res = await fetch(`${HARVARD_CAP_BASE}/cases/${id}/?full_case=true`, { headers })
    if (!res.ok) return null
    return await res.json()
  }
  if (caseId.startsWith('bda_')) {
    // Return cached Bermuda case info
    return { id: caseId, source: 'Bermuda Judiciary', note: 'View PDF at gov.bm' }
  }
  return null
}

// ── CITATION PARSER ──────────────────────────────────────
function parseCitation(text) {
  const patterns = [
    /\d+\s+U\.S\.?\s+\d+/g,
    /\d+\s+F\.\d?d\s+\d+/g,
    /\d+\s+S\.Ct\.\s+\d+/g,
    /\[\d{4}\]\s+CCJ\s+\d+/g,
    /\[\d{4}\]\s+SC\s+\(Bda\)\s+\d+/g,
    /\[\d{4}\]\s+CA\s+\(BDA\)\s+\d+/g,
    /\[\d{4}\]\s+UKPC\s+\d+/g,
  ]
  const found = []
  for (const p of patterns) {
    const m = text.match(p) || []
    found.push(...m)
  }
  return [...new Set(found)]
}

// ── CANADA — CanLII ──────────────────────────────────────
const CANLII_BASE = 'https://api.canlii.org/v1'
const CANLII_DB_MAP = {
  'Ontario': ['onca', 'onsc'], 'British Columbia': ['bcca', 'bcsc'], 'BC': ['bcca', 'bcsc'],
  'Alberta': ['abca', 'abqb'], 'Quebec': ['qcca', 'qccs'], 'Nova Scotia': ['nsca', 'nssc'],
  'Manitoba': ['mbca', 'mbqb'], 'Saskatchewan': ['skca', 'skqb'], 'Canada': ['scc', 'fca', 'fc'],
}
const CANLII_DEFAULT = ['scc', 'fca', 'onca', 'bcca']

async function searchCanLII({ query, jurisdiction, limit = 10 }) {
  const apiKey = process.env.CANLII_API_KEY
  if (!apiKey) return { cases: [], total: 0 }
  try {
    const dbs = (jurisdiction && CANLII_DB_MAP[jurisdiction]) || CANLII_DEFAULT
    const results = []
    await Promise.allSettled(dbs.slice(0, 3).map(async (dbId) => {
      const params = new URLSearchParams({ api_key: apiKey, resultCount: Math.ceil(limit / dbs.length) + 2, searchQuery: query })
      const res = await fetch(`${CANLII_BASE}/caseBrowse/en/${dbId}/?${params}`, { headers: { 'Accept': 'application/json' }, timeout: 10000 })
      if (!res.ok) return
      const data = await res.json()
      results.push(...(data.cases || []).map(c => ({
        id: `canlii_${c.databaseId}_${c.caseId}`,
        source: 'CanLII',
        case_name: c.title || 'Unknown',
        citation: c.citation || '',
        court: dbId.toUpperCase(),
        date_decided: c.decisionDate || '',
        url: `https://www.canlii.org/en/${dbId}/${c.caseId}/`,
        excerpt: c.headnote || '',
        relevance: 0.75,
        jurisdiction: 'Canada',
        status: 'Published',
      })))
    }))
    return { cases: results.slice(0, limit), total: results.length }
  } catch { return { cases: [], total: 0 } }
}

// ── CCJ ──────────────────────────────────────────────────
const CCJ_BASE = 'https://ccj.org'

async function searchCCJ({ query, limit = 10 }) {
  try {
    const pages = await Promise.allSettled([
      fetchHTMLCases(`${CCJ_BASE}/appellate-jurisdiction-judgments/`, 'Caribbean Court of Justice'),
      fetchHTMLCases(`${CCJ_BASE}/original-jurisdiction-judgments/`, 'Caribbean Court of Justice'),
    ])
    let all = []
    for (const p of pages) { if (p.status === 'fulfilled') all.push(...p.value) }
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
    const scored = all.map(c => {
      const text = `${c.case_name} ${c.citation}`.toLowerCase()
      let score = 0
      for (const t of terms) { if (text.includes(t)) score++ }
      return { ...c, relevance: score }
    }).filter(c => c.relevance > 0)
    scored.sort((a, b) => b.relevance - a.relevance)
    return { cases: scored.slice(0, limit), total: scored.length }
  } catch { return { cases: [], total: 0 } }
}

async function fetchHTMLCases(url, sourceName) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'LexAI/2.1', 'Accept': 'text/html' }, timeout: 12000 })
    if (!res.ok) return []
    const html = await res.text()
    const cases = []
    const pattern = /<a[^>]+href="([^"]+)"[^>]*>([^<]{10,150})<\/a>/gi
    let m
    while ((m = pattern.exec(html)) !== null) {
      const title = m[2].trim()
      if (!title.match(/\[\d{4}\].*CCJ/i) && !title.match(/v\s+.*\[\d{4}\]/i)) continue
      const yearMatch = title.match(/\[(\d{4})\]/)
      cases.push({
        id: `ccj_${m[1].replace(/\//g, '_').slice(-40)}`,
        source: sourceName,
        case_name: title.replace(/\[\d{4}\].*$/, '').trim() || title,
        citation: title.match(/\[\d{4}\][^\(]*/)?.[0]?.trim() || title,
        court: 'Caribbean Court of Justice',
        date_decided: yearMatch?.[1] || '',
        url: m[1].startsWith('http') ? m[1] : `${CCJ_BASE}${m[1]}`,
        excerpt: 'CCJ · Caribbean Court of Justice',
        relevance: 0,
        jurisdiction: 'Caribbean',
        status: 'Published',
      })
    }
    return cases
  } catch { return [] }
}

// ── COMMONLII ────────────────────────────────────────────
const COMMONLII_BASE = 'https://www.commonlii.org'
const COMMONLII_DBS = {
  'Bahamas': ['bs/cases/BSSC','bs/cases/BSCA'], 'Jamaica': ['jm/cases/JMCA','jm/cases/JMSC'],
  'Trinidad': ['tt/cases/TTCA','tt/cases/TTHC'], 'Trinidad and Tobago': ['tt/cases/TTCA','tt/cases/TTHC'],
  'Barbados': ['bb/cases/BBCA','bb/cases/BBSC'], 'Belize': ['bz/cases/BZCA','bz/cases/BZSC'],
  'Guyana': ['gy/cases/GYCA','gy/cases/GYHC'], 'BVI': ['vg/cases/VGCA','vg/cases/VGHC'],
  'British Virgin Islands': ['vg/cases/VGCA','vg/cases/VGHC'], 'Cayman Islands': ['ky/cases/KYCA','ky/cases/KYGC'],
  'Dominica': ['dm/cases/DMHC'], 'Grenada': ['gd/cases/GDCA','gd/cases/GDHC'],
  'St Kitts': ['kn/cases/KNHC'], 'Saint Kitts and Nevis': ['kn/cases/KNHC'],
  'St Lucia': ['lc/cases/LCCA','lc/cases/LCHC'], 'Saint Lucia': ['lc/cases/LCCA','lc/cases/LCHC'],
  'St Vincent': ['vc/cases/VCCA','vc/cases/VCHC'], 'Montserrat': ['ms/cases/MSCA','ms/cases/MSHC'],
  'Anguilla': ['ai/cases/AIHC'], 'Turks and Caicos': ['tc/cases/TCHC'], 'Turks & Caicos': ['tc/cases/TCHC'],
}
const COMMONLII_DEFAULT = ['bs/cases/BSSC','jm/cases/JMCA','tt/cases/TTCA','bb/cases/BBSC','bz/cases/BZSC']
const COUNTRY_NAMES = { BS:'Bahamas',JM:'Jamaica',TT:'Trinidad & Tobago',BB:'Barbados',BZ:'Belize',GY:'Guyana',VG:'British Virgin Islands',KY:'Cayman Islands',DM:'Dominica',GD:'Grenada',KN:'St Kitts & Nevis',LC:'St Lucia',VC:'St Vincent',MS:'Montserrat',AI:'Anguilla',TC:'Turks & Caicos' }

async function searchCommonLII({ query, jurisdiction, limit = 10 }) {
  try {
    const dbs = (jurisdiction && COMMONLII_DBS[jurisdiction]) || COMMONLII_DEFAULT
    const results = await Promise.allSettled(dbs.slice(0, 4).map(async db => {
      const params = new URLSearchParams({ method: 'boolean', query, mask: db, results: Math.ceil(limit / 2), rank: 'on' })
      const res = await fetch(`${COMMONLII_BASE}/cgi-bin/sinosrch.cgi?${params}`, {
        headers: { 'User-Agent': 'LexAI/2.1', 'Accept': 'text/html' }, timeout: 12000,
      })
      if (!res.ok) return []
      const html = await res.text()
      const cases = []
      const pattern = /<a\s+href="(\/[a-z]{2}\/cases\/[^"]+\.html)"[^>]*>([^<]{5,150})<\/a>/gi
      let m
      while ((m = pattern.exec(html)) !== null) {
        const path = m[1], title = m[2].trim()
        if (title.length < 5) continue
        const yearMatch = path.match(/\/(\d{4})\//)
        const cc = db.split('/')[0].toUpperCase()
        cases.push({
          id: `commonlii${path.replace(/\//g,'_')}`,
          source: 'CommonLII',
          case_name: title,
          citation: yearMatch ? `${COUNTRY_NAMES[cc]||cc} ${yearMatch[1]}` : '',
          court: db.split('/cases/')[1] || cc,
          date_decided: yearMatch?.[1] || '',
          url: `${COMMONLII_BASE}${path}`,
          excerpt: `${COUNTRY_NAMES[cc]||cc} · ${db.split('/cases/')[1]||''}`,
          relevance: 0.7,
          jurisdiction: COUNTRY_NAMES[cc] || cc,
          status: 'Published',
        })
      }
      return cases
    }))

    let all = []
    for (const r of results) { if (r.status === 'fulfilled') all.push(...r.value) }
    const seen = new Set()
    all = all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true })
    return { cases: all.slice(0, limit), total: all.length }
  } catch { return { cases: [], total: 0 } }
}

// ─────────────────────────────────────────────────────────────────────────────
// INDIAN KANOON — Free Indian case law search (SC + all High Courts + Tribunals)
// API: POST https://api.indiankanoon.org/search/  formInput=<query>&pagenum=0
// ─────────────────────────────────────────────────────────────────────────────
async function searchIndianKanoon({ query, jurisdiction, limit = 10 }) {
  try {
    const courtFilter = (() => {
      if (!jurisdiction) return ''
      const j = jurisdiction.toLowerCase()
      if (j.includes('bombay'))   return ' doctypes:bombayHC'
      if (j.includes('delhi'))    return ' doctypes:delhiHC'
      if (j.includes('madras'))   return ' doctypes:madrasHC'
      if (j.includes('calcutta')) return ' doctypes:calcuttaHC'
      if (j.includes('supreme') || j.includes('india')) return ' doctypes:supremecourt'
      return ''
    })()
    const formInput = encodeURIComponent(query + courtFilter)
    const res = await fetch(
      `https://api.indiankanoon.org/search/?formInput=${formInput}&pagenum=0`,
      { method: 'POST', headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return { cases: [], total: 0 }
    const data = await res.json()
    const docs = (data.docs || []).slice(0, limit)
    return {
      cases: docs.map(d => ({
        id:          `ik_${d.tid}`,
        title:       d.title || 'Untitled',
        citation:    d.docsource || '',
        date:        d.publishdate || '',
        court:       d.docsource || 'Indian Court',
        jurisdiction: jurisdiction || 'India',
        summary:     d.fragment ? d.fragment.replace(/<[^>]+>/g, '') : '',
        url:         `https://indiankanoon.org/doc/${d.tid}/`,
        source:      'IndianKanoon'
      })),
      total: data.total || docs.length
    }
  } catch { return { cases: [], total: 0 } }
}

// ─────────────────────────────────────────────────────────────────────────────
// HKLII — Hong Kong Legal Information Institute
// Routes through CommonLII Hong Kong section (commonlii.org/hk/)
// ─────────────────────────────────────────────────────────────────────────────
async function searchHKLII({ query, limit = 10 }) {
  try {
    // Use CommonLII with HK-specific path filtering
    const base   = 'https://www.commonlii.org'
    const hkPaths = [
      '/hk/cases/HKCFA/',  // Court of Final Appeal
      '/hk/cases/HKCA/',   // Court of Appeal
      '/hk/cases/HKCFI/',  // Court of First Instance
    ]
    const searchUrl = `${base}/cgi-bin/sinosrch.cgi?method=boolean&query=${encodeURIComponent(query)}&db=hk&meta=%2Fhk&mask_path=hk%2Fcases`
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'LexAI/1.0 (legal research; contact@lexai.llc)' },
      signal: AbortSignal.timeout(12000)
    })
    if (!res.ok) return { cases: [], total: 0 }
    const html = await res.text()
    // Parse CommonLII search results
    const linkRe = /href="((\/hk\/cases\/[^"]+\.html))">([^<]+)<\/a>/gi
    const matches = []
    let m
    while ((m = linkRe.exec(html)) !== null && matches.length < limit) {
      const path  = m[1]
      const title = m[3].trim()
      if (!title || title.length < 5) continue
      const courtCode = path.split('/')[3] || 'HK'
      matches.push({
        id:          `hklii${path.replace(/\//g, '_')}`,
        title,
        citation:    title,
        court:       courtCode.startsWith('HKCFA') ? 'Court of Final Appeal'
                   : courtCode.startsWith('HKCA')  ? 'Court of Appeal'
                   : 'Court of First Instance',
        jurisdiction: 'Hong Kong',
        summary:     '',
        url:         `${base}${path}`,
        source:      'HKLII'
      })
    }
    return { cases: matches, total: matches.length }
  } catch { return { cases: [], total: 0 } }
}


module.exports = {
  searchCaseLaw,
  searchCourtListener,
  searchHarvardCAP,
  searchBermudaGov,
  searchBermudaPrivyCouncil,
  searchCanLII,
  searchCCJ,
  searchCommonLII,
  searchIndianKanoon,
  searchHKLII,
  searchStatutes,
  getCaseByID,
  parseCitation,
}
