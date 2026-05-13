'use client'
import { useState } from 'react'

export default function RequestAccessForm() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const body = {
      email: fd.get('email'),
      name: fd.get('name'),
      reason: fd.get('reason'),
    }
    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message_en ?? json.error ?? 'Submission failed')
        setSubmitting(false)
        return
      }
      setDone(true)
      setSubmitting(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div
        className="rounded-lg border px-3 py-3 text-sm"
        style={{ borderColor: '#86EFAC', background: '#DCFCE7', color: '#0B4644' }}
      >
        <p dir="rtl" className="font-fs mb-1">تم استلام طلبك. سنتواصل معك عبر البريد الإلكتروني.</p>
        <p lang="en" className="text-xs">Your request has been received. We will contact you by email.</p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="block w-full py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ background: '#05A854' }}
      >
        طلب وصول · Request Access
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 mb-2">
      <input
        name="email"
        type="email"
        required
        placeholder="Email · البريد الإلكتروني"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
      />
      <input
        name="name"
        type="text"
        placeholder="Name (optional) · الاسم (اختياري)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
      />
      <textarea
        name="reason"
        rows={3}
        placeholder="Reason for access (optional) · سبب الطلب (اختياري)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
      />
      {error && (
        <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: submitting ? '#9CA3AF' : '#05A854' }}
        >
          {submitting ? 'Sending…' : 'إرسال · Send'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="py-2.5 px-3 rounded-lg text-sm border"
          style={{ borderColor: '#E5E7EB', color: '#6B7280', background: 'white' }}
        >
          إلغاء · Cancel
        </button>
      </div>
    </form>
  )
}
