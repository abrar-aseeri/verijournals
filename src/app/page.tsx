import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col font-fs"
      style={{ background: '#F8FAFC' }}
    >
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 justify-center">
            { /* eslint-disable-next-line @next/next/no-img-element */ }
            <img
              src="/branding/verijournals_icon_256.png"
              alt="VeriJournals"
              style={{ height: 60, width: 'auto' }}
            />
            <div className="font-bold text-2xl" style={{ color: '#0B4644' }}>
              Veri<span style={{ color: '#05A854' }}>Journals</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <p dir="rtl" className="text-sm leading-relaxed mb-3" style={{ color: '#0B4644' }}>
              منصة VeriJournals — أداة استرشادية للتحقق من المجلات العلمية. حالياً في مرحلة الاختبار المغلق، متاحة للباحثين المقيمين في المملكة العربية السعودية بدعوة فقط.
            </p>
            <p lang="en" className="text-sm leading-relaxed mb-6" style={{ color: '#374151' }}>
              VeriJournals — an advisory tool for scientific journal verification. Currently in closed beta, available to researchers residing in Saudi Arabia by invitation only.
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href="/request-access"
                className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center text-white"
                style={{ background: '#05A854' }}
              >
                طلب وصول · Request Access
              </Link>
              <Link
                href="/login"
                className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center border"
                style={{ borderColor: '#0B4644', color: '#0B4644', background: 'white' }}
              >
                تسجيل الدخول · Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="border-t px-4 py-5 text-center text-xs"
        style={{ borderColor: '#E5E7EB', background: 'white', color: '#6B7280' }}
      >
        <p dir="rtl" className="font-fs mb-1">
          منصة VeriJournals — مشروع شخصي. للاستفسارات: privacy@verijournals.app
        </p>
        <p lang="en" className="mb-2">
          VeriJournals platform — Owner: independent researcher. Contact: privacy@verijournals.app
        </p>
        <div>
          <Link href="/privacy" className="hover:underline mx-2">إشعار الخصوصية · Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:underline mx-2">شروط الاستخدام · Terms</Link>
        </div>
      </footer>
    </div>
  )
}
