import { Journal, JournalIndexing } from '@/types'

export function calculateScores(indexing: JournalIndexing[]): {
  trust_score: number
  risk_score: number
  trust_status: string
  trust_reasons: Record<string, string>
  risk_reasons: Record<string, string>
} {
  let trust = 0
  let risk = 0
  const trust_reasons: Record<string, string> = {}
  const risk_reasons: Record<string, string> = {}

  const get = (source: string) =>
    indexing.find((i) => i.source === source)?.in_source

  if (get('nlm') === 'yes') { trust += 20; trust_reasons['nlm'] = 'Indexed in PubMed/NLM' }
  if (get('doaj') === 'yes') { trust += 20; trust_reasons['doaj'] = 'Listed in DOAJ with full transparency' }
  if (get('crossref') === 'yes') { trust += 15; trust_reasons['crossref'] = 'Valid DOI via Crossref, ISSN consistent' }
  if (get('scimago') === 'yes') { trust += 10; trust_reasons['scimago'] = 'Indexed in SCImago/SJR' }
  if (get('scopus') === 'yes') { trust += 10; trust_reasons['scopus'] = 'Indexed in Scopus' }
  if (get('wos_scie') === 'yes' || get('wos_ssci') === 'yes' || get('wos_esci') === 'yes') {
    trust += 10; trust_reasons['wos'] = 'Indexed in Web of Science'
  }

  if (get('bealls') === 'yes') { risk += 25; risk_reasons['bealls'] = "Listed on Beall's predatory list" }
  if (get('hijacked') === 'yes') { risk += 30; risk_reasons['hijacked'] = 'Flagged in Hijacked Journal Checker' }
  if (get('retraction_watch') === 'yes') { risk += 10; risk_reasons['retraction'] = 'Flagged on Retraction Watch' }
  if (get('crossref') === 'no') { risk += 5; risk_reasons['no_doi'] = 'No Crossref DOI found' }

  trust = Math.min(trust, 100)
  risk = Math.min(risk, 100)

  let trust_status = 'under_evaluation'
  if (trust >= 60 && risk < 30) trust_status = 'trusted'
  else if (risk >= 40) trust_status = 'high_risk'
  else if (trust >= 30) trust_status = 'review_needed'

  return { trust_score: trust, risk_score: risk, trust_status, trust_reasons, risk_reasons }
}
