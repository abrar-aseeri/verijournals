import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function importFromDOAJ() {
  console.log('Fetching journals from DOAJ...')
  let page = 0
  let imported = 0

  while (true) {
    const res = await fetch(
      `https://doaj.org/api/search/journals/*?page=${page + 1}&pageSize=100`
    )
    const data = await res.json()
    if (!data.results || data.results.length === 0) break

    const journals = data.results.map((j) => ({
      title: j.bibjson?.title || 'Unknown',
      issn: j.bibjson?.pissn || j.bibjson?.eissn || null,
      publisher: j.bibjson?.publisher?.name || null,
      country: j.bibjson?.publisher?.country || null,
      language: (j.bibjson?.language || []).join(', ') || null,
      open_access: true,
      trust_status: 'under_evaluation',
      trust_score: 30,
      risk_score: 10,
    }))

    const { error } = await supabase.from('journals').insert(journals)
    if (error) console.error('Error:', error.message)
    else {
      imported += journals.length
      console.log('Page ' + (page + 1) + ': imported ' + imported + ' total')
    }
    page++
    if (page >= 200) break
    await new Promise(r => setTimeout(r, 500))
  }
  console.log('Done! Total: ' + imported)
}

importFromDOAJ().catch(console.error)
