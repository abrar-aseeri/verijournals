import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdmin } from '@/lib/supabase'
import { PRIVACY_NOTICE_VERSION } from '@/lib/privacy'

export const dynamic = 'force-dynamic'

const CONSENT_TYPES = [
  'terms_and_privacy',
  'pdpl_acknowledgment',
  'cross_border_transfer',
  'marketing_emails',
  'anonymized_analytics',
] as const

type Consents = Record<(typeof CONSENT_TYPES)[number], boolean>

export async function POST(req: NextRequest) {
  let body: { consents?: Partial<Consents> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const session = await createSupabaseServer()
  const {
    data: { user },
  } = await session.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const consents = body.consents ?? {}
  if (!consents.terms_and_privacy || !consents.pdpl_acknowledgment) {
    return NextResponse.json(
      {
        error: 'required_consents_missing',
        message_ar: 'الموافقات الإلزامية لم تُمنح',
        message_en: 'Required consents not granted',
      },
      { status: 400 },
    )
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
  const ua = req.headers.get('user-agent') || null

  const rows = CONSENT_TYPES.map((t) => ({
    user_id: user.id,
    consent_type: t,
    granted: !!(consents as Consents)[t],
    privacy_notice_version: PRIVACY_NOTICE_VERSION,
    ip_address: ip,
    user_agent: ua,
  }))

  const admin = getAdmin()
  const { error } = await admin.from('consent_records').insert(rows)
  if (error) {
    console.error('[record-consent] insert failed:', error.message)
    return NextResponse.json(
      {
        error: 'insert_failed',
        message_en: 'Could not record consents. Please try again.',
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
