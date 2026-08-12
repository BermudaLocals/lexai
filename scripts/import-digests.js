#!/usr/bin/env node
/**
 * LexAI — Commonwealth case-digest batch importer.
 *
 * Parses the Encyclopedia headnote format (as supplied by Digital King) and
 * loads it into the case_digests table. Designed for the REAL shape:
 *
 *   ISSUE: EVIDENTIAL VALUE OF A CONFESSIONAL STATEMENT ...
 *   PRINCIPLE:
 *   "A confession is the strongest evidence ..." Per. Tobi, JSC.
 *   CITATION:
 *   Omoju v. F.R.N (2008) ALL FWLR (Pt.415) 1656 at 1673 paras. B-D (SC)
 *   OTHER CITATION(S): (2008) 2-3 SC (Pt.1) ...
 *   Encyclopedia of Laws Evidence edited by T.A.O.Tugbiyele in 2 volumes.
 *   ---
 *
 * Labels are case-insensitive; a value may sit on the same line as its label
 * or on the lines beneath it. Entries are separated by `---`/`===` OR simply
 * by the start of the next `ISSUE:` block. A trailing unlabelled paragraph
 * after the citations is treated as the source.
 *
 * Usage:
 *   node scripts/import-digests.js <file.txt>            # import
 *   node scripts/import-digests.js <file.txt> --dry-run  # parse & preview only
 *   node scripts/import-digests.js <file.txt> --jurisdiction Ghana
 *
 * --dry-run needs no database — use it to eyeball parsing on a real batch
 * before committing anything.
 */
const fs = require('fs');
const path = require('path');

const LABELS = {
  'ISSUE': 'issue',
  'FACTS': 'facts',
  'FACT': 'facts',
  'PRINCIPLE': 'principle',
  'HELD': 'held',
  'RATIO': 'ratio',
  'RATIO DECIDENDI': 'ratio',
  'CITATION': 'citation',
  'OTHER CITATION(S)': 'other_citations',
  'OTHER CITATIONS': 'other_citations',
  'OTHER CITATION': 'other_citations',
  'SOURCE': 'source',
  'YEAR': 'year',
  'AREA': 'area',
  'AREA OF LAW': 'area',
  'COURT': 'court',
  'JURISDICTION': 'jurisdiction',
};

function matchLabel(line) {
  const m = line.match(/^\s*([A-Za-z()\/ ]+?)\s*:\s*(.*)$/);
  if (!m) return null;
  const key = m[1].trim().toUpperCase();
  if (!(key in LABELS)) return null;
  return { field: LABELS[key], value: m[2].trim() };
}

function parse(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  let cur = null;
  let field = null;

  const flush = () => {
    if (cur && (cur.citation || cur.issue || cur.principle)) entries.push(cur);
    cur = null; field = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === '---' || line === '===') { flush(); continue; }
    if (!line) { field = null; continue; }        // blank line ends a field

    const lab = matchLabel(line);
    if (lab) {
      // A fresh ISSUE starts a new entry when one is already in progress.
      if (lab.field === 'issue' && cur && (cur.citation || cur.principle)) flush();
      if (!cur) cur = {};
      if (lab.field === 'other_citations') {
        cur.other_citations = cur.other_citations || [];
        if (lab.value) cur.other_citations.push(lab.value);
        // Source characteristically follows the other-citations line.
        field = '_afterCites';
      } else {
        cur[lab.field] = lab.value || '';
        field = lab.field;
      }
      continue;
    }

    // Unlabelled continuation line.
    if (!cur) { cur = {}; }
    if (field === '_afterCites') {
      // Belongs to source unless it clearly reads like another citation line.
      if (/\(\d{4}\)|\bPt\.?\b|\bpara/i.test(line) && !/\b(edited|reports?|encyclopedia|press|law report)\b/i.test(line)) {
        cur.other_citations = cur.other_citations || [];
        cur.other_citations.push(line);
      } else {
        cur.source = cur.source ? cur.source + ' ' + line : line;
        field = 'source';
      }
    } else if (field) {
      cur[field] = (cur[field] ? cur[field] + ' ' : '') + line;
    }
  }
  flush();
  return entries.map(normalise);
}

