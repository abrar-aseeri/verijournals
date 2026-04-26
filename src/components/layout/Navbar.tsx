'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  return (
    <nav style={{ background: '#0A1628' }} className="w-full px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div style={{ background: '#00A05A' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#fff" strokeWidth="1.5" fill="none"/>
            <path d="M10 2v18M3 6l7 4 7-4" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="text-white font-bold text-base leading-none">
            Veri<span style={{ color: '#5DD9A4' }}>Journals</span>
          </div>
          <div className="text-xs leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {lang === 'ar' ? 'معهد الأبحاث والابتكار — وزارة الدفاع' : 'Research & Innovation Institute — MOD'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <Link href="/" className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {lang === 'ar' ? 'البحث' : 'Search'}
        </Link>
        <Link href="/about" className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {lang === 'ar' ? 'عن المنصة' : 'About'}
        </Link>
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="text-xs px-3 py-1 rounded-full border"
          style={{ color: '#5DD9A4', borderColor: 'rgba(93,217,164,0.3)' }}
        >
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-1.5 rounded-lg"
          style={{ background: '#00A05A', color: '#fff' }}
        >
          {lang === 'ar' ? 'دخول' : 'Login'}
        </Link>
      </div>
    </nav>
  )
}
