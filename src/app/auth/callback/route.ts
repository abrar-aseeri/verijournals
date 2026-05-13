import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }

  const supabase = await createSupabaseServer()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  const email = user.email.toLowerCase()
  const admin = getAdmin()

  // Defensive re-check against the allowlist. If the email is not (or
  // no longer) on the allowlist, sign out and bounce. If the
  // allowed_users table doesn't exist yet (migration unapplied) we fail
  // open here so dev environments aren't bricked.
  try {
    const { data: allowed, error: allowErr } = await admin
      .from('allowed_users')
      .select('email, activated_at, revoked_at')
      .eq('email', email)
      .maybeSingle()
    if (!allowErr && (allowed === null || allowed.revoked_at !== null)) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=not_invited`)
    }
    if (!allowErr && allowed && !allowed.activated_at) {
      await admin
        .from('allowed_users')
        .update({ activated_at: new Date().toISOString() })
        .eq('email', email)
    }
  } catch (e) {
    console.warn('[auth/callback] allowlist check skipped:', e)
  }

  // Consent gate: if the user has not granted the two required consents,
  // route them through /onboarding/consent. Fail-open if the table is
  // missing (consent_records migration unapplied).
  try {
    const { data: consents, error: consentErr } = await admin
      .from('consent_records')
      .select('consent_type')
      .eq('user_id', user.id)
      .eq('granted', true)
      .is('withdrawn_at', null)
      .in('consent_type', ['terms_and_privacy', 'pdpl_acknowledgment'])
    if (!consentErr) {
      const granted = new Set((consents ?? []).map((r) => r.consent_type))
      if (
        !granted.has('terms_and_privacy') ||
        !granted.has('pdpl_acknowledgment')
      ) {
        const nextParam = next && next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
        return NextResponse.redirect(`${origin}/onboarding/consent${nextParam}`)
      }
    }
  } catch (e) {
    console.warn('[auth/callback] consent check skipped:', e)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
