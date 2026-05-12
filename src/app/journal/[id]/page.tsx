import { getAdmin } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ErrorReportButton from './ErrorReportButton'
import DownloadPdfButton from './DownloadPdfButton'
import { estimatedImpactSignals } from '@/lib/scoring'
import { formatContributingSources, formatVerifiedDate } from '@/lib/utils'
import IndicatorCard from '@/components/IndicatorCard'

const SOURCE_DISPLAY_NAME: Record<string, string> = {
  doaj: 'DOAJ',
  nlm: 'NLM / PubMed',
  retraction_watch: 'Retraction Watch',
  openalex: 'OpenAlex',
  scimago: 'SCImago',
}

type SnapshotRow = {
  id: string
  source_name: string
  fetched_at: string
  http_status: number | null
  response_hash: string | null
  response_raw: Record<string, unknown> | null
}

function summarizeSnapshot(s: SnapshotRow): string {
  const raw = s.response_raw
  if (!raw) return '—'
  const parts: string[] = []
  if (typeof raw.import_kind === 'string') parts.push(raw.import_kind)
  if (typeof raw.file_bytes === 'number') parts.push(`${Math.round(raw.file_bytes / 1024)} KB`)
  if (typeof raw.intent === 'string') parts.push(raw.intent)
  return parts.length ? parts.join(' · ') : '—'
}

type Confidence = 'high' | 'medium' | 'low'

// Age-based confidence per Phase 3 spec: <30d fresh, 30-90d stale,
// >90d cold. Falls back to 'low' when no snapshot is available at all.
function ageDaysToConfidence(ageDays: number | null): Confidence {
  if (ageDays == null) return 'low'
  if (ageDays < 30) return 'high'
  if (ageDays <= 90) return 'medium'
  return 'low'
}

function ageDaysOf(iso: string | null | undefined): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

const SOURCE_NAMES = ['doaj', 'nlm', 'retraction_watch', 'openalex', 'scimago'] as const
type SourceName = typeof SOURCE_NAMES[number]

