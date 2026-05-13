import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; reason?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const name = body.name ? String(body.name).trim().slice(0, 200) : null
  const reason = body.reason ? String(body.reason).trim().slice(0, 2000) : null

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

  const admin = getAdmin()
  const { error } = await admin
    .from('access_requests')
    .insert({ email, name, reason })

  if (error) {
    console.error('[request-access] insert failed:', error.message)
    return NextResponse.json(
      {
        error: 'submit_failed',
        message_ar: 'تعذّر إرسال الطلب. حاول لاحقاً.',
        message_en: 'Could not submit request. Please try again later.',
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
