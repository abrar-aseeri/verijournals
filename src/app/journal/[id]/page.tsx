import { getAdmin } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ErrorReportButton from './ErrorReportButton'

export default async function JournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getAdmin()
  
  const { data: journal } = await supabase
    .from('journals')
    .select('*')
    .eq('id', id)
    .single()

  if (!journal) notFound()

  const isPredatory = journal.is_predatory === true
  const trustColor = isPredatory ? '#FF3D5A' :
                     journal.trust_status === 'trusted' ? '#00A05A' : 
                     journal.trust_status === 'high_risk' ? '#FF3D5A' : '#FFB020'
  const trustBg = isPredatory ? '#FFE8EC' :
                  journal.trust_status === 'trusted' ? '#E6F5EE' : 
                  journal.trust_status === 'high_risk' ? '#FFE8EC' : '#FEF3C7'
  const trustLabel = isPredatory ? '⚠️ Predatory Journal' :
                     journal.trust_status === 'trusted' ? 'Trusted' : 
                     journal.trust_status === 'high_risk' ? 'High Risk' : 'Under Evaluation'

  const quartileColor = (q: string | null) => {
    if (!q) return { bg: '#F3F4F6', text: '#6B7280' }
    if (q === 'Q1') return { bg: '#DCFCE7', text: '#15803D' }
    if (q === 'Q2') return { bg: '#DBEAFE', text: '#1D4ED8' }
    if (q === 'Q3') return { bg: '#FEF3C7', text: '#92400E' }
    return { bg: '#FFE8EC', text: '#BE123C' }
  }
  const qc = quartileColor(journal.quartile)

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8">
        <Link href="/search" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1">
          ← Back to Search
        </Link>

        {isPredatory && (
          <div className="mb-4 p-4 rounded-xl border-2 flex items-start gap-3" style={{ background: '#FFF1F2', borderColor: '#FF3D5A' }}>
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-red-700 text-sm mb-1">PREDATORY JOURNAL WARNING</div>
              <div className="text-sm text-red-600">This journal has been identified as predatory or fraudulent. Publishing in this journal may harm your academic reputation. Verify through official sources before submitting.</div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{journal.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {journal.issn && <span className="font-mono font-semibold" style={{ color: '#007A44' }}>{journal.issn}</span>}
                {journal.publisher && <span>{journal.publisher}</span>}
                {journal.country && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{journal.country}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold flex-shrink-0"
                style={{ background: trustBg, color: trustColor }}>
                {trustLabel}
              </span>
              {journal.quartile && (
                <span className="px-3 py-1 rounded-full text-sm font-bold flex-shrink-0"
                  style={{ background: qc.bg, color: qc.text }}>
                  SCImago {journal.quartile}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 p-4 rounded-xl mb-4" style={{ background: '#F8FAFC' }}>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Trust Score</div>
              <div className="text-2xl font-bold" style={{ color: trustColor }}>{journal.trust_score || 0}</div>
              <div className="text-xs text-gray-400">/ 100</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Risk Score</div>
              <div className="text-2xl font-bold text-red-500">{journal.risk_score || 0}</div>
              <div className="text-xs text-gray-400">/ 100</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">H-Index</div>
              <div className="text-2xl font-bold text-blue-600">{journal.h_index ?? '—'}</div>
              <div className="text-xs text-gray-400">OpenAlex</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Citations</div>
              <div className="text-2xl font-bold text-purple-600">
                {journal.total_cites ? journal.total_cites.toLocaleString() : '—'}
              </div>
              <div className="text-xs text-gray-400">all time</div>
            </div>
          </div>

          {journal.quartile && (
            <div className="mb-4 p-4 rounded-xl border" style={{ background: qc.bg, borderColor: qc.text + '33' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: qc.text }}>SCImago Journal Ranking</div>
                  <div className="text-sm text-gray-600">Best Quartile (2023)</div>
                </div>
                <div className="text-4xl font-black" style={{ color: qc.text }}>{journal.quartile}</div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Metrics requiring institutional access</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { label: 'Impact Factor', source: 'Clarivate JCR' },
                { label: 'CiteScore', source: 'Scopus' },
                { label: 'JCI', source: 'Web of Science' },
              ].map(m => (
                <div key={m.label} className="p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{m.label}</div>
                  <div className="text-lg font-bold text-gray-300">—</div>
                  <div className="text-xs text-gray-400 mt-1">{m.source}</div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs" style={{ background: '#FEF3C7', color: '#92400E' }}>
                      Institutional
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Journal Details</h2>
          <div className="grid grid-cols-2 gap-3">
            {journal.open_access && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"/>
                <span className="text-sm text-green-700 font-medium">Open Access</span>
              </div>
            )}
            {journal.language && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 block mb-0.5">Language</span>
                <span className="text-sm text-gray-700 font-medium">{journal.language}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <span className="text-sm text-amber-800">Data shown is for reference only. Not an official certified source.</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Found an error?</h2>
          <p className="text-sm text-gray-500 mb-4">Help us improve data accuracy by reporting incorrect information.</p>
          <ErrorReportButton journalId={journal.id} journalTitle={journal.title} />
        </div>
      </main>
      <Footer />
    </>
  )
}
