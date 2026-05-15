'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase'

type ConsentKey =
  | 'terms_and_privacy'
  | 'pdpl_acknowledgment'
  | 'cross_border_transfer'
  | 'marketing_emails'
  | 'anonymized_analytics'

type Consents = Record<ConsentKey, boolean>

const INITIAL: Consents = {
  terms_and_privacy: false,
  pdpl_acknowledgment: false,
  cross_border_transfer: false,
  marketing_emails: false,
  anonymized_analytics: false,
}

export default function ConsentForm({ next }: { next: string }) {
  const router = useRouter()
  const [consents, setConsents] = useState<Consents>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const requiredGranted =
    consents.terms_and_privacy && consents.pdpl_acknowledgment

  function toggle(key: ConsentKey) {
    setConsents((p) => ({ ...p, [key]: !p[key] }))
  }

  async function submit() {
    if (!requiredGranted) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/auth/grant-initial-consents', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ consents }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message_en ?? json.error ?? 'Submission failed')
        setSubmitting(false)
        return
      }
      router.push(next || '/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
      setSubmitting(false)
    }
  }

  async function cancel() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}
      <ConsentSection title={{ ar: 'موافقات إلزامية', en: 'Required Consents' }} barColor="#DC2626">
        <ConsentRow
          checked={consents.terms_and_privacy}
          onToggle={() => toggle('terms_and_privacy')}
          barColor="#DC2626"
          badge={{ ar: 'إلزامي', en: 'Required', color: '#DC2626' }}
          ar="أوافق على شروط الاستخدام و إشعار الخصوصية."
          en="I agree to the Terms of Service and Privacy Notice."
          linksBelow={
            <>
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: '#0B4644' }}
              >
                <span dir="rtl" className="font-fs">اطلع على الشروط</span>
                <span className="mx-0.5">/</span>
                <span lang="en">Read Terms</span>
              </Link>
              <span className="mx-1.5 opacity-40">·</span>
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: '#0B4644' }}
              >
                <span dir="rtl" className="font-fs">اطلع على إشعار الخصوصية</span>
                <span className="mx-0.5">/</span>
                <span lang="en">Read Privacy</span>
              </Link>
            </>
          }
        />
        <ConsentRow
          checked={consents.pdpl_acknowledgment}
          onToggle={() => toggle('pdpl_acknowledgment')}
          barColor="#DC2626"
          badge={{ ar: 'إلزامي', en: 'Required', color: '#DC2626' }}
          ar="أُقرّ بأن المنصة تعمل ضمن نظام حماية البيانات الشخصية السعودي وأن بياناتي تُعالَج وفق المادة 6 من النظام."
          en="I acknowledge that the platform operates under the Saudi Personal Data Protection Law (PDPL) and that my data is processed under Article 6 of the law."
        />
      </ConsentSection>

      <ConsentSection title={{ ar: 'موافقات اختيارية', en: 'Optional' }} barColor="#B2BEC4">
        <ConsentRow
          checked={consents.cross_border_transfer}
          onToggle={() => toggle('cross_border_transfer')}
          barColor="#B2BEC4"
          badge={{ ar: 'اختياري', en: 'Optional', color: '#B2BEC4' }}
          ar="أوافق على معالجة بياناتي على بنية تحتية سحابية مستضافة خارج المملكة (Vercel — الولايات المتحدة، Supabase) مع تطبيق الضمانات الواردة في المادة 29 من النظام."
          en="I consent to my data being processed on cloud infrastructure outside KSA (Vercel — US, Supabase) with PDPL Article 29 safeguards."
        />
        <ConsentRow
          checked={consents.marketing_emails}
          onToggle={() => toggle('marketing_emails')}
          barColor="#B2BEC4"
          badge={{ ar: 'اختياري', en: 'Optional', color: '#B2BEC4' }}
          ar="أوافق على تلقي تحديثات حول المنصة عبر البريد الإلكتروني."
          en="I consent to receive platform updates by email."
        />
        <ConsentRow
          checked={consents.anonymized_analytics}
          onToggle={() => toggle('anonymized_analytics')}
          barColor="#B2BEC4"
          badge={{ ar: 'اختياري', en: 'Optional', color: '#B2BEC4' }}
          ar="أوافق على استخدام بياناتي لأغراض تحليلية مجهولة الهوية لتحسين الخدمة."
          en="I consent to use of my data for anonymized analytics to improve the service."
        />
      </ConsentSection>

      <div className="flex gap-3 mt-5">
        <button
          onClick={submit}
          disabled={submitting || !requiredGranted}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: submitting || !requiredGranted ? '#9CA3AF' : '#05A854' }}
        >
          {submitting ? 'Saving…' : 'متابعة · Continue'}
        </button>
        <button
          onClick={cancel}
          disabled={submitting}
          className="py-2.5 px-4 rounded-lg text-sm font-medium border"
          style={{ borderColor: '#E5E7EB', color: '#6B7280', background: 'white' }}
        >
          إلغاء · Cancel
        </button>
      </div>
    </>
  )
}

function ConsentSection({
  title, barColor, children,
}: {
  title: { ar: string; en: string }
  barColor: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-1 h-4 rounded-sm" style={{ background: barColor }} />
        <span dir="rtl" className="text-xs font-bold font-fs" style={{ color: '#0B4644' }}>{title.ar}</span>
        <span className="text-xs text-gray-400">·</span>
        <span lang="en" className="text-xs font-semibold" style={{ color: '#0B4644' }}>{title.en}</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function ConsentRow({
  checked, onToggle, ar, en, barColor, badge, linksBelow,
}: {
  checked: boolean
  onToggle: () => void
  ar: React.ReactNode
  en: React.ReactNode
  barColor: string
  badge: { ar: string; en: string; color: string }
  linksBelow?: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg bg-white border-l-4"
      style={{ borderLeftColor: barColor }}
    >
      {/* Label wraps ONLY the checkbox + descriptive copy. Any clickable
          children (e.g. /terms or /privacy links) must be rendered via
          `linksBelow` so a click on the link cannot bubble up and toggle
          the checkbox — that ambiguity created an erroneous-consent
          incident on 2026-05-15 and is a PDPL compliance concern. */}
      <label className="flex items-start gap-2 p-2 pr-3 rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div dir="rtl" className="text-xs leading-relaxed font-fs" style={{ color: '#0B4644' }}>{ar}</div>
          <div lang="en" className="text-xs leading-relaxed mt-1" style={{ color: '#374151' }}>{en}</div>
          <div className="text-[10px] mt-1 font-medium" style={{ color: badge.color }}>
            (<span dir="rtl" className="font-fs">{badge.ar}</span> / {badge.en})
          </div>
        </div>
      </label>
      {linksBelow && (
        <div className="px-3 pb-2 text-[10px]" style={{ color: '#6B7280' }}>
          {linksBelow}
        </div>
      )}
    </div>
  )
}
