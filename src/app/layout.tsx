import type { Metadata } from 'next'
import { Cairo, DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

export const metadata: Metadata = {
  title: 'VeriJournals — Journal Verification Platform',
  description: 'Verify scientific journals and articles. Powered by the Research & Innovation Institute — Ministry of Defense.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${dmSans.variable} ${cairo.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
