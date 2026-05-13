import Link from 'next/link'
import { getAdmin } from '@/lib/supabase'
import {
  RequestRow,
  AllowedUserRowComponent,
  type RequestRowData,
  type AllowedUserRow,
} from './RequestRow'

export const dynamic = 'force-dynamic'

type Tab = 'pending' | 'approved' | 'rejected' | 'active'
const TABS: { key: Tab; ar: string; en: string }[] = [
  { key: 'pending', ar: 'قيد المراجعة', en: 'Pending' },
  { key: 'approved', ar: 'مقبولة', en: 'Approved' },
  { key: 'rejected', ar: 'مرفوضة', en: 'Rejected' },
  { key: 'active', ar: 'الحسابات النشطة', en: 'Active users' },
]

export default async function AdminAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  // Layout-level admin gate enforces role; server actions in actions.ts
  // re-check independently.
  const { tab: tabParam } = await searchParams
  const tab: Tab = TABS.find((t) => t.key === tabParam)?.key ?? 'pending'

  const admin = getAdmin()

  let requests: RequestRowData[] = []
  let allowed: AllowedUserRow[] = []
  let tableMissing = false
  let queryError: string | null = null
  let counts = { pending: 0, approved: 0, rejected: 0, active: 0 }

  if (tab === 'active') {
    const [{ data: rows, error }, c] = await Promise.all([
      admin
        .from('allowed_users')
        .select('email, approved_at, activated_at, revoked_at, notes, geo_exempt')
        .order('approved_at', { ascending: false }),
      countRequests(),
    ])
    if (error) {
      if (error.code === '42P01') tableMissing = true
      else queryError = error.message
    } else if (rows) {
      allowed = rows as AllowedUserRow[]
    }
    counts = await c
  } else {
    const [{ data: rows, error }, c] = await Promise.all([
      admin
        .from('access_requests')
        .select('id, full_name, email, institution, specialty, reason, ip_address, requested_at, status, review_notes, reviewed_at')
        .eq('status', tab)
        .order('requested_at', { ascending: false }),
      countRequests(),
    ])
    if (error) {
      if (error.code === '42P01') tableMissing = true
      else queryError = error.message
    } else if (rows) {
      requests = rows as RequestRowData[]
    }
    counts = await c
  }

  return (
    <div className="min-h-screen px-6 py-10 font-fs" style={{ background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: '#0B4644' }}>
            <span dir="rtl">طلبات الوصول</span>
            <span className="mx-2 opacity-50">·</span>
            <span lang="en">Access Requests</span>
          </h1>
          <Link
            href="/admin"
            className="text-sm underline hover:opacity-80"
            style={{ color: '#0B4644' }}
          >
            ← Admin home
          </Link>
        </div>

        {tableMissing && (
          <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: '#FCD34D', background: '#FEF3C7', color: '#92400E' }}>
            <p dir="rtl" className="font-fs">جدول مطلوب غير موجود. شغّل الهجرات قبل استخدام هذه الصفحة.</p>
            <p lang="en" className="text-xs mt-1">A required table does not exist. Apply the migrations before using this page.</p>
          </div>
        )}

        {queryError && (
          <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: '#FCA5A5', background: '#FEE2E2', color: '#991B1B' }}>
            <p lang="en">Query error: {queryError}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          {TABS.map((t) => {
            const active = t.key === tab
            const count = counts[t.key]
            return (
              <Link
                key={t.key}
                href={`/admin/access?tab=${t.key}`}
                className="px-4 py-2 text-sm font-semibold border-b-2"
                style={{
                  borderColor: active ? '#05A854' : 'transparent',
                  color: active ? '#0B4644' : '#6B7280',
                }}
              >
                <span dir="rtl" className="font-fs">{t.ar}</span>
                <span className="mx-1">·</span>
                <span lang="en">{t.en}</span>
                <span className="ms-2 text-xs px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                  {count}
                </span>
              </Link>
            )
          })}
        </div>

        {tab !== 'active' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {requests.length === 0 && !tableMissing ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: '#6B7280' }}>
                No {tab} requests.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wide" style={{ color: '#B2BEC4' }}>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Email</th>
                    <th className="text-left px-4 py-2">Institution</th>
                    <th className="text-left px-4 py-2">Specialty</th>
                    <th className="text-left px-4 py-2">Reason</th>
                    <th className="text-left px-4 py-2">IP</th>
                    <th className="text-left px-4 py-2">Submitted</th>
                    <th className="text-right px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <RequestRow key={r.id} row={r} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'active' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {allowed.length === 0 && !tableMissing ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: '#6B7280' }}>
                No active users yet.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wide" style={{ color: '#B2BEC4' }}>
                    <th className="text-left px-4 py-2">Email</th>
                    <th className="text-left px-4 py-2">Approved</th>
                    <th className="text-left px-4 py-2">Activated</th>
                    <th className="text-left px-4 py-2">Revoked</th>
                    <th className="text-left px-4 py-2">Notes</th>
                    <th className="text-right px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {allowed.map((r) => (
                    <AllowedUserRowComponent key={r.email} row={r} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

async function countRequests(): Promise<{ pending: number; approved: number; rejected: number; active: number }> {
  const admin = getAdmin()
  const [pending, approved, rejected, active] = await Promise.all([
    admin.from('access_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('access_requests').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    admin.from('access_requests').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    admin.from('allowed_users').select('email', { count: 'exact', head: true }).is('revoked_at', null),
  ])
  return {
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
    active: active.count ?? 0,
  }
}
