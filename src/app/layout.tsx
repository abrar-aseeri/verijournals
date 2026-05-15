import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VeriJournals — بوابة التحقق من المجلات العلمية',
  description: 'بوابة رسمية للتحقق من المجلات العلمية. Verify scientific journals and articles.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="ltr">
      <body
        className="antialiased"
        style={{ background: '#F5F5F5', color: '#1A1A1A' }}
      >
        <div
          className="w-full py-2 px-4 text-center"
          style={{
            background: '#FFFBE6',
            color: '#555555',
            fontSize: '12px',
            lineHeight: '1.5',
            borderBottom: '1px solid #E5E5E5',
          }}
        >
          <p dir="rtl" className="font-fs">
            <span className="font-semibold">تنويه:</span> VeriJournals مشروع شخصي مستقل لأغراض استرشادية أكاديمية، غير مرتبط بأي جهة حكومية. المؤشرات منقولة من مصادرها المُعلَنة كما هي وقد تحتوي على أخطاء أو تأخير. المخرجات لا تُعتبر حكماً قطعياً ولا تُغني عن المراجعة المستقلة. للاعتراض على تصنيف:{' '}
            <a href="/report-discrepancy" className="underline" style={{ color: '#0B4644' }}>/report-discrepancy</a>
            . باستخدامك للمنصة توافق على{' '}
            <a href="/terms" className="underline" style={{ color: '#0B4644' }}>الشروط</a>.
          </p>
          <p lang="en" className="mt-1" style={{ color: '#666' }}>
            VeriJournals is an independent personal project for advisory academic purposes, not affiliated with any government entity. Indicators are passed through from their declared sources as-is and may contain errors or delays. Outputs are not definitive judgments and do not replace independent review. Disputes:{' '}
            <a href="/report-discrepancy" className="underline" style={{ color: '#0B4644' }}>/report-discrepancy</a>
            . Use constitutes acceptance of the{' '}
            <a href="/terms" className="underline" style={{ color: '#0B4644' }}>Terms</a>.
          </p>
        </div>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
