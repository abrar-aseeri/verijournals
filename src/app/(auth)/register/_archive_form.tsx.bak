'use client'
import { useState } from 'react'
import Link from 'next/link'

const specialties = [
  'Internal Medicine', 'Surgery', 'Cardiology', 'Oncology',
  'Pediatrics', 'Obstetrics and Gynecology', 'Psychiatry',
  'Radiology and Medical Imaging', 'Orthopedics', 'Neurology',
  'Dermatology', 'Emergency Medicine', 'Family Medicine',
  'Anesthesiology', 'Pathology', 'Medical Laboratory', 'Nursing',
  'Respiratory Therapy', 'Physical Therapy', 'Quality Management',
  'Academic Affairs and Training', 'Other'
]

type ConsentKey =
  | 'terms_and_privacy'
  | 'pdpl_acknowledgment'
  | 'cross_border_transfer'
  | 'marketing_emails'
  | 'anonymized_analytics'

type Consents = Record<ConsentKey, boolean>

const INITIAL_CONSENTS: Consents = {
  terms_and_privacy: false,
  pdpl_acknowledgment: false,
  cross_border_transfer: false,
  marketing_emails: false,
  anonymized_analytics: false,
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    employee_id: '', hospital_name: '', specialty: ''
  })
  const [consents, setConsents] = useState<Consents>(INITIAL_CONSENTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleConsent(key: ConsentKey) {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const requiredGranted = consents.terms_and_privacy && consents.pdpl_acknowledgment

  async function handleRegister() {
    if (!form.full_name || !form.email || !form.password) {
      setError('Please fill in all required fields'); return
    }
    if (!requiredGranted) {
      setError('Required consents not granted · الموافقات الإلزامية لم تُمنح'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register-with-consent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, consents }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message_en ?? json.error ?? 'Sign-up failed')
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4 font-fs" style={{ background: '#F8FAFC' }}>
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-2" style={{ color: '#0B4644' }}>Account created!</h2>
        <p className="text-sm text-gray-500 mb-6">Please sign in to continue.</p>
        <Link href="/login" className="block w-full py-2.5 rounded-lg text-sm font-semibold text-white text-center" style={{ background: '#05A854' }}>Go to Login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 font-fs" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6 justify-center">
          { /* eslint-disable-next-line @next/next/no-img-element */ }
          <img
            src="/branding/verijournals_icon_256.png"
            alt="VeriJournals"
            style={{ height: 50, width: 'auto' }}
          />
          <div className="font-bold text-lg" style={{ color: '#0B4644' }}>Veri<span style={{ color: '#05A854' }}>Journals</span></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-5">Join VeriJournals</p>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600 mb-4">{error}</div>}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
              <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Dr. Ahmad Al-Zahrani" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="your@email.com" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Password *</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 6 characters" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Medical Specialty</label>
              <select value={form.specialty} onChange={(e) => update('specialty', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none">
                <option value="">Select specialty...</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Employee ID</label>
              <input type="number" value={form.employee_id} onChange={(e) => update('employee_id', e.target.value)} placeholder="123456" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Hospital Name</label>
              <input type="text" value={form.hospital_name} onChange={(e) => update('hospital_name', e.target.value)} placeholder="Hospital or institution" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"/>
            </div>

            <ConsentSection
              title={{ ar: 'موافقات إلزامية', en: 'Required Consents' }}
              barColor="#DC2626"
            >
              <ConsentRow
                checked={consents.terms_and_privacy}
                onToggle={() => toggleConsent('terms_and_privacy')}
                barColor="#DC2626"
                badge={{ ar: 'إلزامي', en: 'Required', color: '#DC2626' }}
                ar={
                  <>
                    أوافق على{' '}
                    <Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#0B4644' }}>شروط الاستخدام</Link>
                    {' '}و{' '}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#0B4644' }}>إشعار الخصوصية</Link>
                  </>
                }
                en={
                  <>
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#0B4644' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#0B4644' }}>Privacy Notice</Link>
                  </>
                }
              />
              <ConsentRow
                checked={consents.pdpl_acknowledgment}
                onToggle={() => toggleConsent('pdpl_acknowledgment')}
                barColor="#DC2626"
                badge={{ ar: 'إلزامي', en: 'Required', color: '#DC2626' }}
                ar="أُقرّ بأن المنصة تعمل ضمن نظام حماية البيانات الشخصية السعودي وأن بياناتي تُعالَج وفق المادة 6 من النظام."
                en="I acknowledge that the platform operates under the Saudi Personal Data Protection Law (PDPL) and that my data is processed under Article 6 of the law."
              />
            </ConsentSection>

            <ConsentSection
              title={{ ar: 'موافقات اختيارية', en: 'Optional' }}
              barColor="#B2BEC4"
            >
              <ConsentRow
                checked={consents.cross_border_transfer}
                onToggle={() => toggleConsent('cross_border_transfer')}
                barColor="#B2BEC4"
                badge={{ ar: 'اختياري', en: 'Optional', color: '#B2BEC4' }}
                ar="أوافق على معالجة بياناتي على بنية تحتية سحابية مستضافة خارج المملكة (Vercel — الولايات المتحدة، Supabase) مع تطبيق الضمانات الواردة في المادة 29 من النظام."
                en="I consent to my data being processed on cloud infrastructure outside KSA (Vercel — US, Supabase) with PDPL Article 29 safeguards."
              />
              <ConsentRow
                checked={consents.marketing_emails}
                onToggle={() => toggleConsent('marketing_emails')}
                barColor="#B2BEC4"
                badge={{ ar: 'اختياري', en: 'Optional', color: '#B2BEC4' }}
                ar="أوافق على تلقي تحديثات حول المنصة عبر البريد الإلكتروني."
                en="I consent to receive platform updates by email."
              />
              <ConsentRow
                checked={consents.anonymized_analytics}
                onToggle={() => toggleConsent('anonymized_analytics')}
                barColor="#B2BEC4"
                badge={{ ar: 'اختياري', en: 'Optional', color: '#B2BEC4' }}
                ar="أوافق على استخدام بياناتي لأغراض تحليلية مجهولة الهوية لتحسين الخدمة."
                en="I consent to use of my data for anonymized analytics to improve the service."
              />
            </ConsentSection>

            <button
              onClick={handleRegister}
              disabled={loading || !requiredGranted}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-1"
              style={{ background: loading || !requiredGranted ? '#9CA3AF' : '#05A854' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account? <Link href="/login" className="font-medium" style={{ color: '#0B4644' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
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
  checked, onToggle, ar, en, barColor, badge,
}: {
  checked: boolean
  onToggle: () => void
  ar: React.ReactNode
  en: React.ReactNode
  barColor: string
  badge: { ar: string; en: string; color: string }
}) {
  return (
    <label
      className="flex items-start gap-2 p-2 pr-3 rounded-lg cursor-pointer border-l-4 bg-white hover:bg-gray-50"
      style={{ borderLeftColor: barColor }}
    >
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
  )
}
