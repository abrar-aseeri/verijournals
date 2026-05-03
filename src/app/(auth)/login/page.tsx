'use client'
import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1B5E20' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div style={{ background: '#1B5E20' }} className="w-9 h-9 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <path d="M10 2v18M3 6l7 4 7-4" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-lg">Veri<span style={{ color: '#4CAF50' }}>Journals</span></div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Research & Innovation Institute — MOD</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your VeriJournals account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600 mb-4">{error}</div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-1"
              style={{ background: loading ? '#9CA3AF' : '#1B5E20' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium" style={{ color: '#1B5E20' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
