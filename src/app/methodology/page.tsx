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

const riskSignals = [
  { signal: 'Retraction Watch', weight: '+10', trigger: 'retraction rate ≥ 1.0% (window 2021–2023)' },
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
  under_evaluation: 'فهرسة محدودة',
  high_risk: 'مؤشرات تستدعي الحذر',
} as const

type DistributionRow = { labelAr: string; labelEn: keyof typeof distributionLabels; count: string; pct: string }

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
    ar: 'المنهجية تجريبية. لا تُستخدم لاتخاذ قرارات أكاديمية أو رسمية.',
    en: 'This methodology is in beta. Not for official academic or institutional decisions.',
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
    labelEn: s,
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
            <p dir="rtl" className="text-sm" style={{ color: '#6B7280' }}>
              هذه المنهجية في تطور مستمر — راجع التاريخ في الأسفل.
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
                      <td className="px-6 py-3 text-sm" style={{ color: '#0B4644' }}>{s.signal}</td>
                      <td className="px-6 py-3 text-sm font-bold" style={{ color: '#DC2626' }}>{s.weight}</td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#6B7280' }}>{s.trigger}</td>
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
            <SectionHeading ar="التوزيع الحالي" en="Current Distribution" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              {distribution.map((d) => (
                <div key={d.labelEn} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-3xl font-bold" style={{ color: '#05A854', lineHeight: 1.1 }}>{d.count}</div>
                  <div className="text-xs mt-1" style={{ color: '#B2BEC4' }}>{d.pct} of {total.toLocaleString()}</div>
                  <div dir="rtl" className="text-sm mt-2 font-medium" style={{ color: '#0B4644' }}>{d.labelAr}</div>
                  <div className="text-xs font-mono" style={{ color: '#6B7280' }}>{d.labelEn}</div>
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
                  <p dir="rtl" className="text-sm leading-relaxed mb-1" style={{ color: '#0B4644' }}>{lim.ar}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{lim.en}</p>
                </div>
              ))}
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
