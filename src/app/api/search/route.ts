import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const type = searchParams.get('type') || 'title'

  if (!q) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  const start = Date.now()
  let query = supabaseAdmin.from('journals').select(`
    *,
    journal_metrics(*),
    journal_indexing(*)
  `)

  if (type === 'issn') {
    const clean = q.replace(/[^0-9X]/gi, '')
    query = query.or(`issn.ilike.%${clean}%,eissn.ilike.%${clean}%`)
  } else if (type === 'publisher') {
    query = query.ilike('publisher', `%${q}%`)
  } else if (type === 'specialty') {
    query = query.contains('specialty', [q])
  } else {
    query = query.textSearch('search_vector', q, { type: 'websearch' })
  }

  const { data, error } = await query.limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('search_logs').insert({
    search_type: type,
    raw_query: q,
    matched_journal_id: data?.[0]?.id ?? null,
    result_status: data?.length ? 'found' : 'not_found',
    trust_status: data?.[0]?.trust_status ?? null,
    response_time_ms: Date.now() - start,
  })

  return NextResponse.json({
    journals: data || [],
    total: data?.length || 0,
    query: q,
    search_type: type,
  })
}
