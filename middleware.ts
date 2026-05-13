import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Closed-beta gate.
//
// Tier 1 — Public (anyone can reach without a session):
//   /, /login, /privacy, /terms, /api/auth/*, /api/request-access,
//   /api/cron, plus the Next.js static asset paths.
//
// Tier 2 — Authenticated-but-not-yet-consented (gets through to the
// consent interstitial only):
//   /onboarding/consent, /api/auth/grant-initial-consents.
//
// Tier 3 — Authenticated + consented (everything else, including
// /admin/* which is further gated by admin/layout.tsx).
//
// Any unauthenticated request to a Tier 3 path → 302 redirect to /.
// Any authenticated-without-consent request to a Tier 3 path → 302 to
// /onboarding/consent.

const PUBLIC_EXACT = new Set<string>([
  '/',
  '/login',
  '/privacy',
  '/terms',
])

const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/api/request-access',
  '/api/cron',
  '/auth/callback',
  '/_next/',
  '/branding/',
  '/favicon',
]

const POST_AUTH_ALLOWED_EXACT = new Set<string>([
  '/onboarding/consent',
])

const POST_AUTH_ALLOWED_PREFIXES = [
  '/api/auth/grant-initial-consents',
]

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

function isPostAuthAllowed(pathname: string): boolean {
  if (POST_AUTH_ALLOWED_EXACT.has(pathname)) return true
  return POST_AUTH_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // From here the request is authenticated. The consent interstitial
  // routes are reachable without consent so the user can grant it.
  if (isPostAuthAllowed(pathname)) return res

  // Consent check. Fail-open if the table doesn't exist yet (migration
  // unapplied) — that way dev/prod aren't bricked before the schema is
  // in place.
  try {
    const { data, error } = await supabase
      .from('consent_records')
      .select('consent_type')
      .eq('user_id', user.id)
      .eq('granted', true)
      .is('withdrawn_at', null)
      .in('consent_type', ['terms_and_privacy', 'pdpl_acknowledgment'])

    if (error) {
      console.warn('[middleware] consent check skipped:', error.message)
      return res
    }

    const granted = new Set((data ?? []).map((r) => r.consent_type))
    if (
      !granted.has('terms_and_privacy') ||
      !granted.has('pdpl_acknowledgment')
    ) {
      const nextParam = pathname && pathname !== '/'
        ? `?next=${encodeURIComponent(pathname)}`
        : ''
      return NextResponse.redirect(
        new URL(`/onboarding/consent${nextParam}`, req.url),
      )
    }
  } catch (e) {
    console.warn('[middleware] consent check exception:', e)
    return res
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|branding|api/cron).*)'],
}
