'use client'
import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const specialties = [
  'Internal Medicine', 'Surgery', 'Cardiology', 'Oncology',
  'Pediatrics', 'Obstetrics & Gynecology', 'Psychiatry', 'Radiology',
  'Orthopedics', 'Neurology', 'Dermatology', 'Emergency Medicine',
  'Family Medicine', 'Anesthesiology', 'Pathology', 'Other'
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    employee_id: '', hospital_code: '', hospital_name: '', specialty: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleRegister() {
    if (!form.full_name || !form.email || !form.password) {
      setError('Please fill in all required fields'); return
    }
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } }
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('users').insert({
        auth_id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        employee_id: form.employee_id || null,
        hospital_code: form.hospital_code || null,
        hospital_name: form.hospital_name || null,
        specialty: form.specialty || null,
      })
    }
    setSuccess(true); setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A1628' }}>
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#E6F5EE' }}>
          <span className="text-2xl" style={{ color: '#00A05A' }}>✓</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Account created!</h2>
        <p className="text-sm text-gray-500 mb-6">Please check your email to verify your account.</p>
        <Link href="/login" className="block w-full py-2.5 rounded-lg text-sm font-semibold text-white text-center" style={{ background: '#00A05A' }}>
          Go to Login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: '#0A1628' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div style={{ background: '#00A05A' }} className="w-9 h-9 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <path d="M10 2v18M3 6l7 4 7-4" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-lg">Veri<span style={{ color: '#5DD9A4' }}>Journals</span></div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Research & Innovation Institute — MOD</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-5">Join VeriJournals — MOD Research Platform</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600 mb-4">{error}</div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
              <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)}
                placeholder="Dr. Ahmad Al-Zahrani"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Password *</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Medical Specialty</label>
              <select value={form.specialty} onChange={(e) => update('specialty', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400">
                <option value="">Select specialty...</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Employee ID</label>
              <input type="text" value={form.employee_id} onChange={(e) => update('employee_id', e.target.value)}
                placeholder="MOD-12345"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Hospital Code</label>
              <input type="text" value={form.hospital_code} onChange={(e) => update('hospital_code', e.target.value)}
                placeholder="e.g. RYD-001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Hospital Name</label>
              <input type="text" value={form.hospital_name} onChange={(e) => update('hospital_name', e.target.value)}
                placeholder="e.g. Armed Forces Hospital — Riyadh"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"/>
            </div>
            <button onClick={handleRegister} disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-1"
              style={{ background: loading ? '#9CA3AF' : '#00A05A' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="font-medium" style={{ color: '#00A05A' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
