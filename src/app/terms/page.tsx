import { PRIVACY_NOTICE_VERSION, PRIVACY_NOTICE_EFFECTIVE_DATE } from '@/lib/privacy'

export const dynamic = 'force-dynamic'

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-16 font-fs" style={{ background: '#F8FAFC' }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 dir="rtl" className="text-xl font-bold mb-1" style={{ color: '#0B4644' }}>
          شروط الاستخدام
        </h1>
        <h2 lang="en" className="text-sm font-semibold mb-6" style={{ color: '#6B7280' }}>
          Terms of Service
        </h2>
        <p dir="rtl" className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>
          شروط الاستخدام قيد الإعداد. حتى نشر النسخة الكاملة، يُستخدَم المنصة بحُسن نية ووفق الأنظمة السعودية النافذة. للاستفسارات: privacy@verijournals.app
        </p>
        <p lang="en" className="text-sm leading-relaxed" style={{ color: '#374151' }}>
          Terms of Service in preparation. Until the full version is published, the platform is to be used in good faith and in accordance with applicable Saudi laws. For inquiries: privacy@verijournals.app
        </p>
        <div className="mt-8 pt-4 border-t border-gray-100 text-xs" style={{ color: '#6B7280' }}>
          Version: {PRIVACY_NOTICE_VERSION} · Effective: {PRIVACY_NOTICE_EFFECTIVE_DATE}
        </div>
      </div>
    </main>
  )
}
