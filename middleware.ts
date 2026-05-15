import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

// Closed-beta gate. Next.js 16 renamed `middleware.ts` to `proxy.ts`;
// this file is the canonical edge proxy for the platform.
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
// including /admin/* which is further gated by an admin role check at
// the bottom of this function and by src/app/admin/layout.tsx).
//
// Unauthenticated → / (no URL exposure of protected paths).
// Revoked allowlist entry → sign out → /.
// Authenticated but no consent → /onboarding/consent.
// Authenticated + consent OK + outside KSA + not geo_exempt → /blocked.
// Authenticated + consent OK + on /admin/* but role !== 'admin' → /.

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) return NextResponse.next({ request })

  const response = NextResponse.next({ request })
  const session = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await session.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (isPostAuthAllowed(pathname)) return response

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
      console.warn('[proxy] allowed_users lookup skipped:', error.message)
    } else if (allowed === null) {
      allowedUserMissing = true
    } else {
      geoExempt = !!allowed.geo_exempt
      revoked = allowed.revoked_at !== null
    }
  } catch (e) {
    console.warn('[proxy] allowed_users exception:', e)
  }

  if (revoked || allowedUserMissing) {
    await session.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Geo check. Vercel injects `x-vercel-ip-country` on every request in
  // its Edge network. Locally / in non-Vercel runtimes the header is
  // absent — we fail-open in that case so dev environments work.
  if (!geoExempt) {
    const country = request.headers.get('x-vercel-ip-country')
    if (country && country !== 'SA') {
      const url = request.nextUrl.clone()
      url.pathname = '/blocked'
      url.search = ''
      return NextResponse.redirect(url)
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
      console.warn('[proxy] consent check skipped:', error.message)
    } else {
      const granted = new Set((data ?? []).map((r) => r.consent_type))
      if (
        !granted.has('terms_and_privacy') ||
        !granted.has('pdpl_acknowledgment')
      ) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding/consent'
        url.search = pathname && pathname !== '/'
          ? `?next=${encodeURIComponent(pathname)}`
          : ''
        return NextResponse.redirect(url)
      }
    }
  } catch (e) {
    console.warn('[proxy] consent check exception:', e)
  }

  // Admin role check (preserved from the original proxy.ts). Layered on
  // top of src/app/admin/layout.tsx — both layers redirect non-admins
  // to /, so they reinforce each other. The layout adds a per-page
  // server-component check; this proxy stop catches the request earlier
  // and avoids any admin page render starting for non-admins.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const { data: profile } = await session
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .maybeSingle()
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|branding|api/cron).*)'],
}
