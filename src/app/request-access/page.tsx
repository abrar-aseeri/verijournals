import Link from 'next/link'
import RequestAccessForm from './RequestAccessForm'

export const dynamic = 'force-dynamic'

export default function RequestAccessPage() {
  return (
    <div
      className="min-h-screen px-4 py-12 font-fs"
      style={{ background: '#F8FAFC' }}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6 justify-center">
          { /* eslint-disable-next-line @next/next/no-img-element */ }
          <img
            src="/branding/verijournals_icon_256.png"
            alt="VeriJournals"
            style={{ height: 50, width: 'auto' }}
          />
          <div className="font-bold text-lg" style={{ color: '#0B4644' }}>
            Veri<span style={{ color: '#05A854' }}>Journals</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 dir="rtl" className="text-lg font-bold mb-1" style={{ color: '#0B4644' }}>
            طلب وصول
          </h1>
          <h2 lang="en" className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>
            Request Access
          </h2>
          <p dir="rtl" className="text-xs leading-relaxed mb-2" style={{ color: '#374151' }}>
            املأ النموذج وسنراجع طلبك يدوياً. الوصول متاح للباحثين المقيمين داخل المملكة العربية السعودية في هذه المرحلة.
          </p>
          <p lang="en" className="text-xs leading-relaxed mb-5" style={{ color: '#374151' }}>
            Fill out the form and we will review your request manually. Access is currently available to researchers residing inside Saudi Arabia.
          </p>

          <RequestAccessForm />
        </div>

        <div className="text-center mt-6 text-xs" style={{ color: '#6B7280' }}>
          <Link href="/" className="hover:underline">
            ← العودة إلى الصفحة الرئيسية · Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
