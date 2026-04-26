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

  const trustColor = journal.trust_status === 'trusted' ? '#00A05A' : 
                     journal.trust_status === 'high_risk' ? '#FF3D5A' : '#FFB020'
  const trustBg = journal.trust_status === 'trusted' ? '#E6F5EE' : 
                  journal.trust_status === 'high_risk' ? '#FFE8EC' : '#FEF3C7'
  const trustLabel = journal.trust_status === 'trusted' ? 'Trusted' : 
                     journal.trust_status === 'high_risk' ? 'High Risk' : 'Under Evaluation'

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8">
        <Link href="/search" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1">
          ← Back to Search
        </Link>
        
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
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold flex-shrink-0"
              style={{ background: trustBg, color: trustColor }}>
              {trustLabel}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: '#F8FAFC' }}>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Trust Score</div>
              <div className="text-3xl font-bold" style={{ color: trustColor }}>{journal.trust_score || 0}</div>
              <div className="text-xs text-gray-400">out of 100</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Risk Score</div>
              <div className="text-3xl font-bold text-red-500">{journal.risk_score || 0}</div>
              <div className="text-xs text-gray-400">out of 100</div>
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
