import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MIN_REASON = 50
const MAX_REASON = 500

type Body = {
  full_name?: string
  email?: string
  institution?: string
  specialty?: string
  reason?: string
  saudi_residence_confirmed?: boolean
  pdpl_acknowledged?: boolean
}

function trim(s: unknown, max?: number): string {
  const t = String(s ?? '').trim()
  return max ? t.slice(0, max) : t
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const full_name = trim(body.full_name, 200)
  const email = trim(body.email, 320).toLowerCase()
  const institution = trim(body.institution, 300)
  const specialty = trim(body.specialty, 200)
  const reason = trim(body.reason, MAX_REASON)
  const saudi_residence_confirmed = !!body.saudi_residence_confirmed
  const pdpl_acknowledged = !!body.pdpl_acknowledged

  if (!full_name || !institution || !specialty) {
    return NextResponse.json(
      {
        error: 'missing_fields',
        message_ar: 'حقول مطلوبة غير مكتملة',
        message_en: 'Required fields missing',
      },
      { status: 400 },
    )
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      {
        error: 'invalid_email',
        message_ar: 'البريد الإلكتروني غير صالح',
        message_en: 'Invalid email address',
      },
      { status: 400 },
    )
  }
  if (reason.length < MIN_REASON || reason.length > MAX_REASON) {
    return NextResponse.json(
      {
        error: 'invalid_reason',
        message_ar: `سبب الطلب يجب أن يكون بين ${MIN_REASON} و${MAX_REASON} حرفاً`,
        message_en: `Reason must be between ${MIN_REASON} and ${MAX_REASON} characters`,
      },
      { status: 400 },
    )
  }
  if (!saudi_residence_confirmed || !pdpl_acknowledged) {
    return NextResponse.json(
      {
        error: 'acknowledgments_missing',
        message_ar: 'الإقرارات الإلزامية لم تُعطَ',
        message_en: 'Required acknowledgments not given',
      },
      { status: 400 },
    )
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
  const ua = req.headers.get('user-agent') || null

  const admin = getAdmin()
  const { error } = await admin.from('access_requests').insert({
    full_name,
    email,
    institution,
    specialty,
    reason,
    saudi_residence_confirmed,
    pdpl_acknowledged,
    ip_address: ip,
    user_agent: ua,
  })

  if (error) {
    console.error('[request-access] insert failed:', error.message)
    // Placeholder admin notification — Resend not yet configured.
    console.log('[request-access] new request received from', email)
    return NextResponse.json(
      {
        error: 'submit_failed',
        message_ar: 'تعذّر إرسال الطلب. حاول لاحقاً.',
        message_en: 'Could not submit request. Please try again later.',
      },
      { status: 500 },
    )
  }

  console.log('[request-access] new request stored for', email)
  return NextResponse.json({ ok: true })
}
