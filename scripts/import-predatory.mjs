import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PREDATORY_ISSNS = [
  { issn: '2155-9538', title: 'Journal of Bioengineering & Biomedical Science', source: 'bealls_list' },
  { issn: '2157-7412', title: 'Journal of Genetic Syndromes & Gene Therapy', source: 'bealls_list' },
  { issn: '2161-0681', title: 'Journal of Clinical & Experimental Pathology', source: 'bealls_list' },
  { issn: '2161-0703', title: 'Journal of Medical Microbiology & Diagnosis', source: 'bealls_list' },
  { issn: '2167-0269', title: 'Journal of Tourism & Hospitality', source: 'bealls_list' },
  { issn: '2332-0877', title: 'Journal of Infectious Diseases & Therapy', source: 'bealls_list' },
  { issn: '2376-0354', title: 'International Journal of Clinical Anesthesiology', source: 'bealls_list' },
  { issn: '1307-6892', title: 'World Academy of Science Engineering and Technology', source: 'bealls_list' },
  { issn: '2010-376X', title: 'International Journal of Social Science and Humanity', source: 'bealls_list' },
  { issn: '2518-2404', title: 'Science International (fake)', source: 'bealls_list' },
]

async function importPredatoryList() {
  console.log('Importing predatory journals list...')
  let flagged = 0
  let markedInDB = 0

  for (const j of PREDATORY_ISSNS) {
    const { error: flagError } = await supabase.from('flagged_journals').upsert({
      issn: j.issn,
      title: j.title,
      flag_type: 'predatory',
      flag_source: j.source,
      flag_reason: 'Listed in ' + j.source,
      verified: true
    }, { onConflict: 'issn' })
    if (!flagError) flagged++

    const issnClean = j.issn.replace('-', '')
    const { error: updateError } = await supabase
      .from('journals')
      .update({ is_predatory: true, trust_status: 'predatory', trust_score: 5, risk_score: 95 })
      .or('issn.eq.' + j.issn + ',issn.eq.' + issnClean)
    if (!updateError) markedInDB++
  }

  console.log('Flagged journals added: ' + flagged)
  console.log('Marked in journals DB: ' + markedInDB)
  console.log('Done! Predatory detection system initialized.')
}

importPredatoryList().catch(console.error)
