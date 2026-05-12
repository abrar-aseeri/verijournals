// Imports Retraction Watch retraction data into journal_indexing as a
// rate-based credibility signal (Strategy 1: DOI -> Crossref -> ISSN).
//
// Prerequisite: bash scripts/fetch-source-data.sh  (downloads retraction-watch.csv)
// Run:          node --env-file=.env.local scripts/import-retraction-watch.mjs
//
// Threshold: marks journal_indexing rows only for journals where
//   retractions / total_docs >= 1.0%

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { snapshotFile } from './lib/snapshot.mjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CSV_PATH = resolve('scripts/data/retraction-watch.csv')
const CONTACT_EMAIL = 'abrar.aseeri@gmail.com'
const UA = `VeriJournals/1.0 (mailto:${CONTACT_EMAIL})`
const CROSSREF_CONCURRENCY = 20
const CROSSREF_RETRY = 1
const CROSSREF_TIMEOUT_MS = 10000
const ISSN_LOOKUP_CHUNK = 200
const UPSERT_BATCH = 500
const RATE_THRESHOLD_PCT = 1.0
const RW_SOURCE_URL = 'https://gitlab.com/crossref/retraction-watch-data'
const RETRACTION_WINDOW_FROM = '2021-01-01'
const RETRACTION_WINDOW_TO = '2023-12-31'

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
  if (/^[0-9]{4}[0-9X]{4}$/.test(cleaned)) return cleaned.slice(0, 4) + '-' + cleaned.slice(4)
  if (/^[0-9]{4}-[0-9X]{4}$/.test(cleaned)) return cleaned
  return null
}

function parseRetractionDate(s) {
  if (!s) return null
  const t = s.trim()
  if (!t) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  let m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
  m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  return null
}

async function fetchCrossrefIssn(doi) {
  for (let attempt = 0; attempt <= CROSSREF_RETRY; attempt++) {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), CROSSREF_TIMEOUT_MS)
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
        headers: { 'User-Agent': UA },
        signal: ac.signal,
      })
      clearTimeout(timer)
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 2000))
        continue
      }
      if (!res.ok) return null
      const json = await res.json()
      const issns = (json.message?.ISSN ?? []).map(normalizeIssn).filter(Boolean)
      return issns
    } catch {
      clearTimeout(timer)
      if (attempt === CROSSREF_RETRY) return null
      await new Promise(r => setTimeout(r, 500))
    }
  }
  return null
}

async function processConcurrently(items, fn, concurrency) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = next++
      if (i >= items.length) break
      results[i] = await fn(items[i], i)
    }
  }))
  return results
}

