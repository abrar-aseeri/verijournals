import { Suspense } from 'react'
import SearchResults from './SearchResults'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin"/>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
