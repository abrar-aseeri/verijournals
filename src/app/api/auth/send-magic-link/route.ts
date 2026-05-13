import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Neutral response (same shape for allowed and not-allowed emails) to
// prevent enumeration. The client renders the same message regardless.
const NEUTRAL = NextResponse.json({ ok: true })

export async function POST(req: NextRequest) {
  let email = ''
  try {
    const body = await req.json()
    email = String(body?.email ?? '').trim().toLowerCase()
  } catch {
    return NEUTRAL
  }
  if (!email) return NEUTRAL

  const admin = getAdmin()

  // Gate: is this email on the allowlist AND not revoked?
  // If the allowed_users table does not yet exist (migration not applied
  // to this environment), fail closed — no link is sent.
  const { data: allowed, error } = await admin
    .from('allowed_users')
    .select('email, revoked_at')
    .eq('email', email)
    .is('revoked_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[send-magic-link] allowed_users lookup failed:', error.message)
    return NEUTRAL
  }
  if (!allowed) return NEUTRAL

  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const redirectTo = `${origin}/auth/callback`

  const { error: otpErr } = await admin.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  })
  if (otpErr) {
    console.error('[send-magic-link] signInWithOtp failed:', otpErr.message)
  }
  return NEUTRAL
}
