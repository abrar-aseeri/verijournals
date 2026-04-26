import { getAdmin } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
  const trustLabel = journal.trust_status === 'trusted' ? 'Trusted' : 
                     journal.trust_status === 'high_risk' ? 'High Risk' : 'Under Evaluation'

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8">
        <Link href="/search" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← Back to Search
        </Link>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{journal.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {journal.issn && <span className="font-mono text-green-700">{journal.issn}</span>}
                {journal.publisher && <span>{journal.publisher}</span>}
                {journal.country && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{journal.country}</span>}
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-white ml-4 flex-shrink-0"
              style={{ background: trustColor }}>
              {trustLabel}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="text-xs text-gray-500 mb-1">Trust Score</div>
              <div className="text-2xl font-bold" style={{ color: trustColor }}>{journal.trust_score || 0}/100</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Risk Score</div>
              <div className="text-2xl font-bold text-red-500">{journal.risk_score || 0}/100</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Journal Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {journal.open_access && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"/>
                <span className="text-sm text-gray-700">Open Access</span>
              </div>
            )}
            {journal.language && (
              <div>
                <span className="text-xs text-gray-500">Language: </span>
                <span className="text-sm text-gray-700">{journal.language}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Data shown is for reference only. Not an official certified source.
        </div>
      </main>
      <Footer />
    </>
  )
}
