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
          dir="rtl"
          className="w-full text-center py-1.5 px-4 text-xs"
          style={{
            background: '#F5F5F5',
            color: '#555555',
            fontWeight: 500,
            borderBottom: '1px solid #E5E5E5',
          }}
        >
          الموقع في مرحلة تجريبية — جميع البيانات للاستئناس فقط
        </div>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
