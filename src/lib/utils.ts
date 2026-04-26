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

export function getTrustLabel(status: string, lang: string = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      trusted: 'Trusted Journal',
      high_risk: 'High Risk — Potentially Predatory',
      review_needed: 'Review Needed',
      under_evaluation: 'Under Evaluation',
      discontinued: 'Discontinued',
    },
    ar: {
      trusted: 'مجلة موثوقة',
      high_risk: 'خطر عالٍ — مجلة مشبوهة',
      review_needed: 'تحتاج مراجعة',
      under_evaluation: 'تحت التقييم',
      discontinued: 'متوقفة',
    },
  }
  return labels[lang]?.[status] ?? status
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
