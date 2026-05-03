import Link from 'next/link'

export default function Navbar() {
  return (
    <>
      <header
        dir="rtl"
        style={{ background: '#FFFFFF', borderBottom: '3px solid #2E7D32', height: '100px' }}
        className="w-full px-6 flex items-center"
      >
        <Link
          href="/"
          style={{ color: '#1B5E20', fontWeight: 700, fontSize: '24px' }}
        >
          VeriJournals
        </Link>
      </header>

      <nav
        dir="rtl"
        style={{ background: '#2E7D32', height: '44px' }}
        className="w-full px-6 flex items-center"
      >
        <ul className="flex items-center text-white" style={{ fontWeight: 500, fontSize: '15px', gap: '40px' }}>
          <li><Link href="/" className="hover:opacity-80 transition-opacity">الرئيسية</Link></li>
          <li><Link href="/about" className="hover:opacity-80 transition-opacity">من نحن</Link></li>
          <li><a href="mailto:abrar.aseeri@hotmail.com" className="hover:opacity-80 transition-opacity">تواصل معنا</a></li>
        </ul>
      </nav>
    </>
  )
}
