// =============================================================================
// scoring.ts — trust/risk scoring derived from journal_indexing rows.
//
// LEGAL POSTURE NOTE
// ------------------
// The strings produced by this file fall into two categories with different
// audiences and different legal-risk profiles:
//
//   1. Enum values written to journals.trust_status:
//        'trusted' | 'review_needed' | 'high_risk' | 'under_evaluation'
//      These are INTERNAL identifiers. They are NEVER rendered verbatim to
//      users. The user-facing display mapping lives in
//        src/lib/utils.ts:getTrustLabel()
//      where they translate to factual indicator labels (AR primary / EN):
//        trusted          → 'مؤشرات إيجابية متعددة'    / 'Multiple Positive Indicators'
//        review_needed    → 'يُوصى بالمراجعة'           / 'Verification Recommended'
//        high_risk        → 'تتطلب تحققاً دقيقاً'        / 'Requires Careful Verification'
//        under_evaluation → 'بيانات فهرسة محدودة'      / 'Limited Indexing Coverage'
//        predatory*       → 'تتطلب تحققاً دقيقاً مع مؤشرات تستدعي الانتباه'
//                         / 'Requires Careful Verification (with attention signals)'
//        (* 'predatory' is not a trust_status enum value; it is a display-layer
//         override applied when journals.is_predatory = true, regardless of the
//         underlying enum.)
//      This split is an emergency Saudi Anti-Cyber Crime Law (Royal Decree
//      M/17, Article 3) defamation-exposure mitigation. Categorical labels
//      at the display layer carry legal risk; factual indicator labels with
//      source attribution do not. DO NOT reintroduce raw enum values or the
//      older categorical terminology ('Trusted', 'High Risk', 'Predatory',
//      'Caution Signals Present') at the display layer without legal review.
//
//   2. Reason strings written to journals.trust_reasons / journals.risk_reasons:
//      e.g. risk_reasons['bealls'] = "Listed on Beall's predatory list"
//      These are stored in jsonb and are NOT currently rendered to users.
//      The wording is intentionally citation-style — attributing the term
//      to the source's own naming, not VeriJournals — which is safer than
//      a VeriJournals-issued categorical label. If these are ever surfaced
//      to users (journal page UI, public API responses, downloadable
//      reports), they must go through legal review first.
//
// WEIGHTS AND THRESHOLDS
// ----------------------
// Weights (+20 / +15 / +10) and thresholds (trust >= 50, risk >= 40,
// trust >= 30) are calibrated against the current open-source signal set
// (DOAJ + NLM + SCImago + Retraction Watch). Changes cascade to the
// trust_status of every journal at the next recompute AND to the published
// methodology page at /methodology. Do not change without an explicit
// scoring-policy review and a coordinated update to /methodology and the
// changelog there.
// =============================================================================

import { JournalIndexing } from '@/types'

export const IMPACT_SCORE_DISCLAIMER_AR =
  'مؤشر تقديري - بانتظار بيانات Clarivate الرسمية'

export type ImpactSignals = {
  sjr: number | null
  sjr_year: number | null
  citedness_2y: number | null
  citedness_2y_year: number | null
  disclaimer: string
}

export function estimatedImpactSignals(journal: {
  sjr_score?: number | null
  sjr_year?: number | null
  citedness_2y?: number | null
  citedness_2y_year?: number | null
}): ImpactSignals {
  return {
    sjr: journal.sjr_score ?? null,
    sjr_year: journal.sjr_year ?? null,
    citedness_2y: journal.citedness_2y ?? null,
    citedness_2y_year: journal.citedness_2y_year ?? null,
    disclaimer: IMPACT_SCORE_DISCLAIMER_AR,
  }
}

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
  if (trust >= 50 && risk < 30) trust_status = 'trusted'
  else if (risk >= 40) trust_status = 'high_risk'
  else if (trust >= 30) trust_status = 'review_needed'

  return { trust_score: trust, risk_score: risk, trust_status, trust_reasons, risk_reasons }
}
