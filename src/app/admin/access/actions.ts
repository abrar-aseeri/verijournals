'use server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdmin } from '@/lib/supabase'

export type ActionResult = {
  ok: boolean
  message_ar?: string
  message_en?: string
}

async function requireAdmin(): Promise<{ user_id: string } | { error: string }> {
  const session = await createSupabaseServer()
  const {
    data: { user },
  } = await session.auth.getUser()
  if (!user) return { error: 'unauthenticated' }

  const admin = getAdmin()
  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .maybeSingle()
  if (!profile || profile.role !== 'admin') {
    return { error: 'forbidden' }
  }
  return { user_id: user.id }
}

const FORBIDDEN: ActionResult = {
  ok: false,
  message_ar: 'غير مصرَّح لك بالوصول.',
  message_en: 'Access denied.',
}

export async function approveRequest(formData: FormData): Promise<ActionResult> {
  const gate = await requireAdmin()
  if ('error' in gate) return FORBIDDEN

  const requestId = String(formData.get('request_id') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim() || null
  if (!requestId) {
    return { ok: false, message_en: 'Missing request id' }
  }

  const admin = getAdmin()
  const { data: row, error: fetchErr } = await admin
    .from('access_requests')
    .select('id, email, status')
    .eq('id', requestId)
    .maybeSingle()
  if (fetchErr || !row) {
    return { ok: false, message_en: 'Request not found' }
  }
  if (row.status !== 'pending') {
    return { ok: false, message_en: `Request is already ${row.status}` }
  }

  const email = row.email.toLowerCase()

  // Step 1: upsert into allowed_users.
  const { error: allowErr } = await admin
    .from('allowed_users')
    .upsert(
      {
        email,
        approved_from_request: row.id,
        approved_by: gate.user_id,
        notes,
        revoked_at: null,
      },
      { onConflict: 'email' },
    )
  if (allowErr) {
    console.error('[admin/access:approve] allowed_users upsert failed:', allowErr.message)
    return { ok: false, message_en: `Allowlist write failed: ${allowErr.message}` }
  }

  // Step 2: mark the request approved.
  const { error: reqErr } = await admin
    .from('access_requests')
    .update({
      status: 'approved',
      reviewed_by: gate.user_id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq('id', requestId)
  if (reqErr) {
    console.error('[admin/access:approve] request update failed:', reqErr.message)
  }

  // Step 3: send the magic link. Derive origin from headers so we work
  // across deploy environments.
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const host = h.get('host')
  if (host) {
    const origin = `${proto}://${host}`
    const { error: otpErr } = await admin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        shouldCreateUser: true,
      },
    })
    if (otpErr) {
      console.error('[admin/access:approve] signInWithOtp failed:', otpErr.message)
    }
  } else {
    console.warn('[admin/access:approve] no host header; magic link not sent')
  }

  revalidatePath('/admin/access')
  return {
    ok: true,
    message_ar: 'تمت الموافقة وأُرسل رابط الدخول.',
    message_en: 'Approved. Magic link sent.',
  }
}

export async function rejectRequest(formData: FormData): Promise<ActionResult> {
  const gate = await requireAdmin()
  if ('error' in gate) return FORBIDDEN

  const requestId = String(formData.get('request_id') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim() || null
  if (!requestId) return { ok: false, message_en: 'Missing request id' }

  const admin = getAdmin()
  const { error } = await admin
    .from('access_requests')
    .update({
      status: 'rejected',
      reviewed_by: gate.user_id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq('id', requestId)
    .eq('status', 'pending')

  if (error) {
    console.error('[admin/access:reject] update failed:', error.message)
    return { ok: false, message_en: `Update failed: ${error.message}` }
  }

  revalidatePath('/admin/access')
  return {
    ok: true,
    message_ar: 'تم رفض الطلب.',
    message_en: 'Request rejected.',
  }
}

export async function revokeAccess(email: string): Promise<ActionResult> {
  const gate = await requireAdmin()
  if ('error' in gate) return FORBIDDEN
  if (!email) return { ok: false, message_en: 'No email provided' }

  const admin = getAdmin()
  const { error } = await admin
    .from('allowed_users')
    .update({ revoked_at: new Date().toISOString() })
    .eq('email', email.toLowerCase())
    .is('revoked_at', null)

  if (error) {
    console.error('[admin/access:revoke] update failed:', error.message)
    return { ok: false, message_en: `Revoke failed: ${error.message}` }
  }

  revalidatePath('/admin/access')
  return {
    ok: true,
    message_ar: 'تم إلغاء الوصول.',
    message_en: 'Access revoked.',
  }
}
