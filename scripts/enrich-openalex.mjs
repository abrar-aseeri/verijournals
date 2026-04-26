import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function enrichFromOpenAlex() {
  console.log('Starting OpenAlex enrichment...')
  
  const { data: journals } = await supabase
    .from('journals')
    .select('id, issn')
    .not('issn', 'is', null)
    .limit(2000)

  if (!journals) { console.log('No journals found'); return }
  console.log(`Found ${journals.length} journals to enrich`)

  const issnList = journals.map(j => j.issn).join('|')
  const chunks = []
  for (let i = 0; i < journals.length; i += 50) {
    chunks.push(journals.slice(i, i + 50))
  }

  let updated = 0
  for (const chunk of chunks) {
    const filter = chunk.map(j => `issn:${j.issn}`).join('|')
    const url = `https://api.openalex.org/sources?filter=issn:${chunk.map(j=>j.issn).join('|')}&per-page=50&select=issn,summary_stats,cited_by_count`
    
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'VeriJournals/1.0' } })
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
    } catch(e) {
      console.error('Chunk error:', e.message)
    }
    
    console.log(`Updated ${updated} journals...`)
    await new Promise(r => setTimeout(r, 300))
  }
  console.log(`Done! Total updated: ${updated}`)
}

enrichFromOpenAlex().catch(console.error)
