import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const doi = searchParams.get('doi')?.trim()

  if (!doi) return NextResponse.json({ error: 'DOI required' }, { status: 400 })

  const { data: existing } = await supabaseAdmin
    .from('articles')
    .select('*, journals(*)')
    .eq('doi', doi)
    .single()

  if (existing) return NextResponse.json({ article: existing })

  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': 'VeriJournals/1.0 (mailto:admin@verijournals.com)' },
    })

    if (!res.ok) return NextResponse.json({ error: 'DOI not found' }, { status: 404 })

    const json = await res.json()
    const work = json.message

    const isRetracted = work.relation?.['is-retraction-of'] ||
      work.title?.[0]?.toLowerCase().includes('retract') ||
      work['update-to']?.some((u: any) => u.type === 'retraction')

    const isCorrected = work['update-to']?.some((u: any) => u.type === 'correction')

    const article_status = isRetracted ? 'retracted' : isCorrected ? 'corrected' : 'active'

    const issn = work.ISSN?.[0]?.replace(/[^0-9X]/gi, '')
    let journal_id = null

    if (issn) {
      const { data: journal } = await supabaseAdmin
        .from('journals')
        .select('id')
        .or(`issn.ilike.%${issn}%,eissn.ilike.%${issn}%`)
        .single()
      journal_id = journal?.id ?? null
    }

    const articleData = {
      doi,
      journal_id,
      title: work.title?.[0] ?? null,
      authors: work.author?.map((a: any) => ({
        name: `${a.given ?? ''} ${a.family ?? ''}`.trim(),
        affiliation: a.affiliation?.[0]?.name ?? null,
      })) ?? [],
      published_date: work.created?.['date-time']?.split('T')[0] ?? null,
      article_status,
      crossref_raw: work,
      last_fetched_at: new Date().toISOString(),
    }

    const { data: saved } = await supabaseAdmin
      .from('articles')
      .upsert(articleData, { onConflict: 'doi' })
      .select('*, journals(*)')
      .single()

    return NextResponse.json({ article: saved })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch DOI' }, { status: 500 })
  }
}
