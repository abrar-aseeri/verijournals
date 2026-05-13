import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'المنهجية | Methodology — VeriJournals',
  description: 'How VeriJournals scores journals: data sources, weights, thresholds, and limitations.',
}

const dataSources = [
  {
    nameAr: 'SCImago Journal Rank',
    nameEn: 'SCImago Journal Rank (SJR)',
    whatAr: 'مؤشر ترتيب المجلات على أساس وزن الاستشهادات. مفهرسة في Scopus.',
    whatEn: 'Citation-weighted ranking of journals indexed in Scopus.',
    matches: '61,486',
    refresh: '2023 snapshot',
    role: 'trust',
    weight: '+10',
  },
  {
    nameAr: 'NLM / PubMed',
    nameEn: 'NLM / PubMed Catalog',
    whatAr: 'قائمة المكتبة الوطنية الأمريكية للطب — مرجع المجلات الطبية المعتمد.',
    whatEn: 'US National Library of Medicine biomedical-journal catalogue.',
    matches: '14,507',
    refresh: '2026-05-11',
    role: 'trust',
    weight: '+20',
  },
  {
    nameAr: 'DOAJ',
    nameEn: 'Directory of Open Access Journals',
    whatAr: 'دليل المجلات المفتوحة المراجعة من قبل النظراء، مع التحقق من الشفافية.',
    whatEn: 'Curated list of peer-reviewed open-access journals.',
    matches: '8,645',
    refresh: '2026-05-10',
    role: 'trust',
    weight: '+20',
  },
  {
    nameAr: 'Retraction Watch',
    nameEn: 'Retraction Watch (via Crossref)',
    whatAr: 'قاعدة بيانات سحب الأوراق العلمية. تُحسب نسبة السحب لكل مجلة.',
    whatEn: 'Database of retraction notices. We compute per-journal retraction rate.',
    matches: '1,840',
    refresh: '2026-05-11 (window 2021–2023)',
    role: 'risk',
    weight: '+10',
  },
]

const trustSignals = [
  { signal: 'DOAJ Open Access', weight: '+20', url: 'https://doaj.org' },
  { signal: 'NLM / PubMed', weight: '+20', url: 'https://www.ncbi.nlm.nih.gov/nlmcatalog' },
  { signal: 'SCImago indexing', weight: '+10', url: 'https://www.scimagojr.com' },
]

type RiskSignal = {
  signal: string
  weight: string
  trigger: string
  active: boolean
  statusAr?: string
  statusEn?: string
}

const riskSignals: RiskSignal[] = [
  {
    signal: 'Retraction Watch',
    weight: '+10',
    trigger: 'retraction rate ≥ 1.0% (window 2021–2023)',
    active: true,
  },
  {
    signal: "Beall's List entry",
    weight: '+25',
    trigger: "presence in Beall's archived predatory list",
    active: false,
    statusAr: 'لم تُدمج بعد (في انتظار مصدر بيانات)',
    statusEn: 'not yet integrated (pending data source)',
  },
  {
    signal: 'Hijacked Journal',
    weight: '+30',
    trigger: 'presence in Retraction Watch Hijacked Journal Checker',
    active: false,
    statusAr: 'لم تُدمج بعد (في انتظار مصدر بيانات)',
    statusEn: 'not yet integrated (pending data source)',
  },
]

const thresholds = [
  { status: 'Multiple Positive Indicators', rule: 'trust ≥ 50 AND risk < 30' },
  { status: 'Caution Signals Present', rule: 'risk ≥ 40' },
  { status: 'Verification Recommended', rule: 'trust ≥ 30' },
  { status: 'Limited Indexing Coverage', rule: 'default' },
]

const distributionLabels = {
  trusted: 'مؤشرات إيجابية متعددة',
  review_needed: 'يُنصح بالتحقق',
  under_evaluation: 'بيانات فهرسة محدودة',
  high_risk: 'تتطلب تحققاً دقيقاً',
} as const

const distributionLabelsEnFactual: Record<keyof typeof distributionLabels, string> = {
  trusted: 'Multiple Positive Indicators',
  review_needed: 'Verification Recommended',
  under_evaluation: 'Limited Indexing Coverage',
  high_risk: 'Requires Careful Verification',
}

type DistributionRow = {
  labelAr: string
  labelEnFactual: string
  statusKey: keyof typeof distributionLabels
  count: string
  pct: string
}

