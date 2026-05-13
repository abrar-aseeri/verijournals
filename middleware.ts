import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

// Closed-beta gate.
//
// Tier 1 — Public (anyone can reach without a session):
//   /, /login, /request-access, /privacy, /terms, /api/auth/*,
//   /api/request-access, /api/cron, /auth/callback, plus Next.js
//   static asset paths.
//
// Tier 2 — Authenticated-but-not-yet-consented (reachable so the user
// can complete the consent interstitial):
//   /onboarding/consent, /api/auth/grant-initial-consents.
//
// Tier 3 — Authenticated + consented + Saudi-located (everything else,
// including /admin/* which is further gated by admin/layout.tsx).
//
// Unauthenticated → / (no URL exposure of protected paths).
// Revoked allowlist entry → sign out → /.
// Authenticated but no consent → /onboarding/consent.
// Authenticated + consent OK + outside KSA + not geo_exempt → /blocked.

const PUBLIC_EXACT = new Set<string>([
  '/',
  '/login',
  '/privacy',
  '/terms',
  '/request-access',
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
  '/blocked',
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
  const session = createServerClient(
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
  } = await session.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isPostAuthAllowed(pathname)) return res

  // Service-role client for the allowlist + geo_exempt check. The
  // allowed_users table is service-role-only under RLS, so the user
  // session cannot read it directly.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  let geoExempt = false
  let revoked = false
  let allowedUserMissing = false
  try {
    const { data: allowed, error } = await admin
      .from('allowed_users')
      .select('geo_exempt, revoked_at')
      .eq('email', user.email!.toLowerCase())
      .maybeSingle()
    if (error) {
      console.warn('[middleware] allowed_users lookup skipped:', error.message)
    } else if (allowed === null) {
      allowedUserMissing = true
    } else {
      geoExempt = !!allowed.geo_exempt
      revoked = allowed.revoked_at !== null
    }
  } catch (e) {
    console.warn('[middleware] allowed_users exception:', e)
  }

  if (revoked || allowedUserMissing) {
    // Revoked invitee or session whose allowlist entry no longer exists.
    // (Fail-open if the table itself is missing — the error branch above
    //  leaves both flags false.)
    await session.auth.signOut()
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Geo check. Vercel injects `x-vercel-ip-country` on every request in
  // its Edge network. Locally / in non-Vercel runtimes the header is
  // absent — we fail-open in that case so dev environments work.
  if (!geoExempt) {
    const country = req.headers.get('x-vercel-ip-country')
    if (country && country !== 'SA') {
      return NextResponse.redirect(new URL('/blocked', req.url))
    }
  }

  // Consent check (user-session client — RLS allows users to read their
  // own consent_records).
  try {
    const { data, error } = await session
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
