'use client'
import { useState } from 'react'

const MIN_REASON = 50
const MAX_REASON = 500

export default function RequestAccessForm() {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [reasonLen, setReasonLen] = useState(0)
  const [saudi, setSaudi] = useState(false)
  const [pdpl, setPdpl] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!saudi || !pdpl) {
      setError('الإقرارات الإلزامية لم تُعطَ · Required acknowledgments not given')
      return
    }
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      full_name: fd.get('full_name'),
      email: fd.get('email'),
      institution: fd.get('institution'),
      specialty: fd.get('specialty'),
      reason: fd.get('reason'),
      saudi_residence_confirmed: saudi,
      pdpl_acknowledged: pdpl,
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
        className="rounded-lg border px-4 py-4 text-sm"
        style={{ borderColor: '#86EFAC', background: '#DCFCE7', color: '#0B4644' }}
      >
        <p dir="rtl" className="font-fs mb-1">
          تم استلام طلبك. ستصلك رسالة عند مراجعته.
        </p>
        <p lang="en" className="text-xs">
          Your request has been received. You will receive an email when reviewed.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field name="full_name" required label="Full name · الاسم الكامل" />
      <Field name="email" type="email" required label="Email · البريد الإلكتروني" hint="Institutional email preferred · يُفضّل بريد المؤسسة" />
      <Field name="institution" required label="Institution / Affiliation · المؤسسة" />
      <Field name="specialty" required label="Research specialty · التخصص" />

      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: '#374151' }}>
          Reason for access (50–500) · سبب الطلب
        </label>
        <textarea
          name="reason"
          required
          minLength={MIN_REASON}
          maxLength={MAX_REASON}
          rows={4}
          onChange={(e) => setReasonLen(e.target.value.length)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
        />
        <div className="text-[10px] mt-0.5" style={{ color: reasonLen < MIN_REASON || reasonLen > MAX_REASON ? '#9CA3AF' : '#05A854' }}>
          {reasonLen} / {MAX_REASON}
        </div>
      </div>

      <label className="flex items-start gap-2 p-2 rounded-lg border-l-4 cursor-pointer" style={{ borderLeftColor: '#DC2626' }}>
        <input type="checkbox" checked={saudi} onChange={(e) => setSaudi(e.target.checked)} required className="mt-1" />
        <div className="flex-1">
          <div dir="rtl" className="text-xs font-fs leading-relaxed" style={{ color: '#0B4644' }}>
            أُقرّ بأنني مقيم/ـة حالياً في المملكة العربية السعودية وأن استخدامي للمنصة يتم من داخل المملكة.
          </div>
          <div lang="en" className="text-xs leading-relaxed mt-1" style={{ color: '#374151' }}>
            I confirm that I am currently residing in Saudi Arabia and will access the platform from within the Kingdom.
          </div>
          <div className="text-[10px] mt-1 font-medium" style={{ color: '#DC2626' }}>
            (<span dir="rtl" className="font-fs">إلزامي</span> / Required)
          </div>
        </div>
      </label>

      <label className="flex items-start gap-2 p-2 rounded-lg border-l-4 cursor-pointer" style={{ borderLeftColor: '#DC2626' }}>
        <input type="checkbox" checked={pdpl} onChange={(e) => setPdpl(e.target.checked)} required className="mt-1" />
        <div className="flex-1">
          <div dir="rtl" className="text-xs font-fs leading-relaxed" style={{ color: '#0B4644' }}>
            أوافق على معالجة بياناتي وفق نظام حماية البيانات الشخصية السعودي.
          </div>
          <div lang="en" className="text-xs leading-relaxed mt-1" style={{ color: '#374151' }}>
            I consent to processing of my data under the Saudi Personal Data Protection Law.
          </div>
          <div className="text-[10px] mt-1 font-medium" style={{ color: '#DC2626' }}>
            (<span dir="rtl" className="font-fs">إلزامي</span> / Required)
          </div>
        </div>
      </label>

      {error && (
        <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !saudi || !pdpl}
        className="py-2.5 rounded-lg text-sm font-semibold text-white mt-1"
        style={{ background: submitting || !saudi || !pdpl ? '#9CA3AF' : '#05A854' }}
      >
        {submitting ? 'Sending…' : 'إرسال الطلب · Submit Request'}
      </button>
    </form>
  )
}

function Field({
  name, label, type = 'text', required, hint,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: '#374151' }}>{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
      />
      {hint && <p className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>{hint}</p>}
    </div>
  )
}
