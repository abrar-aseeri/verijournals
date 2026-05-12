import { getAdmin } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ErrorReportButton from './ErrorReportButton'
import DownloadPdfButton from './DownloadPdfButton'
import { estimatedImpactSignals } from '@/lib/scoring'
import { formatContributingSources, formatVerifiedDate, getTrustLabel } from '@/lib/utils'
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

// Parse the structured fields out of the notes string written by
// scripts/import-retraction-watch.mjs:
//   "Retraction Watch: 12 retractions (rate 1.23%); latest 2024-03-15"
function parseRetractionNotes(notes: string | null | undefined): {
  count: number | null; rate: number | null; latest: string | null
} {
  if (!notes) return { count: null, rate: null, latest: null }
  const m1 = notes.match(/(\d+)\s+retractions?/i)
  const m2 = notes.match(/rate\s+([\d.]+)\s*%/i)
  const m3 = notes.match(/latest\s+(\d{4}-\d{2}-\d{2})/i)
  return {
    count: m1 ? parseInt(m1[1], 10) : null,
    rate: m2 ? parseFloat(m2[1]) : null,
    latest: m3 ? m3[1] : null,
  }
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

// Positive open-source indexes surfaced in the "Indexing Indicators" section.
// Retraction Watch is intentionally excluded — it's a retraction tracker,
// not an indexing index, and gets its own "Retraction Activity" section.
const INDEXING_SOURCES = [
  { key: 'doaj', en: 'DOAJ Open Access', ar: 'DOAJ — وصول مفتوح' },
  { key: 'nlm', en: 'NLM / PubMed Catalog', ar: 'NLM / PubMed' },
  { key: 'scimago', en: 'SCImago Journal Rank', ar: 'SCImago' },
] as const

// Defensive-interpretation copy. One block per trust_status; predatory
// overrides separately. Per "What this does NOT mean" doctrine — the
// principle is constant (read in favor of the journal); the wording
// varies per category.
const NEGATIVE_INTERPRETATIONS: Record<string, { en: string; ar: string }> = {
  trusted: {
    en: "This badge means multiple recognized open-source indexes list the journal. It does NOT certify that every published article is methodologically sound or free of errors. Individual article assessment remains the reader's responsibility.",
    ar: 'تعني هذه التسمية أن المجلة مدرجة في عدة فهارس مفتوحة معترف بها. لا تشهد بأن كل مقالة منشورة هنا منهجياً سليمة أو خالية من الأخطاء. تقييم المقالات الفردية يبقى مسؤولية القارئ.',
  },
  review_needed: {
    en: "This means the journal appears in some but not all of our reference indexes. It does NOT mean the journal is illegitimate or low quality — our open-source coverage is incomplete for this journal.",
    ar: 'يعني هذا أن المجلة تظهر في بعض فهارسنا المرجعية وليس كلها. لا يعني هذا أن المجلة غير شرعية أو منخفضة الجودة — تغطية مصادرنا المفتوحة غير مكتملة لهذه المجلة.',
  },
  under_evaluation: {
    en: 'Limited coverage means we have not yet found this journal in our open-source indexes. It does NOT mean the journal is unreliable — niche, regional, or new journals are commonly absent from major open indexes.',
    ar: 'تعني التغطية المحدودة أننا لم نعثر بعد على هذه المجلة في فهارسنا المفتوحة. لا يعني هذا أن المجلة غير موثوقة — المجلات المتخصصة أو الإقليمية أو الجديدة غالباً ما لا تظهر في الفهارس المفتوحة الرئيسية.',
  },
  high_risk: {
    en: "This badge indicates third-party watchlists have flagged the journal. It does NOT mean every article is fraudulent or that the publisher has any specific misconduct. It signals that verification through institutional channels is recommended before submitting.",
    ar: 'تشير هذه التسمية إلى أن قوائم مراقبة خارجية قد رصدت المجلة. لا يعني هذا أن كل مقالة احتيالية أو أن الناشر قد ارتكب أي سوء تصرف محدد. يشير إلى ضرورة التحقق عبر القنوات المؤسسية قبل التقديم.',
  },
}

const PREDATORY_INTERPRETATION = {
  en: "Inclusion on a third-party predatory or hijacked-journal list is the conclusion of those list maintainers, not VeriJournals. It does NOT prove the journal is currently or always operating as listed. Some journals successfully appeal and are removed from such lists.",
  ar: 'إدراج المجلة في قوائم خارجية للمجلات المفترسة أو المختطفة هو استنتاج قائمي تلك القوائم، لا VeriJournals. لا يثبت أن المجلة تعمل حالياً أو دائماً وفق ما هو مدرج. بعض المجلات تطعن في هذه الإدراجات بنجاح وتُحذف منها.',
}

const RECOMMENDATIONS: Array<{ en: string; ar: string }> = [
  { en: "Verify the journal's official website and ISSN at https://portal.issn.org", ar: 'تحقق من الموقع الرسمي للمجلة والـ ISSN عبر https://portal.issn.org' },
  { en: 'Cross-reference the journal in Crossref (crossref.org) and NCBI PubMed (pubmed.ncbi.nlm.nih.gov)', ar: 'راجع المجلة في Crossref وموقع NCBI PubMed' },
  { en: "Ask your institution's library or research office for guidance", ar: 'استشر مكتبة مؤسستك أو مكتب البحث' },
  { en: 'Review recent articles in the journal for peer-review quality signals', ar: 'اطلع على المقالات الحديثة في المجلة لتقييم جودة المراجعة' },
]

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

  // Parallel: all journal_indexing rows for this journal (drives both
  // the "Indexing Indicators" section and the Retraction Activity section)
  // and the auth session for the admin-gated trail expander.
  const [allIndexingResult, sessionClient] = await Promise.all([
    supabase.from('journal_indexing')
      .select('source, in_source, last_verified_at, notes, source_url')
      .eq('journal_id', id),
    createSupabaseServer(),
  ])
  const allIndexing: Array<{
    source: string
    in_source: string | null
    last_verified_at: string | null
    notes: string | null
    source_url: string | null
  }> = allIndexingResult.data ?? []
  const rwIndexing = allIndexing.find((r) => r.source === 'retraction_watch' && r.in_source === 'yes') ?? null
  const hasRetractions = !!rwIndexing
  const rwData = parseRetractionNotes(rwIndexing?.notes)

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
  // Per-status color/background. Spec-mandated palette:
  //   trusted          → green  #05A854
  //   review_needed    → blue   #3B82F6
  //   under_evaluation → gray   #B2BEC4
  //   high_risk        → amber  #F59E0B
  //   predatory        → amber  #F59E0B (same family as high_risk)
  // No red on the journal page (#DC2626 reserved for system errors).
  const trustColor = isPredatory ? '#F59E0B' :
                     journal.trust_status === 'trusted' ? '#05A854' :
                     journal.trust_status === 'high_risk' ? '#F59E0B' :
                     journal.trust_status === 'review_needed' ? '#3B82F6' :
                     '#0B4644'  // under_evaluation: dark on grey bg
  const trustBg = isPredatory ? '#FEF3C7' :
                  journal.trust_status === 'trusted' ? '#DCFCE7' :
                  journal.trust_status === 'high_risk' ? '#FEF3C7' :
                  journal.trust_status === 'review_needed' ? '#DBEAFE' :
                  '#F3F4F6'  // under_evaluation
  const statusKey = isPredatory ? 'predatory' : (journal.trust_status as string)
  const trustLabelEn = getTrustLabel(statusKey, 'en')
  const trustLabelAr = getTrustLabel(statusKey, 'ar')

  const quartileColor = (q: string | null) => {
    if (!q) return { bg: '#F3F4F6', text: '#6B7280' }
    if (q === 'Q1') return { bg: '#DCFCE7', text: '#05A854' }
    if (q === 'Q2') return { bg: '#DBEAFE', text: '#1D4ED8' }
    if (q === 'Q3') return { bg: '#FEF3C7', text: '#92400E' }
    // Q4: spec palette has no red; use grey ("limited data" semantic).
    return { bg: '#F3F4F6', text: '#6B7280' }
  }
  const qc = quartileColor(journal.quartile)

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/search" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
            <span aria-hidden>←</span>
            <span dir="rtl" className="font-fs">العودة إلى البحث</span>
            <span className="opacity-60">·</span>
            <span lang="en">Back to Search</span>
          </Link>
          <DownloadPdfButton
            title={journal.title}
            issn={journal.issn}
            quartile={journal.quartile}
            trustScore={journal.trust_score}
            lastVerifiedAt={journal.last_verified_at}
          />
        </div>

        {isPredatory && !hasRetractions && (
          <div className="mb-4 p-4 rounded-xl border-2 flex items-start gap-3" style={{ background: '#FFFBEB', borderColor: '#F59E0B' }}>
            <span className="text-2xl">ℹ️</span>
            <div>
              <div className="font-bold text-sm mb-1" style={{ color: '#92400E' }}>REQUIRES CAREFUL VERIFICATION · تتطلب تحققاً دقيقاً</div>
              <div className="text-sm" style={{ color: '#92400E' }}>This journal appears on one or more third-party watchlists maintained outside VeriJournals (e.g. Beall&apos;s List, Hijacked Journals). Please verify the journal&apos;s legitimacy through your institution and independent sources before submitting.</div>
              <div dir="rtl" className="text-sm mt-1 font-fs" style={{ color: '#92400E' }}>هذه المجلة مدرجة في قائمة أو أكثر من قوائم المراقبة الخارجية. يُرجى التحقق من شرعيتها عبر مؤسستك ومصادر مستقلة قبل التقديم.</div>
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
                className="px-4 py-2 rounded-2xl text-sm font-semibold flex-shrink-0 inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                style={{ background: trustBg, color: trustColor }}
              >
                <div className="flex flex-col items-end leading-tight">
                  <span dir="rtl" className="font-fs">{trustLabelAr}</span>
                  <span lang="en" className="text-[10px] opacity-75 uppercase tracking-wide">{trustLabelEn}</span>
                </div>
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
                    <div>
                      <span dir="rtl" className="font-fs">آخر تحقق</span>
                      <span className="opacity-60 mx-1">·</span>
                      <span lang="en">Last verified:</span>{' '}{formatVerifiedDate(journal.last_verified_at)}
                    </div>
                    <Link
                      href="/methodology#sources"
                      title="Source citations · See methodology"
                      className="underline hover:opacity-80"
                      style={{ color: '#0B4644' }}
                    >
                      <span dir="rtl" className="font-fs">المصادر</span>
                      <span className="opacity-60 mx-1">·</span>
                      <span lang="en">{sources.length > 0 ? `Sources: ${sources.join(', ')}` : 'Sources: not yet indexed'}</span>
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
            return (
              <>
                <div className="mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6B7280' }}>
                    Indexing Indicators · <span className="font-fs normal-case" dir="rtl">مؤشرات الفهرسة</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {INDEXING_SOURCES.map((s) => {
                      const row = allIndexing.find((r) => r.source === s.key)
                      const present = row?.in_source === 'yes'
                      return (
                        <div
                          key={s.key}
                          className="flex items-center justify-between rounded-md px-3 py-2"
                          style={{ background: '#F8FAFC', border: '1px solid rgba(178, 190, 196, 0.4)' }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              aria-hidden
                              className="text-sm flex-shrink-0"
                              style={{ color: present ? '#05A854' : '#B2BEC4' }}
                            >
                              {present ? '✓' : '○'}
                            </span>
                            <span className="text-xs truncate" style={{ color: '#0B4644' }}>{s.en}</span>
                          </div>
                          <span className="text-[10px] flex-shrink-0" style={{ color: '#B2BEC4' }}>
                            {row?.last_verified_at ? formatIso(row.last_verified_at) : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>
                    Performance Indicators · <span className="font-fs normal-case" dir="rtl">مؤشرات الأداء</span>
                  </h3>
                  <span className="text-xs font-fs" style={{ color: '#92400E' }} dir="rtl">
                    {impact.disclaimer}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <IndicatorCard
                    label="H-index / مؤشر هيرش"
                    value={journal.h_index ?? '—'}
                    source="OpenAlex"
                    sourceUrl="https://api.openalex.org/"
                    license="CC0"
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
                    license="CC0"
                    snapshotAt={formatIso(openalexIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(openalexIso))}
                    journalId={journal.id}
                    indicatorKey="total_cites"
                  />
                  <IndicatorCard
                    label="2-yr mean citedness / متوسط الاستشهاد لسنتين"
                    value={impact.citedness_2y != null ? impact.citedness_2y.toFixed(2) : '—'}
                    source="OpenAlex summary_stats"
                    sourceUrl="https://api.openalex.org/"
                    license="CC0"
                    snapshotAt={impact.citedness_2y_year ? `${impact.citedness_2y_year}` : formatIso(openalexIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(openalexIso))}
                    journalId={journal.id}
                    indicatorKey="citedness_2y"
                  />
                  <IndicatorCard
                    label="SCImago quartile / رُبع SCImago"
                    value={journal.quartile ?? '—'}
                    source="SCImago Journal Rank"
                    sourceUrl="https://www.scimagojr.com/"
                    license="Non-commercial w/ attribution"
                    snapshotAt={journal.sjr_year ? `SJR ${journal.sjr_year}` : formatIso(scimagoIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(scimagoIso))}
                    journalId={journal.id}
                    indicatorKey="quartile"
                  />
                  <IndicatorCard
                    label="SJR score / نقاط SJR"
                    value={impact.sjr != null ? impact.sjr.toFixed(3) : '—'}
                    source="SCImago Journal Rank"
                    sourceUrl="https://www.scimagojr.com/"
                    license="Non-commercial w/ attribution"
                    snapshotAt={impact.sjr_year ? `SJR ${impact.sjr_year}` : formatIso(scimagoIso)}
                    confidence={ageDaysToConfidence(ageDaysOf(scimagoIso))}
                    journalId={journal.id}
                    indicatorKey="sjr_score"
                  />
                </div>

                {hasRetractions && (
                  <div className="mb-5 rounded-xl bg-white p-5" style={{ border: '1px solid rgba(178, 190, 196, 0.4)' }}>
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold font-fs" dir="rtl" style={{ color: '#0B4644' }}>
                        نشاط السحب (Retraction Watch)
                      </h3>
                      <div className="text-xs mt-0.5" style={{ color: '#B2BEC4' }}>
                        Retraction Activity (Retraction Watch)
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(178, 190, 196, 0.3)' }}>
                      <div>
                        <div className="text-2xl font-bold leading-tight" style={{ color: '#0B4644' }}>
                          {rwData.count ?? '—'}
                        </div>
                        <div dir="rtl" className="text-xs mt-1 font-fs" style={{ color: '#0B4644' }}>
                          عمليات سحب
                        </div>
                        <div className="text-xs" style={{ color: '#B2BEC4' }}>retractions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold leading-tight" style={{ color: '#0B4644' }}>
                          {journal.total_docs != null ? journal.total_docs.toLocaleString() : '—'}
                        </div>
                        <div dir="rtl" className="text-xs mt-1 font-fs" style={{ color: '#0B4644' }}>
                          مقالات إجمالية
                        </div>
                        <div className="text-xs" style={{ color: '#B2BEC4' }}>total articles</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold leading-tight" style={{ color: '#0B4644' }}>
                          {rwData.rate != null ? `${rwData.rate.toFixed(2)}%` : '—'}
                        </div>
                        <div dir="rtl" className="text-xs mt-1 font-fs" style={{ color: '#0B4644' }}>
                          المعدل
                        </div>
                        <div className="text-xs" style={{ color: '#B2BEC4' }}>rate</div>
                      </div>
                    </div>

                    <dl className="text-xs mb-4 space-y-1" style={{ color: '#0B4644' }}>
                      <div className="flex flex-wrap items-baseline gap-x-3" dir="rtl">
                        <dt className="font-fs" style={{ color: '#B2BEC4' }}>المعدل المعتاد في الصناعة:</dt>
                        <dd className="font-fs" style={{ color: '#0B4644' }}>0.02-0.10%</dd>
                        <span className="text-[10px]" style={{ color: '#B2BEC4' }} lang="en">Industry typical: 0.02-0.10%</span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-3" dir="rtl">
                        <dt className="font-fs" style={{ color: '#B2BEC4' }}>عتبة المراجعة لدينا:</dt>
                        <dd className="font-fs" style={{ color: '#0B4644' }}>1.0%</dd>
                        <span className="text-[10px]" style={{ color: '#B2BEC4' }} lang="en">Our review threshold: 1.0%</span>
                      </div>
                    </dl>

                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
                      <a
                        href={`https://retractionwatch.com/?s=${encodeURIComponent(journal.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold underline hover:opacity-80"
                        style={{ color: '#0B4644' }}
                      >
                        View on Retraction Watch → · عرض في Retraction Watch ←
                      </a>
                      {rwIndexing?.last_verified_at && (
                        <span className="text-xs" style={{ color: '#B2BEC4' }}>
                          Last updated: {formatIso(rwIndexing.last_verified_at)}
                        </span>
                      )}
                    </div>

                    <div className="rounded-lg p-3 mb-4 text-xs space-y-3" style={{ background: '#F8FAFC' }}>
                      <div>
                        <p dir="rtl" className="font-fs mb-1" style={{ color: '#0B4644' }}>
                          ℹ️ قد تعكس المعدلات المرتفعة مراجعة تحريرية صارمة، أو تصحيحات بعد النشر، أو مشكلات في مقالات بعينها. لا يدلّ ذلك على سوء سلوك مؤسسي.
                        </p>
                        <p lang="en" style={{ color: '#6B7280' }}>
                          ℹ️ Elevated rates may reflect rigorous editorial review, post-publication corrections, or issues with specific articles. Does not imply institutional misconduct.
                        </p>
                      </div>
                      <div>
                        <p dir="rtl" className="font-fs mb-1" style={{ color: '#0B4644' }}>
                          نعرض هذه البيانات بشكل وقائعي. لا نُفسّر أسباب السحب الفردية. على الباحثين التحقق من سياق السحب مباشرة عبر Retraction Watch.
                        </p>
                        <p lang="en" style={{ color: '#B2BEC4' }}>
                          We display this data factually. We do not interpret individual retraction reasons. Researchers should verify retraction context directly with Retraction Watch.
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/report-discrepancy?journal=${journal.id}&indicator=retraction_count`}
                      className="inline-block text-xs underline hover:opacity-80"
                      style={{ color: '#0B4644' }}
                    >
                      Journal editor/publisher: Request review → · للمحرر/الناشر: طلب مراجعة ←
                    </Link>
                  </div>
                )}

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
          <h2 className="text-sm font-semibold mb-1" dir="rtl" style={{ color: '#0B4644' }}>
            تفاصيل المجلة
          </h2>
          <div className="text-xs uppercase tracking-wide mb-4" style={{ color: '#6B7280' }} lang="en">
            Journal Details
          </div>
          <div className="grid grid-cols-2 gap-3">
            {journal.open_access && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#DCFCE7' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#05A854' }}/>
                <span className="text-sm font-medium font-fs" dir="rtl" style={{ color: '#05A854' }}>وصول مفتوح</span>
                <span className="text-xs" style={{ color: '#05A854' }} lang="en">· Open Access</span>
              </div>
            )}
            {journal.language && (
              <div className="p-3 rounded-lg" style={{ background: '#F8FAFC' }}>
                <div className="text-xs mb-0.5" style={{ color: '#6B7280' }}>
                  <span dir="rtl" className="font-fs">اللغة</span>
                  <span className="opacity-60 mx-1">·</span>
                  <span lang="en">Language</span>
                </div>
                <span className="text-sm font-medium" style={{ color: '#0B4644' }}>{journal.language}</span>
              </div>
            )}
          </div>
        </div>

        {(() => {
          const interpretation = isPredatory
            ? PREDATORY_INTERPRETATION
            : NEGATIVE_INTERPRETATIONS[journal.trust_status as keyof typeof NEGATIVE_INTERPRETATIONS]
          if (!interpretation) return null
          return (
            <div className="vj-card p-6 mb-4">
              <h2 className="text-sm font-semibold mb-3" dir="rtl" style={{ color: '#0B4644' }}>
                ما لا يعنيه هذا التصنيف
              </h2>
              <div className="text-xs mb-3" style={{ color: '#6B7280' }} lang="en">
                What this status does NOT mean
              </div>
              <p dir="rtl" className="text-sm leading-relaxed font-fs mb-3" style={{ color: '#0B4644' }}>
                {interpretation.ar}
              </p>
              <p lang="en" className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                {interpretation.en}
              </p>
            </div>
          )
        })()}

        <div className="vj-card p-6 mb-4">
          <h2 className="text-sm font-semibold mb-3" dir="rtl" style={{ color: '#0B4644' }}>
            توصيات للتحقق المستقل
          </h2>
          <div className="text-xs mb-3" style={{ color: '#6B7280' }} lang="en">
            Recommendations for independent verification
          </div>
          <ul className="space-y-3">
            {RECOMMENDATIONS.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span aria-hidden style={{ color: '#05A854' }} className="flex-shrink-0 mt-0.5">▸</span>
                <div className="flex-1 min-w-0">
                  <div dir="rtl" className="text-sm font-fs" style={{ color: '#0B4644' }}>{rec.ar}</div>
                  <div lang="en" className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{rec.en}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <p dir="rtl" className="text-sm font-fs mb-1" style={{ color: '#92400E' }}>
            البيانات المعروضة للمرجع فقط. ليست مصدراً رسمياً معتمداً.
          </p>
          <p className="text-xs" style={{ color: '#92400E' }} lang="en">
            Data shown is for reference only. Not an official certified source.
          </p>
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
          <h2 className="text-sm font-semibold mb-1" dir="rtl" style={{ color: '#0B4644' }}>
            تصحيح بيانات أو طلب مراجعة
          </h2>
          <div className="text-xs mb-3" style={{ color: '#6B7280' }} lang="en">
            Data correction or appeal
          </div>
          <p dir="rtl" className="text-sm font-fs mb-1" style={{ color: '#0B4644' }}>
            ساعدنا في تحسين دقة البيانات. اذكر المؤشر المعني في الوصف لتوجيه التقرير بسرعة.
          </p>
          <p className="text-xs mb-4" style={{ color: '#6B7280' }} lang="en">
            Help us improve data accuracy. Mention the specific indicator in the description so we can route the report. For structured per-indicator reports, use the &quot;Data correction&quot; link beside any indicator above.
          </p>
          <ErrorReportButton journalId={journal.id} journalTitle={journal.title} />
        </div>
      </main>
      <Footer />
    </>
  )
}
