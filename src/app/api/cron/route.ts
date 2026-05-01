import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // نأخذ المجلات على دفعات - كل cron يعالج 2000 مجلة
  const batchOffset = parseInt(req.nextUrl.searchParams.get('offset') || '0')
  const BATCH_SIZE = 2000

  const { data: journals, error } = await supabase
    .from('journals')
    .select('id, issn')
    .not('issn', 'is', null)
    .range(batchOffset, batchOffset + BATCH_SIZE - 1)

  if (error || !journals) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }

  let updated = 0
  const chunkSize = 50

  for (let i = 0; i < journals.length; i += chunkSize) {
    const chunk = journals.slice(i, i + chunkSize)
    const issnList = chunk.map(j => j.issn).join('|')

    try {
      const res = await fetch(
        `https://api.openalex.org/sources?filter=issn:${issnList}&per_page=50`,
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

    await new Promise(r => setTimeout(r, 200))
  }

  return NextResponse.json({
    success: true,
    updated,
    offset: batchOffset,
    processed: journals.length,
    timestamp: new Date().toISOString()
  })
}
