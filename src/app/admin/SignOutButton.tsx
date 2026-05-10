'use client'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const [busy, setBusy] = useState(false)

  async function signOut() {
    setBusy(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={signOut}
      disabled={busy}
      className="text-sm font-medium hover:underline disabled:opacity-50"
      style={{ color: '#0B4644' }}
    >
      {busy ? '...' : 'Sign out'}
    </button>
  )
}
