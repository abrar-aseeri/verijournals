// Runtime shim for src/types/index.ts when imported by Node's type-stripping
// loader. The original file exports only TypeScript types/interfaces, which
// Node erases — leaving no runtime exports. Node still resolves value
// imports (e.g. `import { JournalIndexing } from '@/types'` in scoring.ts),
// so we provide undefined placeholders so the import doesn't throw.
// These names are only used as type annotations in source; they have no
// runtime semantics.

export const TrustStatus = undefined
export const AvailabilityStatus = undefined
export const ArticleStatus = undefined
export const Language = undefined
export const Journal = undefined
export const JournalMetric = undefined
export const JournalIndexing = undefined
export const Article = undefined
export const User = undefined
export const SearchResult = undefined
