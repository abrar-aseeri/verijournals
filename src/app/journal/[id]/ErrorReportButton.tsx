'use client'
import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

export default function ErrorReportButton({ journalId, journalTitle }: { journalId: string, journalTitle: string }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!type || !description) return
    setLoading(true)
    const supabase = createSupabaseBrowser()
    await supabase.from('error_reports').insert({
      journal_id: journalId,
      error_type: type,
      description: description,
      status: 'pending',
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
      Thank you! Your report has been submitted for review.
    </div>
  )

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50">
      Report an Error
    </button>
  )

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Error Type *</label>
        <select value={type} onChange={e => setType(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
          <option value="">Select type...</option>
          <option value="wrong_issn">Wrong ISSN</option>
          <option value="wrong_publisher">Wrong Publisher</option>
          <option value="wrong_country">Wrong Country</option>
          <option value="wrong_trust_score">Wrong Trust Score</option>
          <option value="journal_discontinued">Journal Discontinued</option>
          <option value="predatory_journal">Predatory Journal</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Description *</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Please describe the error..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"/>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={loading || !type || !description}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: loading ? '#9CA3AF' : '#1B5E20' }}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
        <button onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200">
          Cancel
        </button>
      </div>
    </div>
  )
}
