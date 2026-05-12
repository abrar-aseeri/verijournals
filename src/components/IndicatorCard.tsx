import Link from 'next/link'
import type { ReactNode } from 'react'

// Display a single journal-level indicator with explicit source attribution,
// snapshot timestamp, and confidence level. Used uniformly across every
// indicator on /journal/[id] so users can see WHICH third-party source
// backed each number, when it was last refreshed, and how reliable it is.
// Part of the M.3 defamation-mitigation posture: every indicator is framed
// as factual signal with attribution, not as VeriJournals editorial judgment.

export type Confidence = 'high' | 'medium' | 'low' | 'unavailable'

interface IndicatorCardProps {
  label: string
  labelAr?: string
  value: ReactNode
  source: string
  sourceUrl?: string
  snapshot?: string | null
  confidence: Confidence
  reportHref?: string
}

const CONFIDENCE_META: Record<
  Confidence,
  { dot: string; ring: string; title: string; valueColor: string }
> = {
  high:        { dot: '#05A854', ring: '#05A854', title: 'High confidence — direct from named source', valueColor: '#0B4644' },
  medium:      { dot: '#FFB020', ring: '#FFB020', title: 'Medium confidence — derived signal',         valueColor: '#0B4644' },
  low:         { dot: '#B2BEC4', ring: '#B2BEC4', title: 'Low confidence — sparse data',               valueColor: '#0B4644' },
  unavailable: { dot: '#E5E7EB', ring: '#E5E7EB', title: 'Not collected at this tier',                 valueColor: '#B2BEC4' },
}

export default function IndicatorCard({
  label,
  labelAr,
  value,
  source,
  sourceUrl,
  snapshot,
  confidence,
  reportHref,
}: IndicatorCardProps) {
  const meta = CONFIDENCE_META[confidence]
  return (
    <div
      className="bg-white rounded-2xl p-4 flex flex-col gap-1.5"
      style={{ border: `1px solid ${meta.ring}33` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#6B7280' }}>
          {label}
          {labelAr && (
            <span dir="rtl" className="ms-2 font-fs normal-case font-normal" style={{ color: '#B2BEC4' }}>
              {labelAr}
            </span>
          )}
        </div>
        <span
          className="inline-block w-2 h-2 rounded-full mt-1 flex-shrink-0"
          style={{ background: meta.dot }}
          title={meta.title}
          aria-label={meta.title}
        />
      </div>
      <div className="text-2xl font-bold leading-tight" style={{ color: meta.valueColor }}>
        {value}
      </div>
      <div className="text-[11px] flex items-center flex-wrap gap-x-1.5" style={{ color: '#B2BEC4' }}>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: '#6B7280' }}
          >
            {source}
          </a>
        ) : (
          <span style={{ color: '#6B7280' }}>{source}</span>
        )}
        {snapshot && <span>· {snapshot}</span>}
      </div>
      {reportHref && (
        <Link
          href={reportHref}
          className="text-[11px] underline hover:opacity-80 self-start mt-0.5"
          style={{ color: '#0B4644' }}
        >
          Report discrepancy
        </Link>
      )}
    </div>
  )
}