const limitations = [
  {
    ar: 'غياب Scopus و WoS: التقييم الحالي يعتمد على مصادر مفتوحة فقط. لا تصل أي مجلة إلى تصنيف "مؤشرات إيجابية متعددة" بدون توفّر DOAJ + NLM + SCImago مجتمعة.',
    en: 'Scopus and Web of Science are not integrated. The current signal set is open-source only; no journal reaches "Multiple Positive Indicators" status without DOAJ + NLM + SCImago in combination.',
  },
  {
    ar: 'نافذة Retraction Watch: 2021–2023 فقط، حتى تطابق نافذة SCImago SJR في حساب نسبة السحب.',
    en: 'Retraction Watch window is 2021–2023, matched to the SCImago SJR snapshot so the retraction rate has a comparable denominator.',
  },
  {
    ar: 'دقة Crossref في استخراج ISSN: حوالي 87.5% للسجلات الحديثة، وأقل للسجلات الأقدم.',
    en: 'Crossref ISSN-resolution rate is ~87.5% on recent records and lower on older ones, so a fraction of retractions cannot be linked back to a journal.',
  },
  {
    ar: 'المجلات التي ليس لها total_docs لا يمكن حساب نسبة سحب لها — تُستثنى من إشارة Retraction Watch.',
    en: 'Journals without total_docs cannot have a retraction rate computed and are excluded from the Retraction Watch signal.',
  },
  {
    ar: 'هذه المنهجية في مرحلة التطوير التشاوري. تصلح كأداة استرشادية أوّلية لمساعدة الباحثين على فحص خيارات النشر، ولا تُغني عن المراجعة المستقلة والتقييم الأكاديمي المتخصص. القرار النهائي للنشر يبقى مسؤولية الباحث ومرجعه الأكاديمي.',
    en: 'This methodology is under iterative development. It serves as a preliminary advisory tool to assist researchers in evaluating publication venues, and does not substitute for independent expert review or specialized academic assessment. The final publication decision remains the responsibility of the researcher and their academic advisor.',
  },
]

const references = [
  { name: 'DOAJ — About', url: 'https://doaj.org/about' },
  { name: 'NLM J_Medline catalogue', url: 'https://ftp.ncbi.nlm.nih.gov/pubmed/J_Medline.txt' },
  { name: 'Retraction Watch (via Crossref)', url: 'https://gitlab.com/crossref/retraction-watch-data' },
  { name: 'SCImago Journal Rank — Help', url: 'https://www.scimagojr.com/help.php' },
  { name: 'Crossref REST API', url: 'https://api.crossref.org' },
]

const changelog = [
  { date: '2026-04-XX (v1.0 adoption)', ar: 'اعتماد الإصدار الأول للمنهجية. حدّدت الأوزان والعتبات الحالية.', en: 'Adoption of v1.0 baseline.' },
  { date: '2026-05-11', ar: 'إعادة حساب الدرجات من journal_indexing لأول مرة لـ 61,486 مجلة.', en: 'First full recompute of trust/risk scores from journal_indexing (61,486 journals).' },
  { date: '2026-05-11', ar: 'تخفيض عتبة "مؤشرات إيجابية متعددة" من 60 إلى 50 لتتناسب مع المصادر المفتوحة المتاحة.', en: '"Multiple Positive Indicators" threshold lowered from 60 → 50 to match the open-source signal ceiling.', commit: '4b87ffc' },
  { date: '2026-05-11', ar: 'استيراد Retraction Watch مع نافذة 2021–2023.', en: 'Retraction Watch windowed import (2021–2023).', commit: 'a20ff89' },
  { date: '2026-05-11', ar: 'استيراد فهرس NLM/PubMed.', en: 'NLM/PubMed catalogue imported.', commit: '2ca0da4' },
  { date: '2026-05-10', ar: 'استيراد قاعدة DOAJ.', en: 'DOAJ imported as the first open-access signal.', commit: '11bf8e1' },
]

function SectionHeading({ ar, en }: { ar: string; en: string }) {
  return (
    <div className="mb-6">
      <h2 dir="rtl" className="font-fs text-2xl font-bold mb-1" style={{ color: '#0B4644' }}>{ar}</h2>
      <div className="text-sm" style={{ color: '#6B7280' }}>{en}</div>
    </div>
  )
}

