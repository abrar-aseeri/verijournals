import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function BlockedPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 font-fs"
      style={{ background: '#F8FAFC' }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
          <h1
            dir="rtl"
            className="text-lg font-bold mb-1"
            style={{ color: '#0B4644' }}
          >
            الوصول من خارج المملكة معطَّل
          </h1>
          <h2 lang="en" className="text-sm font-semibold mb-5" style={{ color: '#6B7280' }}>
            Access from outside Saudi Arabia is disabled
          </h2>
          <p
            dir="rtl"
            className="text-sm leading-relaxed mb-3"
            style={{ color: '#374151' }}
          >
            الوصول من خارج المملكة العربية السعودية معطَّل حالياً. إذا كنت سعودياً مسافراً، يرجى التواصل مع المشرف لمنحك استثناء مؤقت: privacy@verijournals.app
          </p>
          <p lang="en" className="text-xs leading-relaxed mb-6" style={{ color: '#374151' }}>
            Access from outside Saudi Arabia is currently disabled. If you are a Saudi resident traveling abroad, please contact the administrator for a temporary exemption: privacy@verijournals.app
          </p>
          <Link
            href="/"
            className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center"
            style={{ background: '#F3F4F6', color: '#0B4644' }}
          >
            ← العودة إلى الصفحة الرئيسية · Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
