import { redirect } from 'next/navigation'

// Self-registration is disabled in closed-beta. The form implementation
// is preserved in this folder as `_archive_form.tsx.bak` for Phase 2
// reactivation; until then, /register redirects to the landing page.

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  redirect('/')
}