export default async function MethodologyPage() {
  const supabase = getAdmin()
  const statuses = ['trusted', 'review_needed', 'under_evaluation', 'high_risk'] as const
  const [trusted, review, under, high, lastRun] = await Promise.all([
    supabase.from('journals').select('id', { count: 'exact', head: true }).eq('trust_status', 'trusted'),
    supabase.from('journals').select('id', { count: 'exact', head: true }).eq('trust_status', 'review_needed'),
    supabase.from('journals').select('id', { count: 'exact', head: true }).eq('trust_status', 'under_evaluation'),
    supabase.from('journals').select('id', { count: 'exact', head: true }).eq('trust_status', 'high_risk'),
    supabase.from('automation_runs').select('completed_at')
      .eq('run_type', 'recompute_scores').eq('status', 'success')
      .order('completed_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const counts: Record<typeof statuses[number], number> = {
    trusted: trusted.count ?? 0,
    review_needed: review.count ?? 0,
    under_evaluation: under.count ?? 0,
    high_risk: high.count ?? 0,
  }
  const total = counts.trusted + counts.review_needed + counts.under_evaluation + counts.high_risk
  const pct = (n: number) => total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0.0%'
  const distribution: DistributionRow[] = statuses.map((s) => ({
    labelAr: distributionLabels[s],
    labelEnFactual: distributionLabelsEnFactual[s],
    statusKey: s,
    count: counts[s].toLocaleString(),
    pct: pct(counts[s]),
  }))
  const lastRefreshDate = lastRun.data?.completed_at
    ? new Date(lastRun.data.completed_at).toISOString().slice(0, 10)
    : 'unknown'

  return (
    <>
      <Navbar />
      <main style={{ background: '#F8FAFC' }} className="font-fs">

        <section className="px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 dir="rtl" className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#0B4644' }}>
              كيف نقيّم المجلات في فيريجورنالز
            </h1>
            <div className="text-base mb-4" style={{ color: '#6B7280' }}>
              How VeriJournals scores journals
            </div>
            <div
              className="inline-flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 px-4 py-2 rounded-full text-xs"
              style={{ background: '#DCFCE7', color: '#0B4644' }}
            >
              <span lang="en" className="font-semibold">Methodology v1.0 — adopted 2026-05-11</span>
              <span className="hidden sm:inline opacity-50">·</span>
              <span dir="rtl" className="font-fs font-semibold">المنهجية الإصدار 1.0 — معتمدة بتاريخ 11 مايو 2026</span>
            </div>
            <p dir="rtl" className="text-sm mt-4" style={{ color: '#6B7280' }}>
              هذه المنهجية في تطور مستمر — راجع التاريخ في الأسفل.
            </p>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-3" style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                <span dir="rtl" className="text-sm font-semibold font-fs" style={{ color: '#0B4644' }}>ملخّص حالة المصادر</span>
                <span className="text-xs ms-3" style={{ color: '#6B7280' }} lang="en">Source Freshness</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wide" style={{ color: '#B2BEC4' }}>
                    <th className="text-left px-6 py-3">
                      <span dir="rtl" className="font-fs">المصدر</span>
                      <span className="ms-2" lang="en">Source</span>
                    </th>
                    <th className="text-left px-6 py-3">
                      <span dir="rtl" className="font-fs">آخر استيراد</span>
                      <span className="ms-2" lang="en">Last Imported</span>
                    </th>
                    <th className="text-left px-6 py-3">
                      <span dir="rtl" className="font-fs">التغطية</span>
                      <span className="ms-2" lang="en">Coverage</span>
                    </th>
                    <th className="text-left px-6 py-3">
                      <span dir="rtl" className="font-fs">التحديث القادم</span>
                      <span className="ms-2" lang="en">Next Refresh</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { src: 'SCImago', last: '2023 snapshot', coverage: '61,486', next: 'annual (next: 2027)' },
                    { src: 'NLM / PubMed', last: '2026-05-11', coverage: '14,507', next: 'monthly (next: 2026-06-01)' },
                    { src: 'DOAJ', last: '2026-05-10', coverage: '8,645', next: 'monthly (next: 2026-06-01)' },
                    { src: 'Retraction Watch', last: '2026-05-11', coverage: '1,840', next: 'monthly (next: 2026-06-01)' },
                  ].map((r) => (
                    <tr key={r.src} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td className="px-6 py-3 text-sm font-semibold" style={{ color: '#0B4644' }}>{r.src}</td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#0B4644' }}>{r.last}</td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#0B4644' }}>{r.coverage}</td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#6B7280' }}>{r.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p dir="rtl" className="text-xs mt-2 font-fs" style={{ color: '#6B7280' }}>
              ملخّص حالة المصادر اعتباراً من 2026-05-11.
            </p>
            <p className="text-xs" lang="en" style={{ color: '#6B7280' }}>
              Source freshness summary as of 2026-05-11.
            </p>
          </div>
        </section>

        <section id="sources" className="px-6 pb-12 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="مصادر البيانات" en="Data Sources" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataSources.map((s) => (
                <div key={s.nameEn} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div dir="rtl" className="font-bold text-base" style={{ color: '#0B4644' }}>{s.nameAr}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.nameEn}</div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        background: s.role === 'risk' ? '#FEE2E2' : '#DCFCE7',
                        color: s.role === 'risk' ? '#DC2626' : '#05A854',
                      }}
                    >
                      {s.role === 'risk' ? 'risk' : 'trust'} {s.weight}
                    </span>
                  </div>
                  <p dir="rtl" className="text-sm leading-relaxed mb-2" style={{ color: '#0B4644' }}>{s.whatAr}</p>
                  <p className="text-xs mb-4" style={{ color: '#6B7280' }}>{s.whatEn}</p>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                    <div>
                      <div className="text-xl font-bold" style={{ color: '#05A854' }}>{s.matches}</div>
                      <div className="text-xs" style={{ color: '#B2BEC4' }}>journals matched</div>
                    </div>
                    <div className="text-xs text-right" style={{ color: '#B2BEC4' }}>{s.refresh}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="scoring" className="px-6 pb-12 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="كيف نحسب الدرجة" en="How the Score is Calculated" />

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
              <div className="px-6 py-3" style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                <span dir="rtl" className="text-sm font-semibold" style={{ color: '#0B4644' }}>إشارات الثقة (تزيد الدرجة)</span>
                <span className="text-xs ms-3" style={{ color: '#6B7280' }}>Trust signals (add to score)</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wide" style={{ color: '#B2BEC4' }}>
                    <th className="text-left px-6 py-3">Signal</th>
                    <th className="text-left px-6 py-3">Weight</th>
                    <th className="text-left px-6 py-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {trustSignals.map((s) => (
                    <tr key={s.signal} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td className="px-6 py-3 text-sm" style={{ color: '#0B4644' }}>{s.signal}</td>
                      <td className="px-6 py-3 text-sm font-bold" style={{ color: '#05A854' }}>{s.weight}</td>
                      <td className="px-6 py-3 text-sm">
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: '#0B4644' }}>
                          {s.url}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
              <div className="px-6 py-3" style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                <span dir="rtl" className="text-sm font-semibold" style={{ color: '#0B4644' }}>إشارات المخاطرة (تزيد المخاطرة)</span>
                <span className="text-xs ms-3" style={{ color: '#6B7280' }}>Risk signals (add to risk)</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wide" style={{ color: '#B2BEC4' }}>
                    <th className="text-left px-6 py-3">Signal</th>
                    <th className="text-left px-6 py-3">Weight</th>
                    <th className="text-left px-6 py-3">Trigger</th>
                  </tr>
                </thead>
                <tbody>
                  {riskSignals.map((s) => (
                    <tr key={s.signal} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td
                        className="px-6 py-3 text-sm"
                        style={{ color: s.active ? '#0B4644' : '#9CA3AF' }}
                      >
                        {s.signal}
                      </td>
                      <td
                        className="px-6 py-3 text-sm font-bold"
                        style={{ color: s.active ? '#DC2626' : '#9CA3AF' }}
                      >
                        {s.weight}
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: s.active ? '#6B7280' : '#9CA3AF' }}>
                        <div>{s.trigger}</div>
                        {!s.active && s.statusAr && (
                          <div className="mt-1 text-xs italic">
                            <span dir="rtl" className="font-fs">الحالة: {s.statusAr}</span>
                            <span className="mx-1 opacity-60">·</span>
                            <span lang="en">Status: {s.statusEn}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-3" style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                <span dir="rtl" className="text-sm font-semibold" style={{ color: '#0B4644' }}>عتبات التصنيف</span>
                <span className="text-xs ms-3" style={{ color: '#6B7280' }}>Status thresholds</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wide" style={{ color: '#B2BEC4' }}>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {thresholds.map((t) => (
                    <tr key={t.status} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td className="px-6 py-3 text-sm font-mono" style={{ color: '#0B4644' }}>{t.status}</td>
                      <td className="px-6 py-3 text-sm font-mono" style={{ color: '#6B7280' }}>{t.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="المراجعة البشرية للحالات الحرجة" en="Human Review of Caution-Level Classifications" />
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p dir="rtl" className="text-sm leading-relaxed mb-3 font-fs" style={{ color: '#0B4644' }}>
                عند تشغيل المنهجية المستقبلية مع بيانات Beall&apos;s List و Hijacked Journals، أي مجلة تصل تلقائياً إلى تصنيف &quot;تتطلب تحققاً دقيقاً&quot; ستُعرض كنتيجة مبدئية وتُحال للمراجعة البشرية قبل نشر التصنيف. حالياً لا توجد مجلات في هذا التصنيف، فهذا الإجراء يأخذ حكم البند المعطّل.
              </p>
              <p lang="en" className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                When Beall&apos;s List and Hijacked Journals data sources are integrated in future iterations, any journal automatically reaching the &quot;Requires Careful Verification&quot; classification will be displayed as a provisional result and routed for human review before public display of the classification. No journals currently occupy this category, so this safeguard is presently dormant.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="التوزيع الحالي" en="Current Distribution" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              {distribution.map((d) => (
                <div key={d.statusKey} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-3xl font-bold" style={{ color: '#05A854', lineHeight: 1.1 }}>{d.count}</div>
                  <div className="text-xs mt-1" style={{ color: '#B2BEC4' }}>{d.pct} of {total.toLocaleString()}</div>
                  <div dir="rtl" className="text-sm mt-2 font-medium font-fs" style={{ color: '#0B4644' }}>{d.labelAr}</div>
                  <div className="text-xs" lang="en" style={{ color: '#6B7280' }}>{d.labelEnFactual}</div>
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: '#B2BEC4' }}>Last refreshed {lastRefreshDate}. Refreshes monthly.</p>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="حدود المنهجية" en="Limitations" />
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {limitations.map((lim, i) => (
                <div key={i} className="px-6 py-4">
                  <p dir="rtl" className="text-sm leading-relaxed mb-1 font-fs" style={{ color: '#0B4644' }}>{lim.ar}</p>
                  <p className="text-xs leading-relaxed" lang="en" style={{ color: '#6B7280' }}>{lim.en}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
              <div className="mb-4">
                <h3 dir="rtl" className="text-base font-bold font-fs" style={{ color: '#0B4644' }}>اعتراض على البيانات أو الحساب</h3>
                <div className="text-xs" lang="en" style={{ color: '#6B7280' }}>Object to Data or Scoring</div>
              </div>
              <ul dir="rtl" className="font-fs text-sm space-y-2 mb-4" style={{ color: '#0B4644' }}>
                <li>
                  تنبيه عن تباين في بيانات مصدر معين:{' '}
                  <a
                    href="/report-discrepancy"
                    className="underline hover:opacity-80"
                    style={{ color: '#05A854' }}
                  >
                    /report-discrepancy
                  </a>
                </li>
                <li style={{ color: '#9CA3AF' }}>طلب مراجعة تصنيف مجلة: قريباً (Phase 2)</li>
                <li style={{ color: '#9CA3AF' }}>استفسار عام عن المنهجية: قيد الإعداد</li>
              </ul>
              <ul lang="en" className="text-xs space-y-2" style={{ color: '#6B7280' }}>
                <li>
                  Report a discrepancy in source data:{' '}
                  <a
                    href="/report-discrepancy"
                    className="underline hover:opacity-80"
                    style={{ color: '#05A854' }}
                  >
                    /report-discrepancy
                  </a>
                </li>
                <li style={{ color: '#9CA3AF' }}>Request classification review: coming soon (Phase 2)</li>
                <li style={{ color: '#9CA3AF' }}>General methodology inquiry: in preparation</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="تقرير التحيّز" en="Bias Audit" />
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p dir="rtl" className="text-sm leading-relaxed mb-3 font-fs" style={{ color: '#0B4644' }}>
                يُجرى أول تقرير سنوي لمراجعة التحيّز المحتمل في المنهجية (الجغرافي، اللغوي، التخصصي) في 2027-05. حتى صدور التقرير، تُراقَب الفروقات في التصنيف عبر المناطق الجغرافية واللغات يدوياً عند مراجعة عيّنات.
              </p>
              <p lang="en" className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                The first annual bias audit reviewing potential methodological bias (geographic, linguistic, disciplinary) is scheduled for May 2027. Until the audit is published, classification disparities across regions and languages are monitored manually during sample reviews.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="مَن صاغ هذه المنهجية" en="Methodology Authors" />
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p dir="rtl" className="text-sm leading-relaxed mb-3 font-fs" style={{ color: '#0B4644' }}>
                تم تطوير هذه المنهجية من قِبَل مؤسِّس المنصة، باحثة في مجال النشر العلمي ونزاهة البحث، استناداً إلى الممارسات الدولية في التحقق من الجودة العلمية، بما في ذلك معايير DOAJ و COPE و ICMJE و WAME. تخضع المنهجية للمراجعة الدورية وتُحدَّث وفق التقدم العلمي.
              </p>
              <p lang="en" className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                This methodology was developed by the platform&apos;s founder, a researcher in scientific publishing and research integrity, based on international best practices in scientific quality verification, including criteria from DOAJ, COPE, ICMJE, and WAME. The methodology is subject to periodic review and is updated as scientific understanding evolves.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="التحقق المستقل" en="Independent Verification" />
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p dir="rtl" className="text-sm leading-relaxed mb-2 font-fs" style={{ color: '#0B4644' }}>
                يمكن لأي قارئ إعادة حساب درجة مجلة باتباع الخطوات التالية:
              </p>
              <ol dir="rtl" className="font-fs text-sm leading-relaxed list-decimal pe-5 space-y-1 mb-3" style={{ color: '#0B4644' }}>
                <li>تحقق من فهرسة المجلة في DOAJ و NLM/PubMed و SCImago عبر الروابط المباشرة في قسم المراجع.</li>
                <li>اجمع الأوزان المقابلة من جدول إشارات الثقة.</li>
                <li>تحقق من معدّل سحب الأوراق العلمية للمجلة في Retraction Watch.</li>
                <li>طبّق العتبات المنشورة في جدول عتبات التصنيف.</li>
              </ol>
              <p dir="rtl" className="text-sm leading-relaxed mb-4 font-fs" style={{ color: '#0B4644' }}>
                ستحصل على نفس النتيجة التي تعرضها المنصة، مما يجعل التصنيف قابلاً للمراجعة المستقلة.
              </p>
              <p lang="en" className="text-xs leading-relaxed mb-2" style={{ color: '#6B7280' }}>
                Any reader can reproduce a journal&apos;s score by following these steps:
              </p>
              <ol lang="en" className="text-xs leading-relaxed list-decimal ps-5 space-y-1 mb-3" style={{ color: '#6B7280' }}>
                <li>Verify the journal&apos;s indexing status in DOAJ, NLM/PubMed, and SCImago via the direct links in the References section.</li>
                <li>Sum the corresponding weights from the Trust Signals table.</li>
                <li>Check the journal&apos;s retraction rate in Retraction Watch.</li>
                <li>Apply the published thresholds from the Status Thresholds table.</li>
              </ol>
              <p lang="en" className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                You will obtain the same result the platform displays, making the classification independently reproducible.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="المراجع" en="References" />
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {references.map((r) => (
                <div key={r.url} className="px-6 py-3 flex items-center justify-between gap-4">
                  <span className="text-sm" style={{ color: '#0B4644' }}>{r.name}</span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono underline hover:opacity-80 truncate" style={{ color: '#05A854' }}>
                    {r.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <SectionHeading ar="سجل التحديثات" en="Changelog" />
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {changelog.map((c, i) => (
                <div key={i} className="px-6 py-4 flex flex-col md:flex-row md:items-baseline md:gap-6">
                  <div className="text-xs font-mono mb-1 md:mb-0 flex-shrink-0" style={{ color: '#B2BEC4', minWidth: '90px' }}>{c.date}</div>
                  <div className="flex-1">
                    <p dir="rtl" className="text-sm mb-1" style={{ color: '#0B4644' }}>{c.ar}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {c.en}
                      {c.commit && <span className="font-mono ms-2" style={{ color: '#B2BEC4' }}>({c.commit})</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
