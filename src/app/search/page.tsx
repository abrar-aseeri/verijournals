'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { getTrustColor, getTrustLabel, formatISSN } from '@/lib/utils'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'title'
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`)
      .then((r) => r.json())
      .then((data) => { setResults(data.journals || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [q, type])

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Search results for <span className="font-semibold text-gray-800">"{q}"</span>
            {' '}— {loading ? '...' : `${results.length} journal(s) found`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin"/>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">No journals found for "{q}"</p>
            <p className="text-gray-400 text-xs mt-2">Try searching by ISSN or full journal title</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map((journal) => (
              <Link
                key={journal.id}
                href={`/journal/${journal.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-green-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900 text-base mb-1">{journal.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      {journal.issn && <span className="font-mono" style={{ color: '#007A44' }}>{formatISSN(journal.issn)}</span>}
                      {journal.publisher && <span>{journal.publisher}</span>}
                      {journal.country && <span>{journal.country}</span>}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {journal.specialty?.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getTrustColor(journal.trust_status)}`}>
                    {getTrustLabel(journal.trust_status)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
