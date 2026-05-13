import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Paths that authenticated users can access regardless of consent status.
// /admin is explicitly allowlisted so the operator does not lock themselves
// out before backfilling their own consent rows.
const ALLOWED_EXACT = new Set<string>([
  '/',
  '/login',
  '/register',
  '/register/complete',
  '/privacy',
  '/terms',
])

const ALLOWED_PREFIXES = [
  '/admin',
  '/api/auth/',
  '/api/cron',
  '/_next/',
  '/branding/',
  '/favicon',
]

function isAllowed(pathname: string): boolean {
  if (ALLOWED_EXACT.has(pathname)) return true
  return ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isAllowed(pathname)) return NextResponse.next()

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
  if (!user) return res

  // Fail-open if consent_records table is missing (migration not yet applied
  // to this environment). When the table exists but the user has no granted,
  // non-withdrawn rows for both required consent_types → redirect.
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
    if (!granted.has('terms_and_privacy') || !granted.has('pdpl_acknowledgment')) {
      return NextResponse.redirect(new URL('/register/complete', req.url))
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
