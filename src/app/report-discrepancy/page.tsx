// Deliberately framed as DATA CORRECTION, not "appeal of classification."
// Posts to existing error_reports table. Bilingual, RTL primary.
import { Suspense } from "react";
import ReportDiscrepancyForm from "./Form";

export const metadata = {
  title: "تنبيه عن تباين في البيانات / Data Correction Request — VeriJournals",
};

export default function Page() {
  return (
    <main dir="rtl" className="mx-auto max-w-2xl px-4 py-10 font-fs">
      <h1 className="text-2xl font-semibold text-[#0B4644]">
        تنبيه عن تباين في البيانات
      </h1>
      <p className="mt-1 text-sm text-[#0B4644]/70" lang="en">
        Data Correction Request
      </p>

      <p className="mt-4 text-sm leading-7 text-[#0B4644]/85">
        إذا لاحظتِ أو لاحظتَ أن بياناً معروضاً عن مجلة لا يتطابق مع المصدر الأصلي
        (DOAJ, NLM, Retraction Watch, SCImago)، أرسل/ي بياناً ودليلاً مباشراً. سنُعيد
        استعلام المصدر الأصلي ونُحدّث السجل. هذا نموذج **تصحيح بيانات** وليس طعناً في
        تصنيف تحريري.
      </p>
      <p className="mt-2 text-xs text-[#0B4644]/60" lang="en">
        If a displayed indicator does not match its upstream source, submit the
        discrepancy with a direct link as evidence. We re-query the source and update
        the record. This is a data-correction form, not an editorial-classification appeal.
      </p>

      <Suspense fallback={<div className="mt-6 text-sm">…</div>}>
        <ReportDiscrepancyForm />
      </Suspense>
    </main>
  );
}
