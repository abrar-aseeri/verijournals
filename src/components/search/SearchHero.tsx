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
    <div style={{ background: '#F5F5F5' }} className="w-full py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div
          dir="rtl"
          className="text-center mb-8"
        >
          <p className="text-base mb-2" style={{ color: '#1B5E20', fontWeight: 600 }}>
            ابحث عن أي مجلة علمية للتحقق من موثوقيتها ومعلوماتها
          </p>
          <p className="text-sm" style={{ color: '#1A1A1A', opacity: 0.7 }}>
            Search by ISSN, DOI, journal title, or publisher.
          </p>
        </div>

        <div
          className="bg-white rounded-xl overflow-hidden flex shadow-md"
          style={{ borderTop: '3px solid #1B5E20' }}
        >
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="h-12 px-3 text-sm outline-none cursor-pointer"
            style={{
              borderRight: '1px solid #E5E7EB',
              color: '#1B5E20',
              fontWeight: 600,
              minWidth: '140px',
              background: '#FFFFFF',
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
            className="flex-1 h-12 px-4 text-sm outline-none"
            style={{ color: '#1A1A1A' }}
          />
          <button
            onClick={handleSearch}
            className="btn-primary h-12 px-6 text-sm flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#fff" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Search
          </button>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          {examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setQuery(ex.label); setSearchType(ex.type) }}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: '#FFFFFF',
                border: '1px solid #1B5E20',
                color: '#1B5E20',
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
