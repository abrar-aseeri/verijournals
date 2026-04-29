import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function importSJR() {
  console.log('Reading SCImago CSV...')
  const raw = fs.readFileSync('scripts/sjr2023.csv', 'latin1')
  const lines = raw.split('\n').slice(1)
  console.log(`Total lines: ${lines.length}`)

  const issnMap = {}
  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split(';')
    if (cols.length < 11) continue
    const issnRaw = cols[4]?.replace(/"/g, '').trim()
    const quartile = cols[9]?.replace(/"/g, '').trim()
    if (!issnRaw || !quartile || !quartile.startsWith('Q')) continue
    const issns = issnRaw.split(',').map(s => s.trim()).filter(Boolean)
    for (const issn of issns) {
      if (issn.length === 8) {
        const formatted = issn.slice(0,4) + '-' + issn.slice(4)
        issnMap[formatted] = quartile
        issnMap[issn] = quartile
      } else {
        issnMap[issn] = quartile
      }
    }
  }
  console.log(`Parsed ${Object.keys(issnMap).length} ISSN entries`)

  const { data: journals, error } = await supabase
    .from('journals').select('id, issn')
  if (error) { console.error('DB error:', error.message); return }
  console.log(`Found ${journals.length} journals in DB`)

  let updated = 0, notFound = 0
  for (const journal of journals) {
    const issn = journal.issn
    if (!issn) { notFound++; continue }
    const issnClean = issn.replace('-', '')
    const quartile = issnMap[issn] || issnMap[issnClean] || null
    if (quartile) {
      const { error: e } = await supabase.from('journals').update({ quartile }).eq('id', journal.id)
      if (!e) updated++
    } else {
      notFound++
    }
  }
  console.log(`Done! Updated: ${updated} | Not in SCImago: ${notFound}`)
}

importSJR().catch(console.error)
