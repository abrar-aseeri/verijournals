import { getAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = getAdmin()

  const [{ count: journalsCount }, { count: usersCount }, { count: reportsCount }, { data: recentReports }] = await Promise.all([
    supabase.from('journals').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('error_reports').select('*', { count: 'exact', head: true }),
    supabase.from('error_reports').select('*, journals(title)').order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <div className="min-h-screen" style={{ background: '#0A1628' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>VeriJournals — MOD Research Platform</p>
          </div>
          <Link href="/" className="text-sm px-4 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
            Back to Site
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Journals', value: journalsCount || 0, color: '#00A05A' },
            { label: 'Registered Users', value: usersCount || 0, color: '#5DD9A4' },
            { label: 'Error Reports', value: reportsCount || 0, color: '#FFB020' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value.toLocaleString()}</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <h2 className="text-white font-semibold">Recent Error Reports</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Journal', 'Error Type', 'Description', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentReports || []).map((r: any) => (
                <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td className="px-4 py-3 text-sm text-white">{(r.journals as any)?.title?.slice(0, 40) || 'Unknown'}...</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#FFB020' }}>{r.error_type}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.description?.slice(0, 50)}...</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                      background: r.status === 'pending' ? 'rgba(255,176,32,0.15)' : 'rgba(0,160,90,0.15)',
                      color: r.status === 'pending' ? '#FFB020' : '#00A05A'
                    }}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!recentReports || recentReports.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No error reports yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