export default async function JournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getAdmin()

  // Parallel: journal record + latest source_snapshots row per source.
  // source_snapshots is the canonical "when did upstream Y last give us
  // data" timestamp. Falls back to journal.last_verified_at when no
  // snapshot row exists yet for that source (true today — populated only
  // once cron-triggered importers run with the Task 2 changes).
  const [{ data: journal }, ...snapshotResults] = await Promise.all([
    supabase.from('journals').select('*').eq('id', id).single(),
    ...SOURCE_NAMES.map((s) =>
      supabase.from('source_snapshots')
        .select('id, source_name, fetched_at, http_status, response_hash, response_raw')
        .eq('source_name', s)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ),
  ])

  if (!journal) notFound()

  // Build the trail (rows with actual data) and the per-source lookup table.
  const verificationTrail: SnapshotRow[] = snapshotResults
    .map((r) => r.data as SnapshotRow | null)
    .filter((r): r is SnapshotRow => r !== null)
  const sourceSnapshotAt: Record<SourceName, string | null> = Object.fromEntries(
    SOURCE_NAMES.map((s, i) => [s, (snapshotResults[i].data as { fetched_at?: string } | null)?.fetched_at ?? null])
  ) as Record<SourceName, string | null>

  // Admin gate for the "raw payload" expander in the Verification Trail.
  const sessionClient = await createSupabaseServer()
  const { data: { user: viewer } } = await sessionClient.auth.getUser()
  let viewerIsAdmin = false
  if (viewer) {
    const { data: viewerProfile } = await sessionClient
      .from('users')
      .select('role')
      .eq('auth_id', viewer.id)
      .maybeSingle()
    viewerIsAdmin = viewerProfile?.role === 'admin'
  }

  // Per-indicator helpers: pick the source's snapshot ISO; fall back to
  // the journal-level last_verified_at. For derived indicators
  // (trust/risk score) take the FRESHEST of the three indexing-source
  // snapshots (doaj / nlm / retraction_watch / scimago) since the
  // derived value is only as fresh as the youngest input that fed it.
  function snapshotIsoFor(source: SourceName): string | null {
    return sourceSnapshotAt[source] ?? journal.last_verified_at ?? null
  }
  function derivedSnapshotIso(): string | null {
    const candidates = (['doaj', 'nlm', 'retraction_watch', 'scimago'] as SourceName[])
      .map((s) => sourceSnapshotAt[s])
      .filter((v): v is string => !!v)
    if (candidates.length === 0) return journal.last_verified_at ?? null
    return candidates.reduce((a, b) => (a > b ? a : b))
  }
  function formatIso(iso: string | null): string {
    return iso ? new Date(iso).toISOString().slice(0, 10) : '—'
  }

  const isPredatory = journal.is_predatory === true
  const trustColor = isPredatory ? '#DC2626' :
                     journal.trust_status === 'trusted' ? '#05A854' :
                     journal.trust_status === 'high_risk' ? '#DC2626' : '#FFB020'
  const trustBg = isPredatory ? '#FEE2E2' :
                  journal.trust_status === 'trusted' ? '#DCFCE7' :
                  journal.trust_status === 'high_risk' ? '#FEE2E2' : '#FEF3C7'
  const trustLabel = isPredatory ? 'Journal Requires Careful Verification' :
                     journal.trust_status === 'trusted' ? 'Multiple Positive Indicators' :
                     journal.trust_status === 'high_risk' ? 'Caution Signals Present' :
                     journal.trust_status === 'review_needed' ? 'Verification Recommended' :
                     'Limited Indexing Coverage'

  const quartileColor = (q: string | null) => {
    if (!q) return { bg: '#F3F4F6', text: '#6B7280' }
    if (q === 'Q1') return { bg: '#DCFCE7', text: '#05A854' }
    if (q === 'Q2') return { bg: '#DBEAFE', text: '#1D4ED8' }
    if (q === 'Q3') return { bg: '#FEF3C7', text: '#92400E' }
    return { bg: '#FFE8EC', text: '#BE123C' }
  }
  const qc = quartileColor(journal.quartile)

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/search" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
            ← Back to Search
          </Link>
          <DownloadPdfButton
            title={journal.title}
            issn={journal.issn}
            quartile={journal.quartile}
            trustScore={journal.trust_score}
            lastVerifiedAt={journal.last_verified_at}
          />
        </div>

        {isPredatory && (
          <div className="mb-4 p-4 rounded-xl border-2 flex items-start gap-3" style={{ background: '#FFF1F2', borderColor: '#FF3D5A' }}>
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-red-700 text-sm mb-1">JOURNAL REQUIRES CAREFUL VERIFICATION · مجلة تتطلب تحققاً دقيقاً</div>
              <div className="text-sm text-red-600">This journal appears on one or more third-party watchlists maintained outside VeriJournals (e.g. Beall&apos;s List, Hijacked Journals). Please verify the journal&apos;s legitimacy through your institution and independent sources before submitting.</div>
              <div className="text-sm text-red-600 mt-1" dir="rtl">هذه المجلة مدرجة في قائمة أو أكثر من قوائم المراقبة الخارجية. يُرجى التحقق من شرعيتها عبر مؤسستك ومصادر مستقلة قبل التقديم.</div>
              <Link href="/methodology#scoring" className="text-xs underline hover:opacity-80 mt-2 inline-block" style={{ color: '#0B4644' }}>
                What does this mean? · See methodology
              </Link>
            </div>
          </div>
        )}
        
        <div className="vj-card p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{journal.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {journal.issn && <span className="font-mono font-semibold" style={{ color: '#05A854' }}>{journal.issn}</span>}
                {journal.publisher && <span>{journal.publisher}</span>}
                {journal.country && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{journal.country}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <Link
                href="/methodology#scoring"
                title="What does this mean? · ما المقصود؟ — See methodology"
                className="px-4 py-1.5 rounded-full text-sm font-semibold flex-shrink-0 inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                style={{ background: trustBg, color: trustColor }}
              >
                {trustLabel}
                <span className="text-xs opacity-70" aria-hidden>ⓘ</span>
              </Link>
              {journal.quartile && (
                <span className="px-3 py-1 rounded-full text-sm font-bold flex-shrink-0"
                  style={{ background: qc.bg, color: qc.text }}>
                  SCImago {journal.quartile}
                </span>
              )}
              {(() => {
                const sources = formatContributingSources(journal.trust_reasons, journal.risk_reasons)
                return (
                  <div className="text-xs flex flex-col items-end gap-0.5 mt-1" style={{ color: '#6B7280' }}>
                    <div>Last verified: {formatVerifiedDate(journal.last_verified_at)}</div>
                    <Link
                      href="/methodology#sources"
                      title="Source citations · See methodology"
                      className="underline hover:opacity-80"
                      style={{ color: '#0B4644' }}
                    >
                      {sources.length > 0 ? `Sources: ${sources.join(', ')}` : 'Sources: not yet indexed'}
                    </Link>
                  </div>
                )
              })()}
            </div>
          </div>
          
          {(() => {
            const impact = estimatedImpactSignals(journal)
            const openalexIso = snapshotIsoFor('openalex')
            const scimagoIso = snapshotIsoFor('scimago')
            const derivedIso = derivedSnapshotIso()
            return (
              <>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>
                  Core indicators
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                  <IndicatorCard
                    label="Trust score / درجة الثقة"
                    value={`${journal.trust_score ?? 0} / 100`}
                    source="VeriJournals (derived from indexing)"
                    sourceUrl="/methodology#scoring"
                    snapshotAt={formatIso(derivedIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(derivedIso))}
                    journalId={journal.id}
                    indicatorKey="trust_score"
                  />
                  <IndicatorCard
                    label="Risk score / درجة المخاطرة"
                    value={`${journal.risk_score ?? 0} / 100`}
                    source="VeriJournals (derived from indexing)"
                    sourceUrl="/methodology#scoring"
                    snapshotAt={formatIso(derivedIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(derivedIso))}
                    journalId={journal.id}
                    indicatorKey="risk_score"
                  />
                  <IndicatorCard
                    label="H-index / مؤشر هيرش"
                    value={journal.h_index ?? '—'}
                    source="OpenAlex"
                    sourceUrl="https://api.openalex.org/"
                    snapshotAt={formatIso(openalexIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(openalexIso))}
                    journalId={journal.id}
                    indicatorKey="h_index"
                  />
                  <IndicatorCard
                    label="Total citations / إجمالي الاستشهادات"
                    value={journal.total_cites ? journal.total_cites.toLocaleString() : '—'}
                    source="OpenAlex (all time)"
                    sourceUrl="https://api.openalex.org/"
                    snapshotAt={formatIso(openalexIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(openalexIso))}
                    journalId={journal.id}
                    indicatorKey="total_cites"
                  />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>
                    Open-source impact indicators
                  </div>
                  <span className="text-xs font-fs" style={{ color: '#92400E' }} dir="rtl">
                    {impact.disclaimer}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <IndicatorCard
                    label="SCImago quartile / رُبع SCImago"
                    value={journal.quartile ?? '—'}
                    source="SCImago Journal Rank"
                    sourceUrl="https://www.scimagojr.com/"
                    snapshotAt={formatIso(scimagoIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(scimagoIso))}
                    journalId={journal.id}
                    indicatorKey="quartile"
                  />
                  <IndicatorCard
                    label="SJR score / نقاط SJR"
                    value={impact.sjr != null ? impact.sjr.toFixed(3) : '—'}
                    source="SCImago Journal Rank"
                    sourceUrl="https://www.scimagojr.com/"
                    snapshotAt={formatIso(scimagoIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(scimagoIso))}
                    journalId={journal.id}
                    indicatorKey="sjr_score"
                  />
                  <IndicatorCard
                    label="2-yr mean citedness / متوسط الاستشهاد لسنتين"
                    value={impact.citedness_2y != null ? impact.citedness_2y.toFixed(2) : '—'}
                    source="OpenAlex summary_stats"
                    sourceUrl="https://api.openalex.org/"
                    snapshotAt={formatIso(openalexIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(openalexIso))}
                    journalId={journal.id}
                    indicatorKey="citedness_2y"
                  />
                </div>

                <div className="rounded-xl border border-gray-100 p-4 text-sm" style={{ background: '#F8FAFC', color: '#6B7280' }}>
                  <div dir="rtl" className="font-fs mb-1" style={{ color: '#0B4644' }}>
                    مؤشرات تتطلب اشتراكاً مؤسسياً
                  </div>
                  <div className="text-xs">
                    Impact Factor (Clarivate JCR), CiteScore (Scopus), and JCI (Web of Science) require licensed
                    institutional access and are not currently integrated into VeriJournals. See <Link href="/methodology#sources" className="underline hover:opacity-80" style={{ color: '#0B4644' }}>methodology</Link> for the open sources we use today.
                  </div>
                </div>
              </>
            )
          })()}
        </div>

        <div className="vj-card p-6 mb-4">
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

        <div className="vj-card p-6 mb-4">
          <h2 className="text-sm font-semibold mb-1" style={{ color: '#0B4644' }} dir="rtl">
            مسار التحقق
          </h2>
          <div className="text-xs mb-3" style={{ color: '#6B7280' }}>
            Verification Trail · upstream snapshots that contributed to this journal&apos;s record. Append-only evidence: each row is the source response we processed on a given date.
          </div>
          {verificationTrail.length === 0 ? (
            <div className="text-xs italic" style={{ color: '#B2BEC4' }}>
              No source snapshots recorded yet. The first scheduled cron run (1st of next month) will begin populating this trail.
              <br />
              <span dir="rtl">لم تُسجَّل أي لقطة مصدر بعد. ستبدأ التعبئة في أول تشغيل دوري للمصادر.</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {verificationTrail.map((s) => (
                <div key={s.id} className="py-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-baseline gap-3">
                      <span className="font-semibold text-sm" style={{ color: '#0B4644' }}>
                        {SOURCE_DISPLAY_NAME[s.source_name] ?? s.source_name}
                      </span>
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        {new Date(s.fetched_at).toISOString().slice(0, 19).replace('T', ' ')} UTC
                      </span>
                      {s.http_status != null && (
                        <span className="text-xs" style={{ color: '#B2BEC4' }}>HTTP {s.http_status}</span>
                      )}
                    </div>
                    {s.response_hash && (
                      <code className="text-[10px]" style={{ color: '#B2BEC4' }}>
                        sha256: {s.response_hash.slice(0, 12)}…
                      </code>
                    )}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                    {summarizeSnapshot(s)}
                  </div>
                  {viewerIsAdmin && s.response_raw && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer hover:underline" style={{ color: '#0B4644' }}>
                        Show raw payload (admin)
                      </summary>
                      <pre className="mt-2 text-[10px] overflow-x-auto rounded p-2" style={{ background: '#F8FAFC', color: '#0B4644', maxHeight: '320px' }}>
{JSON.stringify(s.response_raw, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="report-error" className="vj-card p-6 scroll-mt-20">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Found an error?</h2>
          <p className="text-sm text-gray-500 mb-4">Help us improve data accuracy by reporting incorrect information. Mention the specific indicator in the description so we can route the report.</p>
          <ErrorReportButton journalId={journal.id} journalTitle={journal.title} />
        </div>
      </main>
      <Footer />
    </>
  )
}
