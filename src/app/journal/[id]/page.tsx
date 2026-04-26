import { supabaseAdmin } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getTrustLabel, formatISSN } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default async function JournalPage({ params }: { params: { id: string } }) {
  const { data: journal } = await supabaseAdmin
    .from('journals')
    .select('*, journal_metrics(*), journal_indexing(*)')
    .eq('id', params.id)
    .single()

  if (!journal) notFound()

  const metrics = journal.journal_metrics || []
  const indexing = journal.journal_indexing || []
  const getMetric = (type: string) => metrics.find((m: any) => m.metric_type === type)
  const getIndex = (source: string) => indexing.find((i: any) => i.source === source)

  const kpis = [
    { label: 'CiteScore', type: 'citescore', source: 'Scopus' },
    { label: 'Q Index', type: 'quartile', source: 'SCImago' },
    { label: 'JCI', type: 'jci', source: 'Clarivate / WoS' },
    { label: 'Impact Factor', type: 'impact_factor', source: 'Clarivate JCR' },
  ]

  const sources = [
    { key: 'nlm', label: 'PubMed / NLM' },
    { key: 'scopus', label: 'Scopus' },
    { key: 'scimago', label: 'SCImago / SJR' },
    { key: 'wos_scie', label: 'Web of Science (SCI-E)' },
    { key: 'wos_esci', label: 'Web of Science (ESCI)' },
    { key: 'doaj', label: 'DOAJ' },
    { key: 'embase', label: 'Embase' },
    { key: 'crossref', label: 'Crossref' },
    { key: 'arab_impact_factor', label: 'Arab Impact Factor' },
    { key: 'bealls', label: "Beall's List" },
    { key: 'hijacked', label: 'Hijacked Journal Checker' },
    { key: 'retraction_watch', label: 'Retraction Watch' },
  ]

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{journal.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {journal.issn && <span className="font-mono" style={{ color: '#007A44' }}>{formatISSN(journal.issn)}</span>}
            {journal.publisher && <span>{journal.publisher}</span>}
            {journal.country && <span>{journal.country}</span>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {kpis.map((kpi) => {
            const metric = getMetric(kpi.type)
            const available = metric?.availability === 'available'
            const licensed = metric?.availability === 'licensed_required'
            return (
              <div key={kpi.type} className="bg-white border rounded-xl p-3"
                style={{ borderTop: `2.5px solid ${available ? '#00A05A' : licensed ? '#FFB020' : '#E5E7EB'}` }}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-
cat > "src/app/journal/[id]/page.tsx" << 'EOF'
import { supabaseAdmin } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getTrustLabel, formatISSN } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default async function JournalPage({ params }: { params: { id: string } }) {
  const { data: journal } = await supabaseAdmin
    .from('journals')
    .select('*, journal_metrics(*), journal_indexing(*)')
    .eq('id', params.id)
    .single()

  if (!journal) notFound()

  const metrics = journal.journal_metrics || []
  const indexing = journal.journal_indexing || []
  const getMetric = (type: string) => metrics.find((m: any) => m.metric_type === type)
  const getIndex = (source: string) => indexing.find((i: any) => i.source === source)

  const kpis = [
    { label: 'CiteScore', type: 'citescore', source: 'Scopus' },
    { label: 'Q Index', type: 'quartile', source: 'SCImago' },
    { label: 'JCI', type: 'jci', source: 'Clarivate / WoS' },
    { label: 'Impact Factor', type: 'impact_factor', source: 'Clarivate JCR' },
  ]

  const sources = [
    { key: 'nlm', label: 'PubMed / NLM' },
    { key: 'scopus', label: 'Scopus' },
    { key: 'scimago', label: 'SCImago / SJR' },
    { key: 'wos_scie', label: 'Web of Science (SCI-E)' },
    { key: 'wos_esci', label: 'Web of Science (ESCI)' },
    { key: 'doaj', label: 'DOAJ' },
    { key: 'embase', label: 'Embase' },
    { key: 'crossref', label: 'Crossref' },
    { key: 'arab_impact_factor', label: 'Arab Impact Factor' },
    { key: 'bealls', label: "Beall's List" },
    { key: 'hijacked', label: 'Hijacked Journal Checker' },
    { key: 'retraction_watch', label: 'Retraction Watch' },
  ]

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{journal.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {journal.issn && <span className="font-mono" style={{ color: '#007A44' }}>{formatISSN(journal.issn)}</span>}
            {journal.publisher && <span>{journal.publisher}</span>}
            {journal.country && <span>{journal.country}</span>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {kpis.map((kpi) => {
            const metric = getMetric(kpi.type)
            const available = metric?.availability === 'available'
            const licensed = metric?.availability === 'licensed_required'
            return (
              <div key={kpi.type} className="bg-white border rounded-xl p-3"
                style={{ borderTop: `2.5px solid ${available ? '#00A05A' : licensed ? '#FFB020' : '#E5E7EB'}` }}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{kpi.label}</div>
                {available && metric?.value ? (
                  <div className="text-2xl font-bold font-mono" style={{ color: '#0A1628' }}>
                    {kpi.type === 'quartile' ? `Q${metric.value}` : metric.value}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 mt-1">Not publicly available</div>
                )}
                <div className="text-xs text-gray-400 mt-1">{metric?.year ? `${metric.year} · ` : ''}{kpi.source}</div>
                <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: available ? '#E6F5EE' : licensed ? '#FEF3C7' : '#F3F4F6',
                    color: available ? '#007A44' : licensed ? '#7A5500' : '#6B7280',
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: available ? '#00A05A' : licensed ? '#FFB020' : '#9CA3AF' }}/>
                  {available ? 'Available' : licensed ? 'Licensed source' : 'Unavailable'}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border mb-6"
          style={{
            background: journal.trust_status === 'trusted' ? '#E6F5EE' : journal.trust_status === 'high_risk' ? '#FFE8EC' : '#FEF3C7',
            borderColor: journal.trust_status === 'trusted' ? '#7BE8B8' : journal.trust_status === 'high_risk' ? '#FFAAB4' : '#FFD97A',
          }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{
              background: journal.trust_status === 'trusted' ? '#CEFBE6' : journal.trust_status === 'high_risk' ? '#FFD0D8' : '#FFE9A8',
              color: journal.trust_status === 'trusted' ? '#007A44' : journal.trust_status === 'high_risk' ? '#FF3D5A' : '#7A5500',
            }}>
            {journal.trust_status === 'trusted' ? '✓' : journal.trust_status === 'high_risk' ? '✕' : '!'}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{getTrustLabel(journal.trust_status)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Trust: {journal.trust_score}/100 · Risk: {journal.risk_score}/100</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between">
            <span className="text-xs font-semibold text-gray-700">Database Indexing Status</span>
            {journal.last_verified_at && (
              <span className="text-xs text-gray-400">Last verified: {new Date(journal.last_verified_at).toLocaleDateString()}</span>
            )}
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th className="text-left px-4 py-2 font-medium">Database</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => {
                const idx = getIndex(src.key)
                const status = idx?.in_source || 'unknown'
                return (
                  <tr key={src.key} className="border-t border-gray-50">
                    <td className="px-4 py-2.5 text-sm text-gray-700">{src.label}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: status === 'yes' ? '#E6F5EE' : status === 'no' ? '#F3F4F6' : '#FEF3C7',
                          color: status === 'yes' ? '#007A44' : status === 'no' ? '#6B7280' : '#7A5500',
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full"
                          style={{ background: status === 'yes' ? '#00A05A' : status === 'no' ? '#D1D5DB' : '#FFB020' }}/>
                        {status === 'yes' ? 'Indexed' : status === 'no' ? 'Not listed' : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{idx?.notes || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  )
}
