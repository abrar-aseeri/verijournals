import { PRIVACY_NOTICE_VERSION, PRIVACY_NOTICE_EFFECTIVE_DATE } from '@/lib/privacy'

export const dynamic = 'force-dynamic'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-16 font-fs" style={{ background: '#F8FAFC' }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 dir="rtl" className="text-xl font-bold mb-1" style={{ color: '#0B4644' }}>
          إشعار الخصوصية
        </h1>
        <h2 lang="en" className="text-sm font-semibold mb-6" style={{ color: '#6B7280' }}>
          Privacy Notice
        </h2>
        <p dir="rtl" className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>
          إشعار الخصوصية قيد الإعداد. حتى نشر النسخة الكاملة، تُعالَج البيانات وفق نظام حماية البيانات الشخصية السعودي. للاستفسارات: privacy@verijournals.app
        </p>
        <p lang="en" className="text-sm leading-relaxed" style={{ color: '#374151' }}>
          Privacy Notice in preparation. Until the full version is published, data is processed in accordance with the Saudi Personal Data Protection Law. For inquiries: privacy@verijournals.app
        </p>
        <div className="mt-8 pt-4 border-t border-gray-100 text-xs" style={{ color: '#6B7280' }}>
          Version: {PRIVACY_NOTICE_VERSION} · Effective: {PRIVACY_NOTICE_EFFECTIVE_DATE}
        </div>
      </div>
    </main>
  )
}
