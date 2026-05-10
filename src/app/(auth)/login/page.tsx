'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    setRedirectTo(sp.get('redirectTo'))
  }, [])

  async function handleSignIn() {
    setLoading(true); setError(''); setInfo('')
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError(signInError.message); setLoading(false); return }

    const userId = data.user?.id
    if (!userId) { setError('Sign-in did not return a user.'); setLoading(false); return }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', userId)
      .maybeSingle()

    if (!profile) {
      await supabase.auth.signOut()
      setError('Account not provisioned. Contact admin.')
      setLoading(false)
      return
    }

    if (profile.role === 'admin') router.push(redirectTo || '/admin')
    else router.push('/')
  }

  async function handleSignUp() {
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true); setError(''); setInfo('')
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.session) { router.push('/'); return }
    setInfo('Check your email to confirm your account.')
    setLoading(false)
  }

  function submit() {
    if (mode === 'signin') handleSignIn()
    else handleSignUp()
  }

  function toggleMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(''); setInfo(''); setConfirmPassword('')
  }

  const heading = mode === 'signin' ? 'Welcome back' : 'Create account'
  const subhead = mode === 'signin'
    ? 'Sign in to your VeriJournals account'
    : 'Quick signup with email and password'
  const btnLabel = loading
    ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
    : (mode === 'signin' ? 'Sign in' : 'Sign up')
  const toggleLabel = mode === 'signin'
    ? "Don't have an account? Sign up"
    : 'Already have an account? Sign in'

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
          <h1 className="text-lg font-bold text-gray-900 mb-1">{heading}</h1>
          <p className="text-sm text-gray-500 mb-6">{subhead}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600 mb-4">{error}</div>
          )}
          {info && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 mb-4">{info}</div>
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
                onKeyDown={(e) => mode === 'signin' && e.key === 'Enter' && submit()}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400"
                />
              </div>
            )}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-1"
              style={{ background: loading ? '#9CA3AF' : '#1B5E20' }}
            >
              {btnLabel}
            </button>
          </div>

          <button
            type="button"
            onClick={toggleMode}
            className="block w-full text-center text-xs text-gray-500 mt-4 hover:text-gray-700"
          >
            {toggleLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
