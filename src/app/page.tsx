import SearchHero from '@/components/search/SearchHero'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SearchHero />
      </main>
      <Footer />
    </>
  )
}
