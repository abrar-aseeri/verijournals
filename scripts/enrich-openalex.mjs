// Enriches journals with OpenAlex metrics (h_index, total_cites,
// citedness_2y, citedness_2y_year) for every journal with an issn.
//
// Run:  node --env-file=.env.local scripts/enrich-openalex.mjs

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PAGE_SIZE = 1000
const CHUNK_SIZE = 50

async function enrichFromOpenAlex() {
  const snapshotYear = new Date().getFullYear()
  let updated = 0
  let fetched = 0
  let lastId = null

  while (true) {
    let q = supabase
      .from('journals')
      .select('id, issn')
      .not('issn', 'is', null)
      .order('id', { ascending: true })
      .limit(PAGE_SIZE)
    if (lastId) q = q.gt('id', lastId)

    const { data: journals, error } = await q
    if (error) throw new Error(`Page fetch: ${error.message}`)
    if (!journals || journals.length === 0) break

    fetched += journals.length
    console.log(`Page: +${journals.length} (fetched ${fetched})`)

    for (let i = 0; i < journals.length; i += CHUNK_SIZE) {
      const chunk = journals.slice(i, i + CHUNK_SIZE)
      const url = `https://api.openalex.org/sources?filter=issn:${chunk.map(j => j.issn).join('|')}&per-page=50&select=issn,summary_stats,cited_by_count`

      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'VeriJournals/1.0' } })
        const data = await res.json()

        const writes = []
        for (const source of (data.results || [])) {
          if (!source.issn) continue
          const journal = chunk.find(j => source.issn.includes(j.issn))
          if (!journal) continue

          const citedness2y = source.summary_stats?.['2yr_mean_citedness']
          writes.push(
            supabase.from('journals').update({
              h_index: source.summary_stats?.h_index || null,
              total_cites: source.cited_by_count || null,
              citedness_2y: typeof citedness2y === 'number' ? citedness2y : null,
              citedness_2y_year: typeof citedness2y === 'number' ? snapshotYear : null,
            }).eq('id', journal.id)
          )
        }
        const results = await Promise.all(writes)
        updated += results.filter(r => !r.error).length
        const failed = results.filter(r => r.error)
        if (failed.length) console.error(`Chunk: ${failed.length} write errors, first: ${failed[0].error.message}`)
      } catch (e) {
        console.error('Chunk error:', e.message)
      }

      await new Promise(r => setTimeout(r, 300))
    }

    console.log(`Progress: updated ${updated} / fetched ${fetched}`)
    lastId = journals[journals.length - 1].id
  }

  return { fetched, updated }
}

async function main() {
  console.log('OpenAlex enrichment starting…')

  const { data: runRow, error: runErr } = await supabase
    .from('automation_runs')
    .insert({ run_type: 'enrich_openalex', started_at: new Date().toISOString(), status: 'running' })
    .select('id')
    .single()
  if (runErr) { console.error('automation_runs insert failed:', runErr.message); return }
  const runId = runRow.id

  try {
    const { fetched, updated } = await enrichFromOpenAlex()
    await supabase.from('automation_runs').update({
      status: 'success',
      completed_at: new Date().toISOString(),
      journals_processed: fetched,
      journals_updated: updated,
    }).eq('id', runId)
    console.log(`Done. Updated ${updated} / fetched ${fetched}`)
  } catch (err) {
    console.error('Fatal:', err.message)
    await supabase.from('automation_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_summary: (err.message || String(err)).slice(0, 500),
    }).eq('id', runId)
    process.exitCode = 1
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
