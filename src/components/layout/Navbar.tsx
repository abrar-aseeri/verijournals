import Link from 'next/link'

export default function Navbar() {
  return (
    <nav
      dir="rtl"
      style={{ background: '#1B5E20', borderBottom: '3px solid #4CAF50' }}
      className="w-full px-6 h-16 flex items-center"
    >
      <Link
        href="/"
        className="text-white text-xl tracking-wide"
        style={{ fontWeight: 700, fontFamily: 'Saudi-MoD, system-ui, sans-serif' }}
      >
        VeriJournals
      </Link>
    </nav>
  )
}
