import SearchHero from '@/components/search/SearchHero'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <header
        style={{ background: '#1B5E20', borderBottom: '4px solid #4CAF50' }}
        className="w-full py-12 px-6 text-center"
      >
        <h1
          dir="rtl"
          className="text-3xl md:text-4xl leading-tight"
          style={{ color: '#FFFFFF', fontWeight: 700 }}
        >
          بوابة التحقق من المجلات العلمية
        </h1>
        <div
          className="mt-4 inline-block px-4 py-1.5 rounded-full text-xs tracking-wider"
          style={{ background: '#FFFFFF', color: '#1B5E20', fontWeight: 600 }}
        >
          VeriJournals — Scientific Journal Verification Portal
        </div>
      </header>
      <main className="flex-1">
        <SearchHero />
      </main>
      <Footer />
    </>
  )
}
