'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Swallow errors to keep the response neutral (no enumeration).
    }
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-fs" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          { /* eslint-disable-next-line @next/next/no-img-element */ }
          <img
            src="/branding/verijournals_icon_256.png"
            alt="VeriJournals"
            style={{ height: 50, width: 'auto' }}
          />
          <div className="font-bold text-lg" style={{ color: '#0B4644' }}>
            Veri<span style={{ color: '#05A854' }}>Journals</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 dir="rtl" className="text-lg font-bold mb-1" style={{ color: '#0B4644' }}>
            تسجيل الدخول
          </h1>
          <h2 lang="en" className="text-sm font-semibold mb-5" style={{ color: '#6B7280' }}>
            Sign in
          </h2>

          {submitted ? (
            <div className="rounded-lg border px-3 py-3 text-sm" style={{ borderColor: '#86EFAC', background: '#DCFCE7', color: '#0B4644' }}>
              <p dir="rtl" className="font-fs mb-2 leading-relaxed">
                إذا كان بريدك الإلكتروني مُسجَّلاً، ستصلك رسالة تحتوي رابط الدخول. وإلا، يُرجى طلب الوصول من الصفحة الرئيسية.
              </p>
              <p lang="en" className="text-xs leading-relaxed">
                If your email is registered, you will receive a sign-in link. Otherwise, please request access from the landing page.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Email · البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-1"
                style={{ background: submitting || !email ? '#9CA3AF' : '#05A854' }}
              >
                {submitting ? 'Sending…' : 'إرسال رابط الدخول · Send sign-in link'}
              </button>
              <p className="text-xs leading-relaxed mt-2" style={{ color: '#6B7280' }}>
                <span dir="rtl" className="font-fs">سترسل لك رسالة تحتوي رابطاً للدخول لمرة واحدة، صالحاً لمدة ساعة.</span>
                <br />
                <span lang="en">A one-time sign-in link will be sent to your email, valid for 1 hour.</span>
              </p>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-xs" style={{ color: '#6B7280' }}>
          <Link href="/" className="hover:underline">
            ← العودة إلى الصفحة الرئيسية · Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
