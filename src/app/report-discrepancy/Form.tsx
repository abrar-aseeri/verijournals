'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ReportDiscrepancyForm() {
  const params = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<{ id?: string; status?: string; message?: string; error?: string } | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      journal_id: params.get('journal') ?? fd.get('journal_id'),
      indicator_key: params.get('indicator') ?? fd.get('indicator_key'),
      displayed_value: fd.get('displayed_value'),
      correct_value: fd.get('correct_value'),
      evidence_url: fd.get('evidence_url'),
      reporter_email: fd.get('reporter_email'),
      notes: fd.get('notes'),
    }
    const res = await fetch('/api/discrepancy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    setSubmitting(false)
    setDone(res.ok
      ? { id: json.id, status: json.status, message: json.message }
      : { error: json.error ?? 'submit_failed' })
  }

  if (done?.id) {
    return (
      <div className="mt-6 rounded-lg border border-[#05A854]/30 bg-[#05A854]/5 p-4 text-sm">
        <p>تم الاستلام. الرقم المرجعي: <span className="font-mono">{done.id}</span></p>
        <p className="mt-1 text-[#0B4644]/70" lang="en">
          Received. Reference: <span className="font-mono">{done.id}</span>
        </p>
        {done.message && (
          <p className="mt-3 text-xs text-[#0B4644]/80" lang="en">{done.message}</p>
        )}
        {done.status && (
          <p className="mt-1 text-xs font-mono text-[#0B4644]/60">status: {done.status}</p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 text-sm">
      <Field name="journal_id" label="معرّف المجلة / Journal ID" defaultValue={params.get('journal') ?? ''} required readOnly={!!params.get('journal')} />
      <Field name="indicator_key" label="المؤشر المعني / Indicator" defaultValue={params.get('indicator') ?? ''} required readOnly={!!params.get('indicator')} />
      <Field name="displayed_value" label="القيمة المعروضة الآن / Currently displayed" required />
      <Field name="correct_value" label="القيمة الصحيحة بحسب المصدر / Correct value per source" required />
      <Field name="evidence_url" label="رابط الدليل (URL) / Evidence link" type="url" required />
      <Field name="reporter_email" label="بريدك (اختياري) / Your email (optional)" type="email" />
      <div>
        <label className="block text-xs text-[#0B4644]/70">ملاحظات / Notes</label>
        <textarea name="notes" rows={3} className="mt-1 w-full rounded-md border border-[#B2BEC4]/60 p-2" />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[#0B4644] px-4 py-2 text-white hover:bg-[#05A854] disabled:opacity-60"
      >
        {submitting ? '…جارٍ الإرسال' : 'إرسال / Submit'}
      </button>
      {done?.error && (
        <p className="text-[#DC2626] text-xs">تعذّر الإرسال / Submission failed: {done.error}</p>
      )}
    </form>
  )
}

function Field(props: { name: string; label: string; defaultValue?: string; required?: boolean; readOnly?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-[#0B4644]/70">{props.label}</label>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        defaultValue={props.defaultValue}
        required={props.required}
        readOnly={props.readOnly}
        className="mt-1 w-full rounded-md border border-[#B2BEC4]/60 p-2 bg-white read-only:bg-[#F8FAFC]"
      />
    </div>
  )
}
