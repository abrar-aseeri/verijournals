import Link from 'next/link'

export default function Navbar() {
  return (
    <header
      dir="rtl"
      className="w-full bg-white shadow-sm font-fs"
      style={{ height: '64px' }}
    >
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          { /* eslint-disable-next-line @next/next/no-img-element */ }
          <img
            src="/branding/verijournals_icon_256.png"
            alt="VeriJournals"
            style={{ height: 36, width: 'auto' }}
          />
          <span style={{ color: '#0B4644', fontWeight: 700, fontSize: '20px' }}>
            VeriJournals
          </span>
        </Link>

        <ul className="flex items-center" style={{ fontWeight: 500, fontSize: '14px', gap: '32px' }}>
          <li>
            <Link
              href="/"
              className="transition-colors"
              style={{ color: '#6B7280' }}
            >
              <span className="hover:text-[#0B4644]">الرئيسية</span>
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="transition-colors"
              style={{ color: '#6B7280' }}
            >
              <span className="hover:text-[#0B4644]">من نحن</span>
            </Link>
          </li>
          <li>
            <a
              href="mailto:abrar.aseeri@hotmail.com"
              className="transition-colors"
              style={{ color: '#6B7280' }}
            >
              <span className="hover:text-[#0B4644]">تواصل معنا</span>
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
