import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getArticleAndJournal(doi: string) {
  try {
    const res = await fetch(
      `https://api.openalex.org/works/https://doi.org/${doi}?select=title,authorships,publication_date,is_retracted,cited_by_count,primary_location`,
      { headers: { "User-Agent": "VeriJournals/1.0" }, cache: "no-store" }
    )
    if (!res.ok) return { article: null, journal: null, issn: null, journalName: null, quartile: null, isPredatory: false }
    const article = await res.json()
    const issn = article?.primary_location?.source?.issn_l || article?.primary_location?.source?.issn?.[0]
    const journalName = article?.primary_location?.source?.display_name

    let journal = null
    if (issn) {
      const jRes = await fetch(
        `https://api.openalex.org/sources?filter=issn:${issn}&per_page=1`,
        { headers: { "User-Agent": "VeriJournals/1.0" }, cache: "no-store" }
      )
      const jData = await jRes.json()
      journal = jData.results?.[0] || null
    }

    let quartile = null
    let isPredatory = false
    if (issn) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase
        .from("journals")
        .select("quartile, is_predatory")
        .eq("issn", issn)
        .limit(1)
      if (data && data.length > 0) {
        quartile = data[0].quartile
        isPredatory = data[0].is_predatory ?? false
      }
    }

    return { article, journal, issn, journalName, quartile, isPredatory }
  } catch {
    return { article: null, journal: null, issn: null, journalName: null, quartile: null, isPredatory: false }
  }
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

  const { article, journal, issn, journalName, quartile, isPredatory } = await getArticleAndJournal(doi)
  const authors = article?.authorships?.slice(0, 3).map((a: any) => a.author?.display_name).filter(Boolean).join(", ")
  const pubDate = article?.publication_date
    ? new Date(article.publication_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null
  const hIndex = journal?.summary_stats?.h_index ?? null
  const citations = journal?.cited_by_count ?? null

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold" style={{ background: "#E6F5EE", color: "#007A44" }}>
            DOI: {doi}
          </span>
        </div>

        {article ? (
          <>
            {article.is_retracted && (
              <div className="p-4 rounded-xl mb-4" style={{ background: "#FFF0F0", border: "2px solid #FF3D5A" }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚫</span>
                  <div>
                    <div className="text-sm font-bold text-red-600">RETRACTED ARTICLE</div>
                    <div className="text-xs text-red-500">This article has been retracted by the publisher.</div>
                  </div>
                </div>
              </div>
            )}

            {isPredatory && (
              <div className="p-4 rounded-xl mb-4" style={{ background: "#FFF0F0", border: "2px solid #FF3D5A" }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <div className="text-sm font-bold text-red-600">PREDATORY JOURNAL WARNING</div>
                    <div className="text-xs text-red-500">This journal has been flagged as potentially predatory.</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {article.is_retracted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#FFE8EC", color: "#FF3D5A" }}>Retracted</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#E6F5EE", color: "#00A05A" }}>Active — No retractions or corrections</span>
                )}
                {article.cited_by_count > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                    Cited {article.cited_by_count} times
                  </span>
                )}
              </div>
              {authors && <p className="text-sm text-gray-600 mb-1">{authors}{article?.authorships?.length > 3 ? " et al." : ""}</p>}
              {pubDate && <p className="text-sm text-gray-400">Published: {pubDate}</p>}
            </div>

            {(journalName || journal) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Published in Journal</div>
                <div className="font-bold text-gray-900 text-lg mb-1">{journalName || journal?.display_name}</div>
                {issn && <div className="text-sm font-mono mb-4" style={{ color: "#007A44" }}>{issn}</div>}

                {(hIndex || citations) && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl mb-4" style={{ background: "#F8FAFC" }}>
                    {hIndex && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">H-Index</div>
                        <div className="text-2xl font-bold text-blue-600">{hIndex}</div>
                        <div className="text-xs text-gray-400">OpenAlex</div>
                      </div>
                    )}
                    {citations && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Citations</div>
                        <div className="text-2xl font-bold text-purple-600">{citations.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">all time</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Journal Metrics</span>
                  </div>
                  <div className="grid grid-cols-4 divide-x divide-gray-100">
                    <div className="p-4 text-center">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">SCImago Quartile</div>
                      {quartile ? (
                        <div className="text-lg font-bold" style={{
                          color: quartile === "Q1" ? "#00A05A" : quartile === "Q2" ? "#2563EB" : quartile === "Q3" ? "#D97706" : "#DC2626"
                        }}>{quartile}</div>
                      ) : (
                        <div className="text-lg font-bold text-gray-300">—</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">SCImago 2023</div>
                    </div>
                    {[
                      { 
                        label: "Impact Factor", 
                        source: "Clarivate JCR",
                        url: `https://jcr.clarivate.com/jcr/browse-journals?q=${encodeURIComponent(journalName || issn || '')}`
                      },
                      { 
                        label: "CiteScore", 
                        source: "Scopus",
                        url: `https://www.scopus.com/sources.uri?name=${encodeURIComponent(journalName || '')}`
                      },
                      { 
                        label: "JCI", 
                        source: "Web of Science",
                        url: `https://mjl.clarivate.com/search-results?issn=${issn || ''}`
                      },
                    ].map(m => (
                      <div key={m.label} className="p-4 text-center">
                        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{m.label}</div>
                        <div className="text-lg font-bold text-gray-300 mb-1">—</div>
                        <div className="text-xs text-gray-400 mb-2">{m.source}</div>
                        <a href={m.url} target="_blank" rel="noopener noreferrer"
                          className="inline-block px-2 py-1 rounded text-xs font-medium transition-colors"
                          style={{ background: "#E6F5EE", color: "#007A44" }}>
                          Search →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
