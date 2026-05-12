import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatISSN(issn: string): string {
  if (!issn) return ''
  const clean = issn.replace(/[^0-9X]/gi, '')
  if (clean.length === 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`
  return issn
}

export function getTrustColor(status: string): string {
  switch (status) {
    case 'trusted': return 'text-green-700 bg-green-50 border-green-200'
    case 'high_risk': return 'text-red-700 bg-red-50 border-red-200'
    case 'review_needed': return 'text-amber-700 bg-amber-50 border-amber-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

// Display-layer status labels.
// LEGAL: These labels are intentionally factual ("indicator" framing) rather
// than categorical judgments. Do not reintroduce the older terminology
// ("Trusted", "High Risk", "Predatory") at the display layer without legal
// review — Saudi Anti-Cyber Crime Law Article 3 exposure on the prior copy.
// The DB enum values (trusted / high_risk / review_needed / under_evaluation)
// remain unchanged — only the rendered strings are softened here.
export function getTrustLabel(status: string, lang: string = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      trusted: 'Multiple Positive Indicators',
      high_risk: 'Requires Careful Verification',
      review_needed: 'Verification Recommended',
      under_evaluation: 'Limited Indexing Coverage',
      discontinued: 'Discontinued',
      predatory: 'Requires Careful Verification (with attention signals)',
    },
    ar: {
      trusted: 'مؤشرات إيجابية متعددة',
      high_risk: 'تتطلب تحققاً دقيقاً',
      review_needed: 'يُوصى بالمراجعة',
      under_evaluation: 'بيانات فهرسة محدودة',
      discontinued: 'متوقفة',
      predatory: 'تتطلب تحققاً دقيقاً مع مؤشرات تستدعي الانتباه',
    },
  }
  return labels[lang]?.[status] ?? status
}

// Returns the list of upstream sources that contributed to a journal's
// current trust/risk status, mapped to display names. Source attribution
// is part of the legal posture: render these alongside every status badge
// so users see WHICH third-party sources backed our display, not just a
// VeriJournals-issued label.
const SOURCE_NAMES: Record<string, string> = {
  nlm: 'NLM',
  doaj: 'DOAJ',
  crossref: 'Crossref',
  scimago: 'SCImago',
  scopus: 'Scopus',
  wos: 'Web of Science',
  bealls: "Beall's List",
  hijacked: 'Hijacked Journals',
  retraction: 'Retraction Watch',
}

export function formatContributingSources(
  trustReasons: Record<string, string> | null | undefined,
  riskReasons: Record<string, string> | null | undefined,
): string[] {
  const keys = new Set<string>([
    ...Object.keys(trustReasons ?? {}),
    ...Object.keys(riskReasons ?? {}),
  ])
  return [...keys].map((k) => SOURCE_NAMES[k]).filter(Boolean)
}

export function formatVerifiedDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toISOString().slice(0, 10)
}

export function getAvailabilityLabel(availability: string, lang: string = 'en'): string {
  if (lang === 'ar') {
    switch (availability) {
      case 'available': return 'متاح'
      case 'licensed_required': return 'مصدر مرخّص'
      default: return 'غير متاح'
    }
  }
  switch (availability) {
    case 'available': return 'Available'
    case 'licensed_required': return 'Licensed Source Required'
    default: return 'Not Available'
  }
}
