import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdmin()
  const { data: journals } = await supabase
    .from('journals')
    .select('id, issn')
    .not('issn', 'is', null)
    .limit(2000)

  if (!journals) return NextResponse.json({ error: 'No journals' })

  const chunks = []
  for (let i = 0; i < journals.length; i += 50) {
    chunks.push(journals.slice(i, i + 50))
  }

  let updated = 0
  for (const chunk of chunks) {
    const issnFilter = chunk.map(j => j.issn).join('|')
    try {
      const res = await fetch(
        `https://api.openalex.org/sources?filter=issn:${issnFilter}&per-page=50&select=issn,summary_stats,cited_by_count`,
        { headers: { 'User-Agent': 'VeriJournals/1.0' } }
      )
      const data = await res.json()
      for (const source of (data.results || [])) {
        if (!source.issn) continue
        const journal = chunk.find(j => source.issn.includes(j.issn))
        if (!journal) continue
        await supabase.from('journals').update({
          h_index: source.summary_stats?.h_index || null,
          total_cites: source.cited_by_count || null,
        }).eq('id', journal.id)
        updated++
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 300))
  }

  return NextResponse.json({ success: true, updated, timestamp: new Date().toISOString() })
}
