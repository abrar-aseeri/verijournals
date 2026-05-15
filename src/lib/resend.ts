import { Resend } from 'resend'

const ADMIN_EMAIL = 'abrar.aseeri@gmail.com'
// Resend's testing sender — swap for a verified domain when one is set up.
const FROM_EMAIL = 'VeriJournals <onboarding@resend.dev>'
const REVIEW_URL = 'https://verijournals.vercel.app/admin/access?tab=pending'

export type AccessRequestNotification = {
  full_name: string
  email: string
  institution?: string | null
  specialty?: string | null
  reason?: string | null
  ip_address?: string | null
  requested_at: string
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[resend] RESEND_API_KEY not set; skipping notification')
    return null
  }
  return new Resend(key)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderHtml(req: AccessRequestNotification): string {
  const safe = {
    full_name: escapeHtml(req.full_name),
    email: escapeHtml(req.email),
    institution: req.institution ? escapeHtml(req.institution) : '—',
    specialty: req.specialty ? escapeHtml(req.specialty) : '—',
    reason: req.reason
      ? escapeHtml(req.reason.length > 200 ? req.reason.slice(0, 200) + '…' : req.reason)
      : '—',
    ip: req.ip_address ? escapeHtml(req.ip_address) : '—',
    when: escapeHtml(req.requested_at),
  }

  return `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, Segoe UI, sans-serif; color: #0B4644; max-width: 640px; margin: 0 auto; padding: 24px;">
    <h2 dir="rtl" style="color: #0B4644; margin: 0 0 4px 0;">طلب وصول جديد — VeriJournals</h2>
    <h3 lang="en" style="color: #6B7280; font-weight: 500; margin: 0 0 20px 0;">New access request — VeriJournals</h3>

    <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
      <tr><td style="padding: 6px 8px; color: #6B7280; width: 40%;">Name / الاسم</td><td style="padding: 6px 8px; color: #0B4644;"><strong>${safe.full_name}</strong></td></tr>
      <tr><td style="padding: 6px 8px; color: #6B7280;">Email / البريد</td><td style="padding: 6px 8px; color: #0B4644;"><a href="mailto:${safe.email}" style="color: #05A854;">${safe.email}</a></td></tr>
      <tr><td style="padding: 6px 8px; color: #6B7280;">Institution / المؤسسة</td><td style="padding: 6px 8px; color: #0B4644;">${safe.institution}</td></tr>
      <tr><td style="padding: 6px 8px; color: #6B7280;">Specialty / التخصص</td><td style="padding: 6px 8px; color: #0B4644;">${safe.specialty}</td></tr>
      <tr><td style="padding: 6px 8px; color: #6B7280;">Reason / السبب</td><td style="padding: 6px 8px; color: #0B4644;">${safe.reason}</td></tr>
      <tr><td style="padding: 6px 8px; color: #6B7280;">IP / عنوان IP</td><td style="padding: 6px 8px; color: #0B4644; font-family: monospace;">${safe.ip}</td></tr>
      <tr><td style="padding: 6px 8px; color: #6B7280;">Time / الوقت</td><td style="padding: 6px 8px; color: #0B4644; font-family: monospace;">${safe.when}</td></tr>
    </table>

    <p style="margin: 24px 0;">
      <a href="${REVIEW_URL}" style="display: inline-block; background: #05A854; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        مراجعة الطلبات المعلقة · Review pending requests
      </a>
    </p>

    <p style="color: #B2BEC4; font-size: 12px; margin-top: 32px;">
      This is an automated notification from the VeriJournals closed-beta platform.
    </p>
  </body>
</html>`
}

export async function sendAccessRequestNotification(req: AccessRequestNotification): Promise<void> {
  const resend = getResend()
  if (!resend) return

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: 'طلب وصول جديد — VeriJournals access request',
      html: renderHtml(req),
    })
    if (error) {
      console.error('[resend] send error', error)
    }
  } catch (e) {
    console.error('[resend] exception', e)
  }
}
