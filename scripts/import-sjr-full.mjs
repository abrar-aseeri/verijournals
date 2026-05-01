import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ';' && !inQuotes) { result.push(current.trim()); current = ''; continue }
    current += ch
  }
  result.push(current.trim())
  return result
}

async function importAllSJR() {
  console.log('Reading SCImago CSV...')
  const csvPath = resolve('scripts/sjr2023.csv')
  const lines = readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim())
  console.log(`Total journals to import: ${lines.length - 1}`)

  const BATCH = 500
  let imported = 0
  let skipped = 0
  let batch = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    if (cols.length < 10) continue

    const title = cols[2] || ''
    const type = cols[3] || ''
    const issnRaw = cols[4] || ''
    const publisher = cols[5] || ''
    const openAccess = cols[6] === 'Yes'
    const quartile = cols[9] || null
    const hIndex = parseInt(cols[10]) || null
    const totalDocs = parseInt(cols[11]) || null
    const country = cols[20] || null

    if (type !== 'journal') { skipped++; continue }

    const issnList = issnRaw.split(',').map(s => s.trim()).filter(Boolean)
    if (issnList.length === 0) { skipped++; continue }

    const rawIssn = issnList[0]
    const issn = rawIssn.length === 8
      ? rawIssn.slice(0,4) + '-' + rawIssn.slice(4)
      : rawIssn

    const trustScore = quartile === 'Q1' ? 90 : quartile === 'Q2' ? 75 : quartile === 'Q3' ? 60 : 45
    const riskScore  = quartile === 'Q1' ? 5  : quartile === 'Q2' ? 10 : quartile === 'Q3' ? 20 : 30

    batch.push({
      title,
      issn,
      publisher: publisher || null,
      country: country || null,
      open_access: openAccess,
      quartile: quartile || null,
      h_index: hIndex,
      total_docs: totalDocs,
      trust_status: 'trusted',
      trust_score: trustScore,
      risk_score: riskScore,
      sjr_year: 2023,
    })

    if (batch.length >= BATCH) {
      const { error } = await supabase.from('journals').insert(batch)
      if (error) {
        console.error(`Batch error at ${imported}: ${error.message}`)
      } else {
        imported += batch.length
        console.log(`✓ Imported: ${imported} journals`)
      }
      batch = []
      await new Promise(r => setTimeout(r, 400))
    }
  }

  if (batch.length > 0) {
    const { error } = await supabase.from('journals').insert(batch)
    if (!error) { imported += batch.length }
    else console.error('Final batch error:', error.message)
  }

  console.log(`\n✅ Done! Imported: ${imported} | Skipped (non-journal): ${skipped}`)
}

importAllSJR().catch(console.error)
