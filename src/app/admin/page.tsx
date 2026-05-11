import { getAdmin } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'
import { BookOpen, Users, Search, AlertTriangle, LogIn } from 'lucide-react'
import SignOutButton from './SignOutButton'

export const dynamic = 'force-dynamic'

const FRESHNESS_TYPES = [
  { type: 'import_doaj', label: 'DOAJ' },
  { type: 'import_nlm', label: 'NLM' },
  { type: 'import_retraction_watch', label: 'Retraction Watch' },
  { type: 'enrich_openalex', label: 'OpenAlex' },
  { type: 'recompute_scores', label: 'Score recompute' },
] as const

const STALE_DAY_THRESHOLD = 35

export default async function AdminPage() {
  const supabase = getAdmin()
  const session = await createSupabaseServer()
  const { data: { user } } = await session.auth.getUser()

  const [
    { count: journalsCount },
    { count: usersCount },
    { count: searchesCount },
    { count: reportsCount },
    { data: authList },
    { data: recentSearches },
    { data: recentReports },
    ...freshnessResults
  ] = await Promise.all([
    supabase.from('journals').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('search_logs').select('*', { count: 'exact', head: true }),
    supabase.from('error_reports').select('*', { count: 'exact', head: true }),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('search_logs')
      .select('id, raw_query, search_type, result_status, created_at')
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('error_reports')
      .select('id, description, status, created_at, journals(title)')
      .order('created_at', { ascending: false }).limit(10),
    ...FRESHNESS_TYPES.map((f) =>
      supabase.from('automation_runs')
        .select('completed_at')
        .eq('run_type', f.type)
        .eq('status', 'success')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then((r) => (r.data?.completed_at as string | null | undefined) ?? null)
    ),
  ])

  const now = Date.now()
  const freshness = FRESHNESS_TYPES.map((f, i) => {
    const completedAt = freshnessResults[i] as string | null
    const date = completedAt ? new Date(completedAt) : null
    const ageDays = date ? Math.floor((now - date.getTime()) / 86400000) : null
    return {
      type: f.type,
      label: f.label,
      ageDays,
      dateText: date ? date.toISOString().slice(0, 10) : '—',
      ageText: ageDays == null
        ? 'Never'
        : ageDays === 0 ? 'Today'
        : ageDays === 1 ? '1 day ago'
        : `${ageDays} days ago`,
      stale: ageDays == null || ageDays > STALE_DAY_THRESHOLD,
    }
  })

  const loginsCount = (authList?.users ?? []).filter((u) => u.last_sign_in_at != null).length

  const stats = [
    { label: 'Journals', value: journalsCount || 0, Icon: BookOpen },
    { label: 'Users', value: usersCount || 0, Icon: Users },
    { label: 'Searches', value: searchesCount || 0, Icon: Search },
    { label: 'Reports', value: reportsCount || 0, Icon: AlertTriangle },
    { label: 'Logins', value: loginsCount, Icon: LogIn },
  ]

  return (
    <div className="min-h-screen font-fs" style={{ background: '#F8FAFC' }}>
      <header className="bg-white shadow-sm h-16 flex items-center px-6">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            { /* eslint-disable-next-line @next/next/no-img-element */ }
            <img
              src="/branding/verijournals_icon_256.png"
              alt="VeriJournals"
              style={{ height: 40, width: 'auto' }}
            />
            <span className="text-lg font-bold" style={{ color: '#0B4644' }}>VeriJournals</span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(11,70,68,0.08)', color: '#0B4644' }}
            >
              Admin Dashboard
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-sm font-light mb-6" style={{ color: '#B2BEC4' }} dir="rtl">
          مرحباً، {user?.email ?? '—'}
        </p>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#0B4644' }}>
              Source Freshness
            </h2>
            <span className="text-xs" style={{ color: '#B2BEC4' }}>red if &gt; {STALE_DAY_THRESHOLD} days</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {freshness.map((f) => (
              <div key={f.type}>
                <div className="text-xs uppercase tracking-wide mb-2" style={{ color: '#B2BEC4' }}>{f.label}</div>
                <div className="text-sm font-semibold" style={{ color: f.stale ? '#DC2626' : '#0B4644' }}>
                  {f.ageText}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#B2BEC4' }}>{f.dateText}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 p-6 relative"
            >
              <Icon
                className="absolute top-4 right-4 w-5 h-5"
                style={{ color: '#B2BEC4' }}
                aria-hidden
              />
              <div
                className="font-bold mb-1"
                style={{ fontSize: '36px', color: '#05A854', lineHeight: 1.1 }}
              >
                {value.toLocaleString()}
              </div>
              <div className="font-light" style={{ fontSize: '14px', color: '#6B7280' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold" style={{ color: '#0B4644' }}>Recent Searches</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(!recentSearches || recentSearches.length === 0) ? (
                <div className="px-6 py-8 text-center text-sm font-light" style={{ color: '#B2BEC4' }}>
                  No searches yet
                </div>
              ) : recentSearches.map((s) => (
                <div key={s.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate" style={{ color: '#0B4644' }}>
                      {s.raw_query || '—'}
                    </div>
                    <div className="text-xs font-light mt-0.5" style={{ color: '#B2BEC4' }}>
                      {(s.search_type || 'unknown')}
                      {s.result_status ? ` · ${s.result_status}` : ''}
                    </div>
                  </div>
                  <div className="text-xs font-light flex-shrink-0" style={{ color: '#B2BEC4' }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold" style={{ color: '#0B4644' }}>Recent Errors</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(!recentReports || recentReports.length === 0) ? (
                <div className="px-6 py-8 text-center text-sm font-light" style={{ color: '#B2BEC4' }}>
                  No error reports yet
                </div>
              ) : recentReports.map((r: { id: string; description: string | null; status: string | null; created_at: string; journals: { title: string } | { title: string }[] | null }) => {
                const journalTitle = Array.isArray(r.journals)
                  ? r.journals[0]?.title
                  : r.journals?.title
                return (
                  <div key={r.id} className="px-6 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate" style={{ color: '#0B4644' }}>
                        {journalTitle || 'Unknown journal'}
                      </div>
                      <div className="text-xs font-light mt-0.5 truncate" style={{ color: '#B2BEC4' }}>
                        {(r.description || '—').slice(0, 60)}
                        {r.status ? ` · ${r.status}` : ''}
                      </div>
                    </div>
                    <div className="text-xs font-light flex-shrink-0" style={{ color: '#B2BEC4' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
