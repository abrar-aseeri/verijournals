'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getTrustLabel, formatISSN } from '@/lib/utils'
import Link from 'next/link'

function ArticleContent() {
  const searchParams = useSearchParams()
  const doi = searchParams.get('doi') || ''
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!doi) return
    setLoading(true)
    fetch(`/api/doi?doi=${encodeURIComponent(doi)}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d.article); setLoading(false) })
      .catch(() => { setError('Failed to fetch article'); setLoading(false) })
  }, [doi])

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    active: { color: '#007A44', bg: '#E6F5EE', label: 'Active — No retractions or corrections' },
    retracted: { color: '#FF3D5A', bg: '#FFE8EC', label: 'Retracted' },
    corrected: { color: '#FFB020', bg: '#FEF3C7', label: 'Corrected' },
    expression_of_concern: { color: '#FFB020', bg: '#FEF3C7', label: 'Expression of Concern' },
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-4">
          <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#E6F5EE', color: '#007A44' }}>
            DOI: {doi}
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin"/>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        ) : data ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h1 className="text-lg font-bold text-gray-900 mb-2">{data.title}</h1>
            {data.authors?.length > 0 && (
              <p className="text-sm text-gray-500 mb-1">
                {data.authors.slice(0, 3).map((a: any) => a.name).join(', ')}
                {data.authors.length > 3 ? ' et al.' : ''}
              </p>
            )}
            {data.published_date && (
              <p className="text-xs text-gray-400 mb-4">
                Published: {new Date(data.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium mb-6"
              style={{ background: statusConfig[data.article_status]?.bg || '#F3F4F6', color: statusConfig[data.article_status]?.color || '#6B7280' }}>
              {statusConfig[data.article_status]?.label || data.article_status}
            </div>
            {data.journals && (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Published in</p>
                <Link href={`/journal/${data.journals.id}`}
                  className="block p-3 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                  <div className="font-medium text-sm text-gray-900">{data.journals.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {data.journals.issn && (
                      <span className="text-xs font-mono" style={{ color: '#007A44' }}>{formatISSN(data.journals.issn)}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: data.journals.trust_status === 'trusted' ? '#E6F5EE' : '#FEF3C7', color: data.journals.trust_status === 'trusted' ? '#007A44' : '#7A5500' }}>
                      {getTrustLabel(data.journals.trust_status)}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  )
}

import { Suspense } from 'react'
export default function ArticlePage() {
  return <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin"/></div>}><ArticleContent /></Suspense>
}
