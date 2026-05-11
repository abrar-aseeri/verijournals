// Called from GitHub Actions workflows via `if: failure()` to keep
// automation_runs honest even when the import script died before its own
// catch block could mark the row failed (OOM, SIGKILL, runner crash, npm
// ci failure, etc.). Logic:
//
//   * Find the most recent automation_runs row for this run_type started
//     in the past 6 hours.
//   * If status='running' → update to 'failed'. (Script crashed before
//     it could update its own row.)
//   * If status='failed'  → skip. (Script's catch block already wrote
//     the canonical row with a meaningful error_summary; don't dupe.)
//   * If status='success' → insert a new 'failed' row. (Script reported
//     success but the workflow itself failed after — unusual but worth
//     recording.)
//   * If no row at all    → insert a new 'failed' row. (Script never
//     started.)
//
// Usage: node scripts/notify-cron-failure.mjs <run_type> [error_summary]

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const runType = process.argv[2]
const errSummary = (process.argv[3] || 'GitHub Actions workflow failed').slice(0, 500)

if (!runType) {
  console.error('usage: notify-cron-failure.mjs <run_type> [error_summary]')
  process.exit(1)
}

const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

const { data: recent, error: lookupErr } = await supabase
  .from('automation_runs')
  .select('id, status')
  .eq('run_type', runType)
  .gte('started_at', sixHoursAgo)
  .order('started_at', { ascending: false })
  .limit(1)
  .maybeSingle()

if (lookupErr) {
  console.error('Lookup failed:', lookupErr.message)
  process.exit(1)
}

if (recent?.status === 'running') {
  const { error } = await supabase.from('automation_runs').update({
    status: 'failed',
    completed_at: new Date().toISOString(),
    error_summary: errSummary,
  }).eq('id', recent.id)
  if (error) { console.error('Update failed:', error.message); process.exit(1) }
  console.log(`Marked stuck running row ${recent.id} (run_type=${runType}) as failed.`)
} else if (recent?.status === 'failed') {
  console.log(`Recent row ${recent.id} already 'failed'; not duplicating.`)
} else {
  const { error } = await supabase.from('automation_runs').insert({
    run_type: runType,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    status: 'failed',
    error_summary: errSummary,
  })
  if (error) { console.error('Insert failed:', error.message); process.exit(1) }
  console.log(`Inserted new 'failed' row for run_type=${runType}.`)
}
