import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getScopusMetrics(issn: string) {
  try {
    const clean = issn.replace('-', '')
    const res = await fetch(
      `https://api.elsevier.com/content/serial/title/issn/${clean}`,
      { headers: { 'X-ELS-APIKey': process.env.SCOPUS_API_KEY || '1e8c46f1b5097b39a58bf29e42199ba6', 'Accept': 'application/json' }, cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()
    const entry = data?.['serial-metadata-response']?.entry?.[0]
    if (!entry) return null
    return {
      citeScore: entry.citeScoreYearInfoList?.citeScoreCurrentMetric ?? null,
      citeScoreYear: entry.citeScoreYearInfoList?.citeScoreCurrentMetricYear ?? null,
      sjr: entry.SJRList?.SJR?.[0]?.['$'] ?? null,
      sjrYear: entry.SJRList?.SJR?.[0]?.['@year'] ?? null,
      snip: entry.SNIPList?.SNIP?.[0]?.['$'] ?? null,
    }
  } catch { return null }
}

async function getArticleFromCrossRef(doi: string) {
  try {
    const res = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
      { headers: { 'User-Agent': 'VeriJournals/1.0 (mailto:abrar.aseeri@gmail.com)' }, cache: 'no-store' }
    )
    if (!res.ok) return null
    const json = await res.json()
    const m = json?.message
    if (!m) return null
    const dateParts = m.issued?.['date-parts']?.[0] || m.published?.['date-parts']?.[0] || m['published-print']?.['date-parts']?.[0]
    const publication_date = dateParts
      ? `${dateParts[0]}-${String(dateParts[1] || 1).padStart(2, '0')}-${String(dateParts[2] || 1).padStart(2, '0')}`
      : null
    return {
      title: Array.isArray(m.title) ? m.title[0] : m.title,
      authorships: (m.author || []).map((a: any) => ({
        author: { display_name: [a.given, a.family].filter(Boolean).join(' ') || a.name },
      })),
      publication_date,
      is_retracted: false,
      cited_by_count: m['is-referenced-by-count'] ?? 0,
      primary_location: {
        source: {
          issn_l: m.ISSN?.[0] ?? null,
          issn: m.ISSN ?? [],
          display_name: Array.isArray(m['container-title']) ? m['container-title'][0] : m['container-title'],
        },
      },
    }
  } catch { return null }
}

async function getRetraction(doi: string) {
  try {
    const res = await fetch(
      `https://api.retractionwatch.com/api/v1/retractionwatch?doi=${encodeURIComponent(doi)}`,
      { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
    )
    if (!res.ok) return null
    const json = await res.json()
    const item = Array.isArray(json) ? json[0] : (json?.results?.[0] ?? json?.data?.[0] ?? json?.records?.[0])
    if (!item) return null
    const reason = item.reason ?? item.retraction_reason ?? item.RetractionReason ?? item.Reason ?? null
    const date = item.retraction_date ?? item.RetractionDate ?? item.retractionDate ?? item.date ?? null
    return { reason, date }
  } catch { return null }
}

async function getDoajStatus(issn: string) {
  try {
    const res = await fetch(
      `https://doaj.org/api/v3/search/journals/issn%3A${encodeURIComponent(issn)}`,
      { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
    )
    if (!res.ok) return false
    const json = await res.json()
    return (json?.total ?? 0) > 0
  } catch { return false }
}

async function getArticleAndJournal(doi: string) {
  let article: any = null
  try {
    const res = await fetch(
      `https://api.openalex.org/works/https://doi.org/${doi}?select=title,authorships,publication_date,is_retracted,cited_by_count,primary_location`,
      { headers: { "User-Agent": "VeriJournals/1.0" }, cache: "no-store" }
    )
    if (res.ok) article = await res.json()
  } catch {}

  if (!article) {
    article = await getArticleFromCrossRef(doi)
  }

  if (!article) {
    return { article: null, journal: null, issn: null, journalName: null, quartile: null, isPredatory: false, sjrScore: null }
  }

  const issn = article?.primary_location?.source?.issn_l || article?.primary_location?.source?.issn?.[0]
  const journalName = article?.primary_location?.source?.display_name

  let journal = null
  if (issn) {
    try {
      const jRes = await fetch(
        `https://api.openalex.org/sources?filter=issn:${issn}&per_page=1`,
        { headers: { "User-Agent": "VeriJournals/1.0" }, cache: "no-store" }
      )
      if (jRes.ok) {
        const jData = await jRes.json()
        journal = jData.results?.[0] || null
      }
    } catch {}
  }

  let quartile = null
  let isPredatory = false
  let sjrScore: number | null = null
  if (issn) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase
        .from("journals")
        .select("quartile, is_predatory, sjr_score")
        .eq("issn", issn)
        .limit(1)
      if (data && data.length > 0) {
        quartile = data[0].quartile
        isPredatory = data[0].is_predatory ?? false
        sjrScore = data[0].sjr_score ?? null
      }
    } catch {}
  }

  return { article, journal, issn, journalName, quartile, isPredatory, sjrScore }
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

  const { article, journal, issn, journalName, quartile, isPredatory, sjrScore } = await getArticleAndJournal(doi)
  const [scopus, retraction, isDoaj] = await Promise.all([
    issn ? getScopusMetrics(issn) : Promise.resolve(null),
    getRetraction(doi),
    issn ? getDoajStatus(issn) : Promise.resolve(false),
  ])

  const retracted = Boolean(article?.is_retracted || retraction)
  const authors = article?.authorships?.slice(0, 3).map((a: any) => a.author?.display_name).filter(Boolean).join(", ")
  const pubDate = article?.publication_date
    ? new Date(article.publication_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null
  const retractionDate = retraction?.date
    ? new Date(retraction.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null
  const hIndex = journal?.summary_stats?.h_index ?? null
  const citations = journal?.cited_by_count ?? null
  const twoYrCitednessRaw = journal?.summary_stats?.["2yr_mean_citedness"]
  const twoYrCitedness = typeof twoYrCitednessRaw === "number" ? twoYrCitednessRaw.toFixed(2) : null

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold" style={{ background: "#E8F5E9", color: "#1B5E20" }}>
            DOI: {doi}
          </span>
        </div>

        {article ? (
          <>
            {retracted && (
              <div className="p-4 rounded-xl mb-4" style={{ background: "#FFF0F0", border: "2px solid #FF3D5A" }}>
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">🚫</span>
                  <div>
                    <div className="text-sm font-bold text-red-600">RETRACTED ARTICLE</div>
                    <div className="text-xs text-red-500">This article has been retracted by the publisher.</div>
                    {retraction?.reason && (
                      <div className="text-xs text-red-700 mt-1"><span className="font-semibold">Reason:</span> {retraction.reason}</div>
                    )}
                    {retractionDate && (
                      <div className="text-xs text-red-700"><span className="font-semibold">Retracted:</span> {retractionDate}</div>
                    )}
                    <div className="text-[10px] text-red-400 mt-1">Source: Retraction Watch</div>
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

            <div className="vj-card p-6 mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {retracted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#FFE8EC", color: "#FF3D5A" }}>Retracted</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#E8F5E9", color: "#1B5E20" }}>Active — No retractions or corrections</span>
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
              <div className="vj-card p-6 mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Published in Journal</div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <div className="font-bold text-gray-900 text-lg">{journalName || journal?.display_name}</div>
                  {isDoaj && (
                    <a
                      href={`https://doaj.org/toc/${encodeURIComponent(issn || '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: "#E8F5E9", color: "#1B5E20", border: "1px solid #2E7D32" }}
                      title="Verified open access by DOAJ"
                    >
                      <span aria-hidden>✓</span> DOAJ Open Access
                    </a>
                  )}
                </div>
                {issn && <div className="text-sm font-mono mb-4" style={{ color: "#1B5E20" }}>{issn}</div>}

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
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                    <div className="p-4 text-center">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">SCImago Quartile</div>
                      {quartile ? (
                        <div className="text-lg font-bold" style={{
                          color: quartile === "Q1" ? "#1B5E20" : quartile === "Q2" ? "#2563EB" : quartile === "Q3" ? "#D97706" : "#DC2626"
                        }}>{quartile}</div>
                      ) : (
                        <div className="text-lg font-bold text-gray-300">—</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">SCImago 2023</div>
                    </div>

                    <div className="p-4 text-center">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">CiteScore</div>
                      {scopus?.citeScore ? (
                        <>
                          <div className="text-lg font-bold text-gray-800 mb-0.5">{scopus.citeScore}</div>
                          <div className="text-xs text-gray-400 mb-2">Scopus {scopus.citeScoreYear ?? ''}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-bold text-gray-300 mb-1">—</div>
                          <div className="text-xs text-gray-400 mb-2">Scopus</div>
                        </>
                      )}
                      <a
                        href={`https://www.scopus.com/sources.uri?name=${encodeURIComponent(journalName || '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ background: "#E8F5E9", color: "#1B5E20" }}
                      >
                        Search →
                      </a>
                    </div>

                    <div className="p-4 text-center">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">2yr Citedness</div>
                      {twoYrCitedness ? (
                        <>
                          <div className="text-lg font-bold text-gray-800 mb-0.5">{twoYrCitedness}</div>
                          <div className="text-xs text-gray-400 mb-2">OpenAlex</div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-bold text-gray-300 mb-1">—</div>
                          <div className="text-xs text-gray-400 mb-2">OpenAlex</div>
                        </>
                      )}
                      <a
                        href={journal?.id || `https://openalex.org/sources?search=${encodeURIComponent(journalName || issn || '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ background: "#E8F5E9", color: "#1B5E20" }}
                      >
                        Source →
                      </a>
                    </div>

                    <div className="p-4 text-center">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">SJR Score</div>
                      {sjrScore != null ? (
                        <>
                          <div className="text-lg font-bold text-gray-800 mb-0.5">{Number(sjrScore).toFixed(3)}</div>
                          <div className="text-xs text-gray-400 mb-2">SCImago 2023</div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-bold text-gray-300 mb-1">—</div>
                          <div className="text-xs text-gray-400 mb-2">SCImago 2023</div>
                        </>
                      )}
                      <a
                        href={`https://www.scimagojr.com/journalsearch.php?q=${encodeURIComponent(issn || journalName || '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ background: "#E8F5E9", color: "#1B5E20" }}
                      >
                        SCImago →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="vj-card p-8 text-center">
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
