import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

async function getArticleData(doi: string) {
  try {
    const res = await fetch(
      `https://api.openalex.org/works/https://doi.org/${doi}?select=title,authorships,publication_date,doi,primary_location,is_retracted,cited_by_count`,
      { headers: { 'User-Agent': 'VeriJournals/1.0' }, next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function getJournalData(issn: string) {
  try {
    const res = await fetch(
      `https://api.openalex.org/sources?filter=issn:${issn}&select=display_name,issn,cited_by_count,summary_stats,is_oa,publisher`,
      { headers: { 'User-Agent': 'VeriJournals/1.0' }, next: { revalidate: 2592000 } }
    )
    const d = await res.json()
    return d.results?.[0] || null
  } catch { return null }
}

export default async function ArticlePage({ searchParams }: { searchParams: Promise<{ doi?: string }> }) {
  const { doi } = await searchParams
  if (!doi) return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">No DOI provided.</p>
      </main>
      <Footer />
    </>
  )

  const article = await getArticleData(doi)
  
  let journalData = null
  const issn = article?.primary_location?.source?.issn_l || article?.primary_location?.source?.issn?.[0]
  if (issn) journalData = await getJournalData(issn)

  const journalName = article?.primary_location?.source?.display_name
  const authors = article?.authorships?.slice(0, 3).map((a: any) => a.author?.display_name).filter(Boolean).join(', ')
  const pubDate = article?.publication_date ? new Date(article.publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold" style={{ background: '#E6F5EE', color: '#007A44' }}>
            DOI: {doi}
          </span>
        </div>

        {article ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h1>
              {authors && <p className="text-sm text-gray-500 mb-1">{authors}{article.authorships?.length > 3 ? ' et al.' : ''}</p>}
              {pubDate && <p className="text-sm text-gray-400 mb-3">Published: {pubDate}</p>}
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                  background: article.is_retracted ? '#FFE8EC' : '#E6F5EE',
                  color: article.is_retracted ? '#FF3D5A' : '#007A44'
                }}>
                  {article.is_retracted ? '⚠️ Retracted' : 'Active — No retractions or corrections'}
                </span>
                {article.cited_by_count > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    Cited {article.cited_by_count} times
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Published in Journal</h2>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{journalData?.display_name || journalName || '—'}</p>
                  {issn && <p className="text-sm font-mono" style={{ color: '#007A44' }}>{issn}</p>}
                  {journalData?.publisher && <p className="text-sm text-gray-500">{journalData.publisher}</p>}
                </div>
                {journalData?.is_oa && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">Open Access</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl text-center" style={{ background: '#F8FAFC' }}>
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">H-Index</div>
                  <div className="text-xl font-bold text-blue-600">{journalData?.summary_stats?.h_index ?? '—'}</div>
                  <div className="text-xs text-gray-400">OpenAlex</div>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: '#F8FAFC' }}>
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Citations</div>
                  <div className="text-xl font-bold text-purple-600">
                    {journalData?.cited_by_count?.toLocaleString() ?? '—'}
                  </div>
                  <div className="text-xs text-gray-400">all time</div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Metrics requiring institutional access</span>
                </div>
                <div className="grid grid-cols-4 divide-x divide-gray-100">
                  {[
                    { label: 'Impact Factor', source: 'Clarivate JCR' },
                    { label: 'CiteScore', source: 'Scopus' },
                    { label: 'Q Index', source: 'SCImago' },
                    { label: 'JCI', source: 'Web of Science' },
                  ].map(m => (
                    <div key={m.label} className="p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                      <div className="text-lg font-bold text-gray-300">—</div>
                      <div className="text-xs text-gray-400">{m.source}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-xs" style={{ background: '#FEF3C7', color: '#92400E' }}>
                        Institutional
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Article not found for this DOI.</p>
          </div>
        )}

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-sm text-amber-800">Data shown is for reference only. Not an official certified source.</span>
        </div>
      </main>
      <Footer />
    </>
  )
}
