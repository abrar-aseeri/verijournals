import SearchHero from '@/components/search/SearchHero'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function CheckCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="10" fill="#43A047" />
      <path
        d="M6.5 11.5l3 3 6-6"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SearchHero />
        <section
          dir="rtl"
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #E5E5E5',
            borderBottom: '1px solid #E5E5E5',
            padding: '40px 24px',
          }}
          className="w-full"
        >
          <div className="max-w-3xl mx-auto flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle />
              <CheckCircle />
              <CheckCircle />
            </div>
            <p
              style={{ color: '#1B5E20', fontWeight: 700, fontSize: '20px', margin: 0 }}
            >
              +30,743 مجلة علمية في قاعدة البيانات
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