async function main() {
  console.log('Retraction Watch → journal_indexing import starting…')

  const { data: runRow, error: runErr } = await supabase
    .from('automation_runs')
    .insert({ run_type: 'import_retraction_watch', started_at: new Date().toISOString(), status: 'running' })
    .select('id')
    .single()
  if (runErr) { console.error('automation_runs insert failed:', runErr.message); return }
  const runId = runRow.id

  let processedRows = 0
  let withDoi = 0
  let uniqueJournals = 0
  let crossrefHits = 0
  let issnsResolved = 0
  let journalsMatched = 0
  let upserted = 0

  try {
    await snapshotFile(supabase, {
      sourceName: 'retraction_watch',
      filePath: CSV_PATH,
      queryUrl: RW_SOURCE_URL,
      extra: {
        import_kind: 'rw_csv_via_crossref_doi',
        window_from: RETRACTION_WINDOW_FROM,
        window_to: RETRACTION_WINDOW_TO,
      },
    })

    console.log(`Reading ${CSV_PATH}…`)
    const text = readFileSync(CSV_PATH, 'utf-8')
    const rows = parseCSV(text)
    if (rows.length < 2) throw new Error('CSV is empty or malformed')

    const header = rows[0]
    const journalIdx = header.indexOf('Journal')
    const doiIdx = header.indexOf('OriginalPaperDOI')
    const dateIdx = header.indexOf('RetractionDate')
    if (journalIdx === -1 || doiIdx === -1 || dateIdx === -1) {
      throw new Error('Required columns (Journal, OriginalPaperDOI, RetractionDate) not found')
    }

    console.log(`Parsed ${rows.length - 1} retraction records`)
    console.log(`Windowing RetractionDate to [${RETRACTION_WINDOW_FROM}, ${RETRACTION_WINDOW_TO}] to align with total_docs snapshot`)

    // Group RW rows by Journal name -> { count, latestDate, sampleDOI }
    let skippedOutOfWindow = 0
    let skippedNoDate = 0
    const byJournal = new Map()
    for (let i = 1; i < rows.length; i++) {
      processedRows++
      const cols = rows[i]
      const journalName = (cols[journalIdx] || '').trim()
      const doi = (cols[doiIdx] || '').trim()
      const date = parseRetractionDate(cols[dateIdx])
      if (!journalName || !doi) continue
      if (!date) { skippedNoDate++; continue }
      if (date < RETRACTION_WINDOW_FROM || date > RETRACTION_WINDOW_TO) { skippedOutOfWindow++; continue }
      withDoi++

      let entry = byJournal.get(journalName)
      if (!entry) { entry = { count: 0, latestDate: null, sampleDOI: doi }; byJournal.set(journalName, entry) }
      entry.count++
      if (!entry.latestDate || date > entry.latestDate) entry.latestDate = date
    }
    console.log(`Window filter: kept ${withDoi}, skipped ${skippedOutOfWindow} out-of-window, ${skippedNoDate} no-date`)
    uniqueJournals = byJournal.size
    console.log(`Unique Journal names with at least one DOI: ${uniqueJournals}`)

    // Crossref ISSN lookup per unique journal name
    console.log(`Resolving ISSN for ${uniqueJournals} journal names via Crossref (concurrency=${CROSSREF_CONCURRENCY}, timeout=${CROSSREF_TIMEOUT_MS}ms)…`)
    const journalNames = [...byJournal.keys()]
    let completed = 0
    let hits = 0
    const t0 = Date.now()
    const lookups = await processConcurrently(journalNames, async (name) => {
      const entry = byJournal.get(name)
      const issns = await fetchCrossrefIssn(entry.sampleDOI)
      completed++
      if (issns && issns.length) hits++
      if (completed % 500 === 0 || completed === journalNames.length) {
        const hitPct = (hits / completed * 100).toFixed(1)
        const elapsed = ((Date.now() - t0) / 1000).toFixed(0)
        console.log(`Crossref: ${completed}/${journalNames.length} (${hitPct}% hit rate so far, ${elapsed}s elapsed)`)
      }
      return { name, issns }
    }, CROSSREF_CONCURRENCY)
    const t1 = Date.now()
    console.log(`Crossref pass: ${((t1 - t0) / 1000).toFixed(1)}s`)

    // Aggregate by ISSN: sum counts across name variations sharing an ISSN
    const issnToAgg = new Map()
    for (const { name, issns } of lookups) {
      if (!issns || issns.length === 0) continue
      crossrefHits++
      const entry = byJournal.get(name)
      for (const issn of issns) {
        let agg = issnToAgg.get(issn)
        if (!agg) { agg = { count: 0, latestDate: null, names: [] }; issnToAgg.set(issn, agg) }
        agg.count += entry.count
        if (entry.latestDate && (!agg.latestDate || entry.latestDate > agg.latestDate)) agg.latestDate = entry.latestDate
        agg.names.push(name)
      }
    }
    issnsResolved = issnToAgg.size
    console.log(`ISSN resolution: ${crossrefHits} of ${uniqueJournals} journal names resolved to ${issnsResolved} unique ISSNs`)

    // Match against our journals table (issn or eissn), fetching total_docs
    const issnList = [...issnToAgg.keys()]
    const journalRecords = new Map() // journal_id -> { issn, eissn, total_docs }
    for (let i = 0; i < issnList.length; i += ISSN_LOOKUP_CHUNK) {
      const chunk = issnList.slice(i, i + ISSN_LOOKUP_CHUNK)
      const filter = `issn.in.(${chunk.join(',')}),eissn.in.(${chunk.join(',')})`
      const { data, error } = await supabase
        .from('journals')
        .select('id, issn, eissn, total_docs')
        .or(filter)
      if (error) { console.error(`Lookup chunk ${i}: ${error.message}`); continue }
      for (const j of (data || [])) journalRecords.set(j.id, j)
    }
    journalsMatched = journalRecords.size
    console.log(`Matched ${journalsMatched} journals in our DB`)

    // Build upserts where rate >= threshold
    const upserts = []
    const rateDistribution = { skipNoBaseline: 0, belowThreshold: 0, atOrAboveThreshold: 0 }
    for (const journal of journalRecords.values()) {
      const issnKey = (journal.issn && issnToAgg.has(journal.issn))
        ? journal.issn
        : (journal.eissn && issnToAgg.has(journal.eissn))
          ? journal.eissn
          : null
      if (!issnKey) continue
      const agg = issnToAgg.get(issnKey)
      if (!journal.total_docs || journal.total_docs <= 0) { rateDistribution.skipNoBaseline++; continue }
      const rate = (agg.count / journal.total_docs) * 100
      if (rate < RATE_THRESHOLD_PCT) { rateDistribution.belowThreshold++; continue }
      rateDistribution.atOrAboveThreshold++

      const ratePretty = rate.toFixed(2)
      const notes = agg.latestDate
        ? `Retraction Watch: ${agg.count} retractions (rate ${ratePretty}%); latest ${agg.latestDate}`
        : `Retraction Watch: ${agg.count} retractions (rate ${ratePretty}%)`

      upserts.push({
        journal_id: journal.id,
        source: 'retraction_watch',
        in_source: 'yes',
        verification_method: 'rw_csv_via_crossref_doi',
        source_url: RW_SOURCE_URL,
        last_verified_at: new Date().toISOString(),
        notes,
      })
    }
    console.log('Rate distribution:', rateDistribution)
    console.log(`Preparing ${upserts.length} upserts`)

    for (let i = 0; i < upserts.length; i += UPSERT_BATCH) {
      const batch = upserts.slice(i, i + UPSERT_BATCH)
      const { error } = await supabase
        .from('journal_indexing')
        .upsert(batch, { onConflict: 'journal_id,source' })
      if (error) console.error(`Upsert batch ${i}: ${error.message}`)
      else upserted += batch.length
    }

    await supabase.from('automation_runs').update({
      status: 'success',
      completed_at: new Date().toISOString(),
      journals_processed: processedRows,
      journals_updated: upserted,
      journals_flagged: upserted,
    }).eq('id', runId)

    console.log('\n=== Done ===')
    console.log(`Rows processed:          ${processedRows}`)
    console.log(`Rows with DOI:           ${withDoi}`)
    console.log(`Unique journal names:    ${uniqueJournals}`)
    console.log(`Crossref ISSN hits:      ${crossrefHits} (${(crossrefHits / uniqueJournals * 100).toFixed(1)}%)`)
    console.log(`Unique ISSNs resolved:   ${issnsResolved}`)
    console.log(`Journals matched in DB:  ${journalsMatched}`)
    console.log(`  - skipped (no total_docs baseline): ${rateDistribution.skipNoBaseline}`)
    console.log(`  - below ${RATE_THRESHOLD_PCT}% threshold:           ${rateDistribution.belowThreshold}`)
    console.log(`  - at or above threshold:            ${rateDistribution.atOrAboveThreshold}`)
    console.log(`Upserted to journal_indexing:        ${upserted}`)
  } catch (err) {
    console.error('Fatal:', err.message)
    await supabase.from('automation_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_summary: (err.message || String(err)).slice(0, 500),
      journals_processed: processedRows,
      journals_updated: upserted,
    }).eq('id', runId)
    process.exitCode = 1
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
