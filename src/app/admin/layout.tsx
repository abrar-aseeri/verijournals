import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Defense-in-depth admin gate. Middleware allowlists /admin so authenticated
// users can reach the route; this layout fails closed if the caller is not
// signed in OR not 'admin' in public.users. Applies automatically to every
// /admin/* page that renders under this layout.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await createSupabaseServer()
  const {
    data: { user },
  } = await session.auth.getUser()
  if (!user) redirect('/login?next=/admin')

  const admin = getAdmin()
  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return <>{children}</>
}
