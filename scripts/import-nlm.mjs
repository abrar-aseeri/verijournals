// Imports the NLM/PubMed journals catalog into journal_indexing as a
// trust signal: source='nlm', in_source='yes'.
// scoring.ts:43 awards +20 trust for matched journals.
//
// Prerequisite: bash scripts/fetch-source-data.sh   (downloads J_Medline.txt)
// Run:          node --env-file=.env.local scripts/import-nlm.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { snapshotFile } from './lib/snapshot.mjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SOURCE_PATH = resolve('scripts/data/J_Medline.txt')
const ISSN_LOOKUP_CHUNK = 200
const UPSERT_BATCH = 500
const NLM_SOURCE_URL = 'https://ftp.ncbi.nlm.nih.gov/pubmed/J_Medline.txt'

function parseJMedline(text) {
  const records = []
  const blocks = text.split(/\r?\n-{10,}\r?\n/)
  for (const block of blocks) {
    if (!block.trim()) continue
    const record = {}
    for (const line of block.split(/\r?\n/)) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (key) record[key] = value
    }
    if (record['JrId']) records.push(record)
  }
  return records
}

function normalizeIssn(s) {
  if (!s) return null
  const cleaned = s.trim().toUpperCase().replace(/[^0-9X-]/g, '')
  if (/^[0-9]{4}[0-9X]{4}$/.test(cleaned)) return cleaned.slice(0, 4) + '-' + cleaned.slice(4)
  if (/^[0-9]{4}-[0-9X]{4}$/.test(cleaned)) return cleaned
  return null
}

async function main() {
  console.log('NLM → journal_indexing import starting…')

  const { data: runRow, error: runErr } = await supabase
    .from('automation_runs')
    .insert({ run_type: 'import_nlm', started_at: new Date().toISOString(), status: 'running' })
    .select('id')
    .single()
  if (runErr) { console.error('automation_runs insert failed:', runErr.message); return }
  const runId = runRow.id

  let processed = 0
  let withIssn = 0
  let matched = 0
  let inserted = 0

  try {
    await snapshotFile(supabase, {
      sourceName: 'nlm',
      filePath: SOURCE_PATH,
      queryUrl: NLM_SOURCE_URL,
      extra: { import_kind: 'nlm_jmedline_v1' },
    })

    console.log(`Reading ${SOURCE_PATH}…`)
    const text = readFileSync(SOURCE_PATH, 'utf-8')
    const records = parseJMedline(text)
    console.log(`Parsed ${records.length} NLM records`)

    const issnSet = new Set()
    const usable = []
    for (const r of records) {
      processed++
      const print = normalizeIssn(r['ISSN (Print)'])
      const online = normalizeIssn(r['ISSN (Online)'])
      if (!print && !online) continue
      withIssn++
      usable.push({
        print, online,
        title: r['JournalTitle'] || '',
        nlmId: r['NlmId'] || '',
      })
      if (print) issnSet.add(print)
      if (online) issnSet.add(online)
    }
    console.log(`Records with ISSN: ${withIssn}; unique ISSN values: ${issnSet.size}`)

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
    for (const r of usable) {
      const jid = (r.print && issnToJournalId.get(r.print)) || (r.online && issnToJournalId.get(r.online))
      if (!jid) continue
      if (seenJournals.has(jid)) continue
      seenJournals.add(jid)
      matched++
      const notes = r.nlmId
        ? `NLM: ${r.title.slice(0, 180)} (NlmId ${r.nlmId})`
        : `NLM: ${r.title.slice(0, 200)}`
      upserts.push({
        journal_id: jid,
        source: 'nlm',
        in_source: 'yes',
        last_verified_at: new Date().toISOString(),
        verification_method: 'nlm_jmedline_import',
        source_url: NLM_SOURCE_URL,
        notes,
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
