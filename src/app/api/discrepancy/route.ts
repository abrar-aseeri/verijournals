// POST /api/discrepancy
//
// Receives a structured data-correction report from /report-discrepancy.
// Conduit doctrine: NEVER unilaterally trusts the reporter's claim. For
// indicators we can live-re-query (OpenAlex), we fetch the upstream value
// AND snapshot the response, then update journals only if the upstream now
// disagrees with what we show. For indicators backed by periodic snapshots
// (SCImago) or derived indices (trust/risk), we log to audit_log and
// queue for manual review.
//
// Every branch writes at least one row to public.audit_log so the chain
// captures the full event.

import { NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase'
import { createHash } from 'node:crypto'

const REQUIRED_FIELDS = ['journal_id', 'indicator_key', 'displayed_value', 'correct_value', 'evidence_url'] as const
const OPTIONAL_FIELDS = ['reporter_email', 'notes'] as const

type Body = Record<string, string | undefined>

const OPENALEX_INDICATORS = new Set(['h_index', 'total_cites', 'citedness_2y'])
const SCIMAGO_INDICATORS = new Set(['quartile', 'sjr_score'])
const DERIVED_INDICATORS = new Set(['trust_score', 'risk_score'])

const UA = 'VeriJournals/1.0 (mailto:abrar.aseeri@gmail.com)'

export async function POST(request: Request) {
  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  for (const f of REQUIRED_FIELDS) {
    const v = body[f]
    if (typeof v !== 'string' || v.trim().length === 0) {
      return NextResponse.json({ error: `missing_field:${f}` }, { status: 400 })
    }
  }

  const supabase = getAdmin()

  // 1. Verify the journal exists. Also pull the columns we may need to
  //    compare against (per-indicator) so we can avoid a second round-trip.
  const { data: journal, error: jErr } = await supabase
    .from('journals')
    .select('id, title, issn, eissn, h_index, total_cites, citedness_2y, quartile, sjr_score, trust_score, risk_score')
    .eq('id', body.journal_id)
    .maybeSingle()

  if (jErr) {
    return NextResponse.json({ error: `journal_lookup_failed: ${jErr.message}` }, { status: 500 })
  }
  if (!journal) {
    return NextResponse.json({ error: 'journal_not_found' }, { status: 404 })
  }

  // 2. Always: log the submission to audit_log first.
  const submissionEvent = {
    journal_id: body.journal_id,
    indicator_key: body.indicator_key,
    displayed_value: body.displayed_value,
    correct_value: body.correct_value,
    evidence_url: body.evidence_url,
    reporter_email: body.reporter_email ?? null,
    notes: body.notes ?? null,
  }
  const { data: auditRow, error: aErr } = await supabase
    .from('audit_log')
    .insert({ event_type: 'discrepancy_submitted', event_data: submissionEvent })
    .select('id')
    .single()

  if (aErr || !auditRow) {
    return NextResponse.json({ error: `audit_log_insert_failed: ${aErr?.message}` }, { status: 500 })
  }
  const auditId = auditRow.id

  const indicatorKey = body.indicator_key as string

  // 3. Route by indicator family.
  if (OPENALEX_INDICATORS.has(indicatorKey)) {
    return handleOpenAlexReQuery(supabase, journal, indicatorKey, auditId)
  }
  if (SCIMAGO_INDICATORS.has(indicatorKey) || DERIVED_INDICATORS.has(indicatorKey)) {
    await supabase.from('audit_log').insert({
      event_type: 'discrepancy_no_live_source',
      event_data: {
        discrepancy_id: auditId,
        indicator_key: indicatorKey,
        note: 'Indicator backed by static / derived snapshot. Manual review queued; no automatic re-query possible.',
      },
    })
    return NextResponse.json({
      id: auditId,
      status: 'received_pending_review',
      message: 'Discrepancy logged. This indicator does not support live re-query; manual review against the primary source is queued.',
    })
  }

  await supabase.from('audit_log').insert({
    event_type: 'discrepancy_unknown_indicator',
    event_data: { discrepancy_id: auditId, indicator_key: indicatorKey },
  })
  return NextResponse.json({
    id: auditId,
    status: 'received_pending_review',
    message: 'Discrepancy logged. Indicator not recognised; manual review queued.',
  })
}

type SupabaseClient = ReturnType<typeof getAdmin>

interface Journal {
  id: string
  issn: string | null
  eissn: string | null
  h_index: number | null
  total_cites: number | null
  citedness_2y: number | null
}

async function handleOpenAlexReQuery(
  supabase: SupabaseClient,
  journal: Journal,
  indicatorKey: string,
  auditId: string,
) {
  const issn = journal.issn || journal.eissn
  if (!issn) {
    await supabase.from('audit_log').insert({
      event_type: 'discrepancy_re_query_skipped',
      event_data: { discrepancy_id: auditId, reason: 'no_issn' },
    })
    return NextResponse.json({
      id: auditId,
      status: 'received_pending_review',
      message: 'Discrepancy logged. Journal has no ISSN/EISSN; live re-query skipped.',
    })
  }

  const apiUrl = `https://api.openalex.org/sources?filter=issn:${encodeURIComponent(issn)}&per-page=1&select=issn,summary_stats,cited_by_count`

  let upstream: { results?: Array<{ summary_stats?: { h_index?: number; '2yr_mean_citedness'?: number }; cited_by_count?: number }> }
  let httpStatus = 0
  try {
    const res = await fetch(apiUrl, { headers: { 'User-Agent': UA } })
    httpStatus = res.status
    if (!res.ok) {
      await supabase.from('audit_log').insert({
        event_type: 'discrepancy_re_query_failed',
        event_data: { discrepancy_id: auditId, reason: 'non_2xx', http_status: httpStatus },
      })
      return NextResponse.json({
        id: auditId,
        status: 'received_query_failed',
        message: `Discrepancy logged. OpenAlex returned HTTP ${httpStatus}.`,
      })
    }
    upstream = await res.json()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await supabase.from('audit_log').insert({
      event_type: 'discrepancy_re_query_failed',
      event_data: { discrepancy_id: auditId, reason: 'fetch_error', message: msg },
    })
    return NextResponse.json({
      id: auditId,
      status: 'received_query_failed',
      message: 'Discrepancy logged. Live source re-query failed.',
    })
  }

  const responseJson = JSON.stringify(upstream)
  const responseHash = createHash('sha256').update(responseJson).digest('hex')
  const { data: snapshotRow } = await supabase
    .from('source_snapshots')
    .insert({
      source_name: 'openalex',
      query_url: apiUrl,
      response_raw: upstream,
      response_hash: responseHash,
      http_status: httpStatus,
    })
    .select('id')
    .single()
  const snapshotId = snapshotRow?.id ?? null

  const source = upstream?.results?.[0]
  if (!source) {
    await supabase.from('audit_log').insert({
      event_type: 'discrepancy_re_query_no_match',
      event_data: { discrepancy_id: auditId, issn, snapshot_id: snapshotId },
    })
    return NextResponse.json({
      id: auditId,
      status: 'received_no_upstream_match',
      snapshot_id: snapshotId,
      message: 'Discrepancy logged. OpenAlex has no record for this ISSN.',
    })
  }

  let upstreamValue: number | null = null
  if (indicatorKey === 'h_index') upstreamValue = source.summary_stats?.h_index ?? null
  else if (indicatorKey === 'total_cites') upstreamValue = source.cited_by_count ?? null
  else if (indicatorKey === 'citedness_2y') upstreamValue = source.summary_stats?.['2yr_mean_citedness'] ?? null

  const storedValue = (journal as unknown as Record<string, number | null>)[indicatorKey]

  if (upstreamValue == null) {
    await supabase.from('audit_log').insert({
      event_type: 'discrepancy_no_upstream_value',
      event_data: { discrepancy_id: auditId, indicator_key: indicatorKey, snapshot_id: snapshotId },
    })
    return NextResponse.json({
      id: auditId,
      status: 'received_no_upstream_value',
      snapshot_id: snapshotId,
      message: 'Discrepancy logged. OpenAlex has no value for this indicator.',
    })
  }

  const valuesMatch = typeof storedValue === 'number' && Math.abs(upstreamValue - storedValue) < 0.001

  if (valuesMatch) {
    await supabase.from('audit_log').insert({
      event_type: 'discrepancy_source_confirms_display',
      event_data: {
        discrepancy_id: auditId,
        indicator_key: indicatorKey,
        upstream_value: upstreamValue,
        displayed_value: storedValue,
        snapshot_id: snapshotId,
      },
    })
    return NextResponse.json({
      id: auditId,
      status: 're_queried_no_change',
      upstream_value: upstreamValue,
      displayed_value: storedValue,
      snapshot_id: snapshotId,
      message: 'Source re-queried; upstream confirms the currently displayed value. Please consult the primary source for further clarification.',
    })
  }

  // Source disagrees with display — update display to match current upstream.
  const { error: updErr } = await supabase
    .from('journals')
    .update({ [indicatorKey]: upstreamValue })
    .eq('id', journal.id)

  if (updErr) {
    await supabase.from('audit_log').insert({
      event_type: 'discrepancy_update_failed',
      event_data: {
        discrepancy_id: auditId,
        indicator_key: indicatorKey,
        error: updErr.message,
        snapshot_id: snapshotId,
      },
    })
    return NextResponse.json({
      id: auditId,
      status: 're_queried_update_failed',
      snapshot_id: snapshotId,
      message: 'Source re-queried; upstream differs from display but the update failed.',
    })
  }

  await supabase.from('audit_log').insert({
    event_type: 'classification_changed',
    event_data: {
      discrepancy_id: auditId,
      journal_id: journal.id,
      indicator_key: indicatorKey,
      old_value: storedValue,
      new_value: upstreamValue,
      snapshot_id: snapshotId,
      reason: 'reporter_evidence_confirmed_by_source',
    },
  })

  return NextResponse.json({
    id: auditId,
    status: 're_queried_updated',
    old_value: storedValue,
    new_value: upstreamValue,
    snapshot_id: snapshotId,
    message: 'Source re-queried; upstream value differs from the previously displayed value. The display has been updated to match the current upstream.',
  })
}
