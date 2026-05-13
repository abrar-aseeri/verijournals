import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase'
import { PRIVACY_NOTICE_VERSION } from '@/lib/privacy'

export const dynamic = 'force-dynamic'

type Consents = {
  terms_and_privacy: boolean
  pdpl_acknowledgment: boolean
  cross_border_transfer: boolean
  marketing_emails: boolean
  anonymized_analytics: boolean
}

type Body = {
  email?: string
  password?: string
  full_name?: string
  employee_id?: string | null
  hospital_name?: string | null
  specialty?: string | null
  consents?: Partial<Consents>
}

const CONSENT_TYPES = [
  'terms_and_privacy',
  'pdpl_acknowledgment',
  'cross_border_transfer',
  'marketing_emails',
  'anonymized_analytics',
] as const

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { email, password, full_name, employee_id, hospital_name, specialty, consents } = body
  if (!email || !password || !full_name) {
    return NextResponse.json(
      {
        error: 'missing_fields',
        message_ar: 'حقول التسجيل المطلوبة غير مكتملة',
        message_en: 'Required registration fields missing',
      },
      { status: 400 },
    )
  }

  if (!consents?.terms_and_privacy || !consents?.pdpl_acknowledgment) {
    return NextResponse.json(
      {
        error: 'required_consents_missing',
        message_ar: 'الموافقات الإلزامية لم تُمنح',
        message_en: 'Required consents not granted',
      },
      { status: 400 },
    )
  }

  const admin = getAdmin()

  const { data: signupData, error: signupErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })
  if (signupErr || !signupData.user) {
    return NextResponse.json(
      {
        error: 'signup_failed',
        message_en: signupErr?.message ?? 'Sign-up failed',
      },
      { status: 400 },
    )
  }
  const userId = signupData.user.id

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
  const ua = req.headers.get('user-agent') || null

  const rows = CONSENT_TYPES.map((t) => ({
    user_id: userId,
    consent_type: t,
    granted: !!(consents as Consents)[t],
    privacy_notice_version: PRIVACY_NOTICE_VERSION,
    ip_address: ip,
    user_agent: ua,
  }))

  const { error: insertErr } = await admin.from('consent_records').insert(rows)
  if (insertErr) {
    console.error('[register-with-consent] consent insert failed; rolling back auth user', insertErr)
    const { error: rollbackErr } = await admin.auth.admin.deleteUser(userId)
    if (rollbackErr) {
      console.error('[register-with-consent] rollback auth.admin.deleteUser failed', rollbackErr)
    }
    return NextResponse.json(
      {
        error: 'consent_insert_failed',
        message_ar: 'تعذّر حفظ الموافقات. أُلغي إنشاء الحساب.',
        message_en: 'Could not record consents. Account creation rolled back.',
      },
      { status: 500 },
    )
  }

  // Mirror to public.users (matches the existing register flow's client-side upsert).
  const { error: usersErr } = await admin
    .from('users')
    .upsert(
      {
        auth_id: userId,
        full_name,
        email,
        employee_id: employee_id || null,
        hospital_name: hospital_name || null,
        specialty: specialty || null,
      },
      { onConflict: 'auth_id' },
    )
  if (usersErr) {
    console.warn('[register-with-consent] public.users upsert failed (non-fatal)', usersErr)
  }

  return NextResponse.json({ ok: true, user_id: userId })
}
