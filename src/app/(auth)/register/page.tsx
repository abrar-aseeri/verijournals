'use client'
import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
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

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    employee_id: '', hospital_name: '', specialty: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleRegister() {
    if (!form.full_name || !form.email || !form.password) {
      setError('Please fill in all required fields'); return
    }
    setLoading(true); setError('')
    const supabase = createSupabaseBrowser()
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name } }
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('users').upsert({
        auth_id: data.user.id, full_name: form.full_name,
        email: form.email, employee_id: form.employee_id || null,
        hospital_name: form.hospital_name || null, specialty: form.specialty || null,
      }, { onConflict: 'auth_id' })
    }
    setSuccess(true); setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4 font-fs" style={{ background: '#F8FAFC' }}>
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-2" style={{ color: '#0B4644' }}>Account created!</h2>
        <p className="text-sm text-gray-500 mb-6">Please check your email to verify your account.</p>
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
              <input type="text" value={form.hospital_name} onChange={(e) => update('hospital_name', e.target.value)} placeholder="Armed Forces Hospital" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"/>
            </div>
            <button onClick={handleRegister} disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-1" style={{ background: loading ? '#9CA3AF' : '#05A854' }}>
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
