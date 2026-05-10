// Imports DOAJ open-access verification rows into journal_indexing.
// Prerequisite: bash scripts/fetch-source-data.sh   (downloads doaj.csv)
// Run:         node --env-file=.env.local scripts/import-doaj.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CSV_PATH = resolve('scripts/data/doaj.csv')
const ISSN_LOOKUP_CHUNK = 200
const UPSERT_BATCH = 500

function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { row.push(field); field = '' }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++
        row.push(field); field = ''
        if (row.some(c => c !== '')) rows.push(row)
        row = []
      } else {
        field += ch
      }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

function normalizeIssn(s) {
  if (!s) return null
  const cleaned = s.trim().toUpperCase().replace(/[^0-9X-]/g, '')
  if (!cleaned) return null
  return cleaned
}

async function main() {
  console.log('DOAJ → journal_indexing import starting…')

  const { data: runRow, error: runErr } = await supabase
    .from('automation_runs')
    .insert({ run_type: 'import_doaj', started_at: new Date().toISOString(), status: 'running' })
    .select('id')
    .single()
  if (runErr) { console.error('automation_runs insert failed:', runErr.message); return }
  const runId = runRow.id

  let processed = 0
  let withIssn = 0
  let matched = 0
  let inserted = 0

  try {
    console.log(`Reading ${CSV_PATH}…`)
    const text = readFileSync(CSV_PATH, 'utf-8')
    const rows = parseCSV(text)
    if (rows.length < 2) throw new Error('CSV is empty or malformed')

    const header = rows[0]
    const issnIdx = header.indexOf('Journal ISSN (print version)')
    const eissnIdx = header.indexOf('Journal EISSN (online version)')
    const titleIdx = header.indexOf('Journal title')
    const doajUrlIdx = header.indexOf('URL in DOAJ')
    if (issnIdx === -1 || eissnIdx === -1) throw new Error('Required ISSN columns not found')

    console.log(`Parsed ${rows.length - 1} DOAJ records`)

    const records = []
    const issnSet = new Set()
    for (let i = 1; i < rows.length; i++) {
      processed++
      const cols = rows[i]
      const issn = normalizeIssn(cols[issnIdx])
      const eissn = normalizeIssn(cols[eissnIdx])
      if (!issn && !eissn) continue
      withIssn++
      records.push({
        issn, eissn,
        title: (cols[titleIdx] || '').trim(),
        doajUrl: (cols[doajUrlIdx] || '').trim() || null,
      })
      if (issn) issnSet.add(issn)
      if (eissn) issnSet.add(eissn)
    }
    console.log(`Records with ISSN/EISSN: ${withIssn}, unique ISSN values: ${issnSet.size}`)

    const issnList = [...issnSet]
    const issnToJournalId = new Map()
    for (let i = 0; i < issnList.length; i += ISSN_LOOKUP_CHUNK) {
      const chunk = issnList.slice(i, i + ISSN_LOOKUP_CHUNK)
      const filter = `issn.in.(${chunk.join(',')}),eissn.in.(${chunk.join(',')})`
      const { data, error } = await supabase
        .from('journals')
        .select('id, issn, eissn')
        .or(filter)
      if (error) { console.error(`Lookup chunk ${i}: ${error.message}`); continue }
      for (const j of (data || [])) {
        if (j.issn) issnToJournalId.set(j.issn, j.id)
        if (j.eissn) issnToJournalId.set(j.eissn, j.id)
      }
      if ((i / ISSN_LOOKUP_CHUNK) % 10 === 0) {
        console.log(`Lookup progress: ${Math.min(i + ISSN_LOOKUP_CHUNK, issnList.length)} / ${issnList.length}`)
      }
    }
    console.log(`Built lookup map with ${issnToJournalId.size} ISSN→journal mappings`)

    const seenJournals = new Set()
    const upserts = []
    for (const r of records) {
      const jid = (r.issn && issnToJournalId.get(r.issn)) || (r.eissn && issnToJournalId.get(r.eissn))
      if (!jid) continue
      if (seenJournals.has(jid)) continue
      seenJournals.add(jid)
      matched++
      upserts.push({
        journal_id: jid,
        source: 'doaj',
        in_source: 'yes',
        last_verified_at: new Date().toISOString(),
        verification_method: 'doaj_csv_import',
        source_url: r.doajUrl,
        notes: r.title ? `DOAJ: ${r.title.slice(0, 200)}` : null,
      })
    }
    console.log(`Matched ${matched} unique journals; preparing ${upserts.length} upserts`)

    for (let i = 0; i < upserts.length; i += UPSERT_BATCH) {
      const batch = upserts.slice(i, i + UPSERT_BATCH)
      const { error } = await supabase
        .from('journal_indexing')
        .upsert(batch, { onConflict: 'journal_id,source' })
      if (error) console.error(`Upsert batch ${i}: ${error.message}`)
      else inserted += batch.length
      if (i % (UPSERT_BATCH * 5) === 0 && i > 0) {
        console.log(`Upsert progress: ${i + batch.length} / ${upserts.length}`)
      }
    }

    await supabase.from('automation_runs').update({
      status: 'success',
      completed_at: new Date().toISOString(),
      journals_processed: processed,
      journals_updated: inserted,
    }).eq('id', runId)

    const matchRate = processed > 0 ? (matched / processed * 100).toFixed(1) : '0'
    console.log('\n=== Done ===')
    console.log(`Processed:    ${processed}`)
    console.log(`With ISSN:    ${withIssn}`)
    console.log(`Matched:      ${matched}`)
    console.log(`Inserted:     ${inserted}`)
    console.log(`Match rate:   ${matchRate}% (matched / processed)`)
  } catch (err) {
    console.error('Fatal:', err.message)
    await supabase.from('automation_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_summary: (err.message || String(err)).slice(0, 500),
      journals_processed: processed,
      journals_updated: inserted,
    }).eq('id', runId)
    process.exitCode = 1
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
