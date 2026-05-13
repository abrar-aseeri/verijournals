'use client'
import { useState, useTransition } from 'react'
import { approveRequest, rejectRequest, revokeAccess, type ActionResult } from './actions'

export type RequestRowData = {
  id: string
  full_name: string
  email: string
  institution: string
  specialty: string
  reason: string
  ip_address: string | null
  requested_at: string
  status: 'pending' | 'approved' | 'rejected'
  review_notes: string | null
  reviewed_at: string | null
}

export function RequestRow({ row }: { row: RequestRowData }) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  function action(fn: (fd: FormData) => Promise<ActionResult>) {
    return () => {
      const fd = new FormData()
      fd.set('request_id', row.id)
      fd.set('notes', notes)
      startTransition(async () => {
        const r = await fn(fd)
        setResult(r)
      })
    }
  }

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 16).replace('T', ' ') : '—'

  return (
    <>
      <tr style={{ borderTop: '1px solid #F3F4F6' }}>
        <td className="px-4 py-3 text-sm" style={{ color: '#0B4644' }}>{row.full_name}</td>
        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#0B4644' }}>{row.email}</td>
        <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{row.institution}</td>
        <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{row.specialty}</td>
        <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>
          {row.reason.length > 50 ? row.reason.slice(0, 50) + '…' : row.reason}
        </td>
        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#9CA3AF' }}>{row.ip_address ?? '—'}</td>
        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#6B7280' }}>{fmt(row.requested_at)}</td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
            style={{ borderColor: '#D1D5DB', color: '#374151' }}
          >
            {open ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>
      {open && (
        <tr style={{ borderTop: '1px solid #F3F4F6', background: '#F9FAFB' }}>
          <td colSpan={8} className="px-5 py-4">
            <div className="mb-3">
              <div className="text-xs font-semibold mb-1" style={{ color: '#0B4644' }}>Full reason</div>
              <p className="text-sm whitespace-pre-wrap" style={{ color: '#374151' }}>{row.reason}</p>
            </div>
            {row.review_notes && (
              <div className="mb-3">
                <div className="text-xs font-semibold mb-1" style={{ color: '#0B4644' }}>Existing review notes</div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#374151' }}>{row.review_notes}</p>
              </div>
            )}
            {row.status === 'pending' && (
              <>
                <label className="text-xs font-medium mb-1 block" style={{ color: '#374151' }}>
                  Admin notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none mb-3"
                  placeholder="Notes for the audit trail"
                />
                <div className="flex gap-2">
                  <button
                    onClick={action(approveRequest)}
                    disabled={pending}
                    className="text-xs px-3 py-1.5 rounded font-semibold text-white"
                    style={{ background: pending ? '#9CA3AF' : '#05A854' }}
                  >
                    {pending ? '…' : 'Approve + send magic link'}
                  </button>
                  <button
                    onClick={action(rejectRequest)}
                    disabled={pending}
                    className="text-xs px-3 py-1.5 rounded font-semibold border"
                    style={{ borderColor: '#FCA5A5', color: '#991B1B', background: 'white' }}
                  >
                    {pending ? '…' : 'Reject'}
                  </button>
                </div>
              </>
            )}
            {row.status !== 'pending' && (
              <div className="text-xs italic" style={{ color: '#6B7280' }}>
                Reviewed {fmt(row.reviewed_at)} · {row.status}
              </div>
            )}
            {result && (
              <div
                className="mt-3 text-xs px-3 py-2 rounded-lg inline-block"
                style={{
                  background: result.ok ? '#DCFCE7' : '#FEE2E2',
                  color: result.ok ? '#0B4644' : '#991B1B',
                }}
              >
                {result.message_en ?? '—'}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export type AllowedUserRow = {
  email: string
  approved_at: string
  activated_at: string | null
  revoked_at: string | null
  notes: string | null
  geo_exempt: boolean
}

export function AllowedUserRowComponent({ row }: { row: AllowedUserRow }) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 16).replace('T', ' ') : '—'

  function onRevoke() {
    if (!confirm(`Revoke access for ${row.email}?`)) return
    startTransition(async () => {
      const r = await revokeAccess(row.email)
      setResult(r)
    })
  }

  const isRevoked = !!row.revoked_at

  return (
    <tr style={{ borderTop: '1px solid #F3F4F6' }}>
      <td className="px-4 py-3 text-xs font-mono" style={{ color: isRevoked ? '#9CA3AF' : '#0B4644' }}>
        {row.email}
        {row.geo_exempt && (
          <span className="ms-2 inline-block text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
            geo_exempt
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-xs font-mono" style={{ color: '#6B7280' }}>{fmt(row.approved_at)}</td>
      <td className="px-4 py-3 text-xs font-mono" style={{ color: row.activated_at ? '#05A854' : '#B2BEC4' }}>
        {fmt(row.activated_at)}
      </td>
      <td className="px-4 py-3 text-xs font-mono" style={{ color: isRevoked ? '#991B1B' : '#B2BEC4' }}>
        {fmt(row.revoked_at)}
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{row.notes ?? '—'}</td>
      <td className="px-4 py-3 text-right">
        {!isRevoked && (
          <button
            onClick={onRevoke}
            disabled={pending}
            className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
            style={{ borderColor: '#FCA5A5', color: '#991B1B' }}
          >
            {pending ? '…' : 'Revoke'}
          </button>
        )}
        {result?.message_en && (
          <span className="ms-2 text-[10px]" style={{ color: result.ok ? '#05A854' : '#991B1B' }}>
            {result.message_en}
          </span>
        )}
      </td>
    </tr>
  )
}
