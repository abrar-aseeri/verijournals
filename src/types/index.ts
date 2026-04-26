export type TrustStatus = 'trusted' | 'review_needed' | 'high_risk' | 'under_evaluation' | 'discontinued'
export type AvailabilityStatus = 'available' | 'unavailable' | 'licensed_required'
export type ArticleStatus = 'active' | 'retracted' | 'corrected' | 'expression_of_concern'
export type Language = 'en' | 'ar' | 'bilingual'

export interface Journal {
  id: string
  title: string
  title_aliases?: string[]
  issn?: string
  eissn?: string
  publisher?: string
  country?: string
  specialty?: string[]
  language?: string
  open_access?: boolean
  oa_type?: string
  peer_reviewed?: boolean
  website_url?: string
  trust_score: number
  risk_score: number
  trust_status: TrustStatus
  trust_reasons?: Record<string, string>
  risk_reasons?: Record<string, string>
  review_status?: string
  last_verified_at?: string
  data_completeness?: number
  created_at: string
  updated_at: string
}

export interface JournalMetric {
  id: string
  journal_id: string
  metric_type: 'citescore' | 'quartile' | 'jci' | 'impact_factor'
  value?: number
  year?: number
  source?: string
  availability: AvailabilityStatus
  license_note?: string
  verified_at?: string
}

export interface JournalIndexing {
  id: string
  journal_id: string
  source: string
  in_source: 'yes' | 'no' | 'unknown'
  wos_sub_index?: string
  source_url?: string
  verification_method?: string
  notes?: string
  last_verified_at?: string
}

export interface Article {
  id: string
  doi: string
  journal_id?: string
  title?: string
  authors?: { name: string; affiliation?: string }[]
  published_date?: string
  article_status: ArticleStatus
  retraction_date?: string
  retraction_reason?: string
  last_fetched_at?: string
}

export interface User {
  id: string
  auth_id: string
  full_name: string
  email: string
  employee_id?: string
  hospital_code?: string
  hospital_name?: string
  specialty?: string
  role: 'user' | 'admin'
  created_at: string
}

export interface SearchResult {
  journals: Journal[]
  total: number
  query: string
  search_type: string
}
