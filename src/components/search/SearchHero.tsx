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

export default function SearchHero() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('issn')
  const router = useRouter()

  function handleSearch() {
    if (!query.trim()) return
    if (searchType === 'doi') {
      router.push(`/article?doi=${encodeURIComponent(query.trim())}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${searchType}`)
    }
  }

  return (
    <section style={{ background: '#F8F8F8' }} className="w-full pt-14 pb-12 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1
          dir="rtl"
          className="leading-tight"
          style={{ color: '#1B5E20', fontSize: '32px', fontWeight: 700 }}
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
              color: '#1B5E20',
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
            className="vj-search-btn px-8 text-base flex items-center gap-2"
            style={{ color: '#FFFFFF', fontWeight: 700, height: '100%', border: 0, borderRadius: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#fff" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span dir="rtl">بحث</span>
          </button>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          {examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setQuery(ex.label); setSearchType(ex.type) }}
              className="text-xs px-3 py-1.5 transition-colors"
              style={{
                background: '#F5F5F5',
                border: '1px solid #E5E5E5',
                color: '#1B5E20',
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
