// Recomputes journals.trust_score / risk_score / trust_status / trust_reasons
// / risk_reasons for every journal by replaying scoring.ts against the
// current journal_indexing rows. Single source of truth: src/lib/scoring.ts.
//
// Prerequisite: journals_score_snapshots already populated with the pre-run
// state (see migration 'journals_score_snapshots'). Rollback path:
//   UPDATE journals j SET trust_score = s.trust_score, risk_score = s.risk_score,
//   trust_status = s.trust_status FROM journals_score_snapshots s
//   WHERE j.id = s.journal_id AND s.snapshot_at = '<timestamp>';
//
// Run:  node --env-file=.env.local scripts/recompute-scores.mjs [--dry-run [N]]
//
//   --dry-run         Don't write. Print 100 sample old→new diffs.
//   --dry-run 250     Don't write. Print 250 sample old→new diffs.

import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

register(pathToFileURL(resolve('scripts/lib/alias-resolver.mjs')))

const { calculateScores } = await import('../src/lib/scoring.ts')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const sampleSizeArg = args[args.indexOf('--dry-run') + 1]
const SAMPLE_SIZE = (dryRun && /^\d+$/.test(sampleSizeArg)) ? parseInt(sampleSizeArg, 10) : 100
const UPDATE_BATCH = 500
const FETCH_PAGE = 1000

async function fetchAllPages(query) {
  const out = []
  let from = 0
  while (true) {
    const { data, error } = await query.range(from, from + FETCH_PAGE - 1)
    if (error) throw new Error(`Fetch page ${from}: ${error.message}`)
    if (!data || data.length === 0) break
    out.push(...data)
    if (data.length < FETCH_PAGE) break
    from += FETCH_PAGE
  }
  return out
}

async function loadJournalIndexing() {
  console.log('Loading all journal_indexing rows…')
  const rows = await fetchAllPages(
    supabase.from('journal_indexing').select('journal_id, source, in_source')
  )
  console.log(`  ${rows.length} rows loaded`)
  const byJournal = new Map()
  for (const r of rows) {
    if (!byJournal.has(r.journal_id)) byJournal.set(r.journal_id, [])
    byJournal.get(r.journal_id).push(r)
  }
  console.log(`  ${byJournal.size} distinct journals have indexing rows`)
  return byJournal
}

async function loadJournals() {
  console.log('Loading all journals (id + current scores + title)…')
  // `title` is NOT NULL with no default; Supabase upsert generates an
  // INSERT...ON CONFLICT statement whose NOT NULL check fires before the
  // conflict resolves, so we must echo title back unchanged in the payload.
  const rows = await fetchAllPages(
    supabase.from('journals').select('id, title, trust_score, risk_score, trust_status')
  )
  console.log(`  ${rows.length} journals loaded`)
  return rows
}

function buildUpdates(journals, indexingByJournal) {
  const updates = []
  let changed = 0
  for (const j of journals) {
    const indexing = indexingByJournal.get(j.id) || []
    const scores = calculateScores(indexing)
    if (
      scores.trust_score !== j.trust_score
      || scores.risk_score !== j.risk_score
      || scores.trust_status !== j.trust_status
    ) {
      changed++
    }
    updates.push({
      id: j.id,
      title: j.title,
      old_trust_score: j.trust_score,
      old_risk_score: j.risk_score,
      old_trust_status: j.trust_status,
      ...scores,
    })
  }
  return { updates, changed }
}

function summarizeDistribution(rows, key) {
  const m = new Map()
  for (const r of rows) m.set(r[key], (m.get(r[key]) || 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function pickSample(updates, n) {
  if (updates.length <= n) return updates
  const step = updates.length / n
  return Array.from({ length: n }, (_, i) => updates[Math.floor(i * step)])
}

async function main() {
  console.log(`Recompute starting (dry-run=${dryRun}${dryRun ? `, sample=${SAMPLE_SIZE}` : ''})`)

  let runId = null
  if (!dryRun) {
    const { data: runRow, error: runErr } = await supabase
      .from('automation_runs')
      .insert({ run_type: 'recompute_scores', started_at: new Date().toISOString(), status: 'running' })
      .select('id')
      .single()
    if (runErr) { console.error('automation_runs insert failed:', runErr.message); process.exit(1) }
    runId = runRow.id
  }

  try {
    const indexingByJournal = await loadJournalIndexing()
    const journals = await loadJournals()
    const { updates, changed } = buildUpdates(journals, indexingByJournal)

    console.log('')
    console.log('=== Old vs New distribution ===')
    console.log('OLD trust_status:')
    for (const [s, n] of summarizeDistribution(journals, 'trust_status')) console.log(`  ${s.padEnd(20)} ${n}`)
    console.log('NEW trust_status:')
    for (const [s, n] of summarizeDistribution(updates, 'trust_status')) console.log(`  ${s.padEnd(20)} ${n}`)
    console.log(`Journals whose (trust_score, risk_score, trust_status) would change: ${changed} / ${updates.length}`)

    if (dryRun) {
      console.log('')
      console.log(`=== Dry-run sample (${SAMPLE_SIZE} journals, evenly spread) ===`)
      console.log('journal_id                              old_t  old_r  old_status         new_t  new_r  new_status')
      for (const u of pickSample(updates, SAMPLE_SIZE)) {
        console.log(
          `${u.id}  ${String(u.old_trust_score ?? '-').padStart(5)}  ${String(u.old_risk_score ?? '-').padStart(5)}  ${String(u.old_trust_status ?? '-').padEnd(18)}` +
          ` ${String(u.trust_score).padStart(5)}  ${String(u.risk_score).padStart(5)}  ${u.trust_status}`
        )
      }
      console.log('')
      console.log('Dry-run complete. No writes performed. Re-run without --dry-run to apply.')
      return
    }

    console.log('')
    console.log(`Applying ${updates.length} updates in chunks of ${UPDATE_BATCH}…`)
    let written = 0
    let failedBatches = 0
    let lastErr = null
    for (let i = 0; i < updates.length; i += UPDATE_BATCH) {
      const batch = updates.slice(i, i + UPDATE_BATCH).map(({ old_trust_score, old_risk_score, old_trust_status, ...rest }) => rest)
      const { error } = await supabase
        .from('journals')
        .upsert(batch, { onConflict: 'id' })
      if (error) { console.error(`Batch ${i}: ${error.message}`); failedBatches++; lastErr = error.message }
      else written += batch.length
      if (i % (UPDATE_BATCH * 10) === 0 && i > 0) console.log(`  progress: ${i + batch.length} / ${updates.length}`)
    }

    const finalStatus = failedBatches > 0 ? 'failed' : 'success'
    await supabase.from('automation_runs').update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      journals_processed: updates.length,
      journals_updated: written,
      error_summary: failedBatches > 0
        ? `${failedBatches} batch(es) failed. Last error: ${(lastErr || '').slice(0, 400)}`
        : null,
    }).eq('id', runId)

    console.log('')
    console.log('=== Done ===')
    console.log(`Updated rows: ${written} / ${updates.length}`)
    if (failedBatches > 0) {
      console.log(`Failed batches: ${failedBatches}`)
      console.log(`automation_runs marked status='failed'`)
      process.exitCode = 1
    }
  } catch (err) {
    console.error('Fatal:', err.message)
    if (runId) {
      await supabase.from('automation_runs').update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_summary: (err.message || String(err)).slice(0, 500),
      }).eq('id', runId)
    }
    process.exitCode = 1
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
