'use client'
import { useState } from 'react'

type Props = {
  title: string
  issn?: string | null
  quartile?: string | null
  trustScore?: number | null
  lastVerifiedAt?: string | null
}

export default function DownloadPdfButton({ title, issn, quartile, trustScore, lastVerifiedAt }: Props) {
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    setBusy(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const marginX = 48

      doc.setFillColor(27, 94, 32)
      doc.rect(0, 0, pageWidth, 96, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('Veri', marginX, 56)
      const veriWidth = doc.getTextWidth('Veri')
      doc.setTextColor(76, 175, 80)
      doc.text('Journals', marginX + veriWidth, 56)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.text('Research & Innovation Institute — MOD', marginX, 76)

      let y = 140
      doc.setTextColor(20, 20, 20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      const wrapped = doc.splitTextToSize(title, pageWidth - marginX * 2)
      doc.text(wrapped, marginX, y)
      y += wrapped.length * 20 + 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(80, 80, 80)

      const row = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text(label, marginX, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(30, 30, 30)
        doc.text(value, marginX + 140, y)
        y += 22
      }

      row('ISSN', issn || '—')
      row('SCImago Quartile', quartile || '—')
      row('Trust Score', trustScore != null ? `${trustScore} / 100` : '—')
      row(
        'Verification Date',
        lastVerifiedAt ? new Date(lastVerifiedAt).toLocaleDateString() : new Date().toLocaleDateString(),
      )

      doc.setDrawColor(220, 220, 220)
      doc.line(marginX, y + 8, pageWidth - marginX, y + 8)

      const watermark = 'Auto-generated report - for reference only'
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(46)
      doc.setTextColor(27, 94, 32)
      const gState = (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState
      const setGState = (doc as unknown as { setGState: (s: unknown) => void }).setGState
      if (gState && setGState) {
        setGState.call(doc, new gState({ opacity: 0.08 }))
      }
      doc.text(watermark, pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 30,
      })
      if (gState && setGState) {
        setGState.call(doc, new gState({ opacity: 1 }))
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.text(watermark, pageWidth / 2, pageHeight - 32, { align: 'center' })

      const safe = title.replace(/[^\w\s-]/g, '').slice(0, 60).trim().replace(/\s+/g, '_') || 'journal'
      doc.save(`VeriJournals_${safe}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
      style={{ background: '#1B5E20' }}
    >
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {busy ? 'Generating…' : 'Download PDF Report'}
    </button>
  )
}
