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
    <div style={{ background: '#0A1628' }} className="w-full py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: 'rgba(0,160,90,0.18)', border: '0.5px solid rgba(0,160,90,0.35)', color: '#5DD9A4' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="#5DD9A4" strokeWidth="1.2"/>
            <path d="M5 3v2.5L6.5 7" stroke="#5DD9A4" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          Free · Open · Evidence-based
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
          Verify any scientific journal<br />
          <span style={{ color: '#5DD9A4' }}>before you publish or cite.</span>
        </h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Search by ISSN, DOI, journal title, or publisher. Get indexing status, trust score, and risk signals instantly.
        </p>

        <div className="bg-white rounded-xl overflow-hidden flex shadow-lg">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="h-12 px-3 text-sm font-semibold outline-none cursor-pointer"
            style={{ borderRight: '0.5px solid #E5E7EB', color: '#007A44', minWidth: '140px' }}
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
            className="flex-1 h-12 px-4 text-sm outline-none text-gray-800"
          />
          <button
            onClick={handleSearch}
            className="h-12 px-6 text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: '#00A05A' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#fff" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Search
          </button>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          {examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setQuery(ex.label); setSearchType(ex.type) }}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.55)' }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
