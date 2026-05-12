import Link from "next/link";

type Confidence = "high" | "medium" | "low";

interface IndicatorCardProps {
  value: string | number;
  label: string;            // e.g. "DOAJ Indexing" / "فهرسة DOAJ"
  source: string;           // e.g. "DOAJ", "NLM Catalog", "Retraction Watch"
  snapshotAt: string;       // ISO date or "YYYY-MM-DD"
  sourceUrl?: string;       // link to upstream record where available
  confidence: Confidence;
  journalId?: string;       // for Report Discrepancy
  indicatorKey?: string;    // for Report Discrepancy
}

const confidenceStyles: Record<Confidence, { ar: string; en: string; dot: string }> = {
  high:   { ar: "موثوقية عالية",  en: "High confidence",   dot: "bg-[#05A854]" },
  medium: { ar: "موثوقية متوسطة", en: "Medium confidence", dot: "bg-[#B2BEC4]" },
  low:    { ar: "موثوقية محدودة", en: "Limited confidence", dot: "bg-[#DC2626]" },
};

export default function IndicatorCard({
  value, label, source, snapshotAt, sourceUrl, confidence,
  journalId, indicatorKey,
}: IndicatorCardProps) {
  const c = confidenceStyles[confidence];
  const reportHref = journalId && indicatorKey
    ? `/report-discrepancy?journal=${encodeURIComponent(journalId)}&indicator=${encodeURIComponent(indicatorKey)}`
    : null;

  return (
    <div
      dir="rtl"
      className="rounded-xl border border-[#B2BEC4]/40 bg-white p-4 shadow-sm hover:shadow transition"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-fs text-sm text-[#0B4644]/80">{label}</div>
        <div className="flex items-center gap-1.5 text-xs text-[#0B4644]/60">
          <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
          <span lang="ar">{c.ar}</span>
        </div>
      </div>

      <div className="mt-2 font-fs text-2xl font-semibold text-[#0B4644]">
        {value}
      </div>

      <dl className="mt-3 space-y-1 text-xs text-[#0B4644]/70">
        <div className="flex justify-between gap-2">
          <dt>المصدر / Source:</dt>
          <dd className="font-medium">
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
                 className="underline decoration-dotted hover:text-[#05A854]">
                {source}
              </a>
            ) : source}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>التحديث الأخير / Last verified:</dt>
          <dd>{snapshotAt}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between text-xs">
        <Link
          href="/methodology#sources"
          className="text-[#0B4644]/60 hover:text-[#05A854] underline decoration-dotted"
        >
          المنهجية / Methodology
        </Link>
        {reportHref && (
          <Link
            href={reportHref}
            className="text-[#0B4644]/60 hover:text-[#DC2626] underline decoration-dotted"
            lang="en"
          >
            تنبيه عن تباين / Data correction
          </Link>
        )}
      </div>
    </div>
  );
}
