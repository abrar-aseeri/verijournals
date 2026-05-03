import SearchHero from '@/components/search/SearchHero'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SearchHero />
        <section
          dir="rtl"
          style={{ background: '#F5F5F5', padding: '40px 24px' }}
          className="w-full text-center"
        >
          <p style={{ color: '#1B5E20', fontWeight: 700, fontSize: '20px' }}>
            +30,743 مجلة علمية في قاعدة البيانات
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
