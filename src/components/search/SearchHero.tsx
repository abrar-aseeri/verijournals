'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const searchTypes = [
  { value: 'issn', label: 'ISSN / eISSN' },
  { value: 'title', label: 'Journal Title' },
  { value: 'doi', label: 'DOI' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'specialty', label: 'Specialty' },
]

const examples = [
  { label: '2049-3630', type: 'issn' },
  { label: 'Nature Medicine', type: 'title' },
  { label: 'The Lancet', type: 'title' },
  { label: '10.1056/NEJMoa2001316', type: 'doi' },
]

const DOI_RE = /^10\.\d{4,9}\/.+/

type DoiError = { msg: string; doi: string; showArticleLink: boolean }

export default function SearchHero() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('issn')
  const [loading, setLoading] = useState(false)
  const [doiError, setDoiError] = useState<DoiError | null>(null)
  const router = useRouter()

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    setDoiError(null)

    const isDoi = searchType === 'doi' || DOI_RE.test(q)
    if (!isDoi) {
      router.push(`/search?q=${encodeURIComponent(q)}&type=${searchType}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/doi?doi=${encodeURIComponent(q)}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        setDoiError({ msg: 'لم يتم العثور على هذا الـ DOI. تحقق من الصيغة وحاول مرة أخرى.', doi: q, showArticleLink: false })
        setLoading(false)
        return
      }

      const journalId = json.article?.journal_id as string | null | undefined
      if (journalId) {
        router.push(`/journal/${journalId}`)
        return
      }

      setDoiError({ msg: 'تم العثور على المقالة، لكن المجلة غير مفهرسة في قاعدة بياناتنا.', doi: q, showArticleLink: true })
      setLoading(false)
    } catch {
      setDoiError({ msg: 'تعذّر الاتصال بالخادم. حاول مرة أخرى.', doi: q, showArticleLink: false })
      setLoading(false)
    }
  }

  return (
    <section style={{ background: '#F8FAFC' }} className="w-full pt-12 pb-12 px-6">
      <div className="max-w-3xl mx-auto text-center">
        { /* eslint-disable-next-line @next/next/no-img-element */ }
        <img
          src="/branding/verijournals_logo_transparent.png"
          alt="VeriJournals"
          className="mx-auto mb-6"
          style={{ height: 96, width: 'auto' }}
        />
        <h1
          dir="rtl"
          className="leading-tight font-fs"
          style={{ color: '#0B4644', fontSize: '32px', fontWeight: 700 }}
        >
          بوابة التحقق من المجلات العلمية
        </h1>
        <p
          dir="rtl"
          className="mt-3"
          style={{ color: '#666666', fontSize: '16px', fontWeight: 400 }}
        >
          ابحث عن أي مجلة علمية للتحقق من موثوقيتها
        </p>

        <div
          className="mt-7 bg-white overflow-hidden flex"
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E5E5E5',
            height: '56px',
          }}
        >
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 text-sm outline-none cursor-pointer appearance-none"
            style={{
              border: 0,
              borderRight: '1px solid #E5E5E5',
              color: '#0B4644',
              fontWeight: 600,
              minWidth: '160px',
              background: '#FFFFFF',
              height: '100%',
            }}
          >
            {searchTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 1234-5678 or journal name…"
            className="flex-1 px-4 text-sm outline-none text-left"
            style={{ color: '#1A1A1A', height: '100%', border: 0, background: '#FFFFFF' }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="vj-search-btn px-8 text-base flex items-center gap-2 disabled:opacity-70"
            style={{ color: '#FFFFFF', fontWeight: 700, height: '100%', border: 0, borderRadius: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#fff" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span dir="rtl">{loading ? '...' : 'بحث'}</span>
          </button>
        </div>

        {doiError && (
          <div
            dir="rtl"
            className="mt-4 mx-auto max-w-xl rounded-lg px-4 py-3 text-right font-fs"
            style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E' }}
          >
            <div className="text-sm font-medium mb-1">{doiError.msg}</div>
            {doiError.showArticleLink && (
              <a
                href={`/article?doi=${encodeURIComponent(doiError.doi)}`}
                className="text-xs underline hover:opacity-80"
                style={{ color: '#0B4644', fontWeight: 600 }}
              >
                عرض تفاصيل المقالة من Crossref
              </a>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          {examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setQuery(ex.label); setSearchType(ex.type) }}
              className="text-xs px-3 py-1.5 transition-colors"
              style={{
                background: '#F5F5F5',
                border: '1px solid #E5E5E5',
                color: '#0B4644',
                fontWeight: 500,
                borderRadius: '999px',
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
