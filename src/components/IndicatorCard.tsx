import Link from "next/link";

type Confidence = "high" | "medium" | "low";

interface IndicatorCardProps {
  value: string | number;
  label: string;            // e.g. "DOAJ Indexing" / "فهرسة DOAJ"
  source: string;           // e.g. "DOAJ", "NLM Catalog", "Retraction Watch"
  license: string;          // e.g. "CC0", "CC-BY 4.0", "Public domain"
  snapshotAt: string;       // ISO date or "YYYY-MM-DD"
  sourceUrl?: string;       // upstream URL (rendered as both link AND visible text)
  confidence: Confidence;
  journalId?: string;       // for Report Discrepancy
  indicatorKey?: string;    // for Report Discrepancy
}

// Color palette mapping per spec:
//   green   #05A854  positive (high confidence = fresh source)
//   blue    #3B82F6  neutral/informational (medium confidence = stale-ish)
//   gray    #B2BEC4  limited data (low confidence = no recent snapshot)
//   amber   #F59E0B  caution (used on the journal page for status badges)
// No red anywhere on journal-facing surfaces.
const confidenceStyles: Record<Confidence, { ar: string; en: string; dot: string }> = {
  high:   { ar: "موثوقية عالية",  en: "High confidence",   dot: "bg-[#05A854]" },
  medium: { ar: "موثوقية متوسطة", en: "Medium confidence", dot: "bg-[#3B82F6]" },
  low:    { ar: "موثوقية محدودة", en: "Limited confidence", dot: "bg-[#B2BEC4]" },
};

export default function IndicatorCard({
  value, label, source, license, snapshotAt, sourceUrl, confidence,
}: IndicatorCardProps) {
  const c = confidenceStyles[confidence];

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

      <div className="mt-2 text-[10px] leading-relaxed text-[#0B4644]/60">
        <p dir="rtl" className="font-fs">
          <span aria-hidden>ⓘ</span> تقدير خوارزمي مبني على بيانات مُعلَنة. ليس حكماً قطعياً.
        </p>
        <p lang="en">
          <span aria-hidden>ⓘ</span> Algorithmic estimate based on declared data. Not a definitive judgment.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5">
          <Link
            href="/methodology"
            className="underline decoration-dotted hover:text-[#05A854]"
          >
            <span dir="rtl" className="font-fs">كيف يُحسَب؟</span>
            <span className="mx-0.5">/</span>
            <span lang="en">How is this calculated?</span>
          </Link>
          <span className="opacity-50">|</span>
          <Link
            href="/report-discrepancy"
            className="underline decoration-dotted hover:text-[#F59E0B]"
          >
            <span dir="rtl" className="font-fs">أبلغ عن تباين</span>
            <span className="mx-0.5">/</span>
            <span lang="en">Report discrepancy</span>
          </Link>
        </div>
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
        {sourceUrl && (
          <div className="flex justify-between gap-2">
            <dt>الرابط / URL:</dt>
            <dd className="text-[10px] font-mono truncate max-w-[60%]" title={sourceUrl}>
              {sourceUrl}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <dt>الترخيص / License:</dt>
          <dd className="font-medium">{license}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>التحديث الأخير / Last verified:</dt>
          <dd>{snapshotAt}</dd>
        </div>
      </dl>

    </div>
  );
}
