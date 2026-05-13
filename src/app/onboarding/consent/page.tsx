import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import ConsentForm from './ConsentForm'

export const dynamic = 'force-dynamic'

export default async function OnboardingConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { next } = await searchParams

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 font-fs"
      style={{ background: '#F8FAFC' }}
    >
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6 justify-center">
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
          <h1
            dir="rtl"
            className="text-lg font-bold mb-1"
            style={{ color: '#0B4644' }}
          >
            إكمال التسجيل
          </h1>
          <h2 className="text-sm font-semibold mb-5" lang="en" style={{ color: '#6B7280' }}>
            Complete Registration
          </h2>
          <p
            dir="rtl"
            className="text-sm leading-relaxed mb-3"
            style={{ color: '#374151' }}
          >
            مرحباً بك في VeriJournals. قبل البدء، نحتاج موافقتك على بنود معالجة البيانات الأساسية المطلوبة بموجب نظام حماية البيانات الشخصية السعودي. سيظهر لك هذا الإشعار مرة واحدة فقط.
          </p>
          <p className="text-xs leading-relaxed mb-6" lang="en" style={{ color: '#6B7280' }}>
            Welcome to VeriJournals. Before you begin, we need your consent on the core data-processing terms required under the Saudi Personal Data Protection Law. This notice will appear only once.
          </p>
          <ConsentForm next={next ?? '/'} />
        </div>
      </div>
    </div>
  )
}