function normalise(e) {
  const citation = (e.citation || '').trim();

  // Case name = everything before the first "(YYYY)".
  let caseName = e.case_name;
  if (!caseName) {
    const m = citation.match(/^(.*?)\s*\((?:18|19|20)\d{2}\)/);
    caseName = m ? m[1].trim() : citation.split(/\s{2,}|\bat\b/)[0].trim();
  }

  // Year = first 4-digit year in the citation.
  let year = e.year ? parseInt(String(e.year).match(/\d{4}/)?.[0], 10) : null;
  if (!year) { const m = citation.match(/\b((?:18|19|20)\d{2})\b/); year = m ? parseInt(m[1], 10) : null; }

  // Court from a trailing "(SC)" / "(CA)" marker.
  let court = e.court || null;
  if (!court) {
    if (/\(\s*SC\s*\)/i.test(citation)) court = 'Supreme Court';
    else if (/\(\s*CA\s*\)/i.test(citation)) court = 'Court of Appeal';
    else if (/\bFHC\b/i.test(citation)) court = 'Federal High Court';
  }

  // "Per. Tobi, JSC" → presiding judge.
  let perJudge = null;
  const pj = (e.principle || e.held || '').match(/Per[.:]?\s+([A-Z][A-Za-z.'\- ]+?),?\s*(JSC|JCA|CJN|J\.?C\.?A\.?|J)\b/);
  if (pj) perJudge = `${pj[1].trim()}, ${pj[2]}`;

  const area = e.area
    ? e.area.split(/[,;]/).map(s => s.trim()).filter(Boolean)
    : [];

  const norm = citation.toLowerCase().replace(/[^a-z0-9]/g, '') || caseName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return {
    case_name: caseName || '(unknown)',
    citation,
    citation_norm: norm,
    issue: e.issue || null,
    facts: e.facts || null,
    principle: e.principle || null,
    held: e.held || null,
    per_judge: perJudge,
    other_citations: e.other_citations || [],
    source: e.source || null,
    jurisdiction: e.jurisdiction || GLOBAL_JURISDICTION,
    court,
    area_of_law: area,
    year,
  };
}

let GLOBAL_JURISDICTION = 'Nigeria';

async function importAll(entries) {
  const { pool } = require('../db');
  if (!pool) { console.error('No DATABASE_URL set — cannot import. Use --dry-run to preview.'); process.exit(1); }
  const client = await pool.connect();
  let inserted = 0, skipped = 0, failed = 0;
  try {
    await client.query('BEGIN');
    for (const d of entries) {
      try {
        const r = await client.query(
          `INSERT INTO case_digests
             (case_name, citation, citation_norm, issue, facts, principle, held,
              per_judge, other_citations, source, jurisdiction, court, area_of_law, year, verified)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true)
           ON CONFLICT (citation_norm) DO NOTHING
           RETURNING id`,
          [d.case_name, d.citation, d.citation_norm, d.issue, d.facts, d.principle, d.held,
           d.per_judge, d.other_citations, d.source, d.jurisdiction, d.court, d.area_of_law, d.year]
        );
        if (r.rowCount) inserted++; else skipped++;
      } catch (e) { failed++; console.error(`  ✗ ${d.case_name}: ${e.message}`); }
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
  console.log(`\nInserted ${inserted} · skipped ${skipped} (already present) · failed ${failed} · total ${entries.length}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const jIdx = args.indexOf('--jurisdiction');
  const jVal = jIdx !== -1 ? args[jIdx + 1] : null;
  if (jVal) GLOBAL_JURISDICTION = jVal;
  const file = args.find(a => !a.startsWith('--') && a !== jVal);

  if (!file || !fs.existsSync(file)) {
    console.error('Usage: node scripts/import-digests.js <file.txt> [--dry-run] [--jurisdiction Nigeria]');
    process.exit(1);
  }

  const entries = parse(fs.readFileSync(path.resolve(file), 'utf8'));
  console.log(`Parsed ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} from ${file} (jurisdiction: ${GLOBAL_JURISDICTION})`);

  if (!entries.length) { console.error('No entries parsed — check the format.'); process.exit(1); }

  console.log('\n── first entry preview ──');
  console.log(JSON.stringify(entries[0], null, 2));

  if (dryRun) { console.log('\n[dry-run] nothing written.'); return; }
  await importAll(entries);
}

main().catch(e => { console.error(e); process.exit(1); });

module.exports = { parse, normalise };
