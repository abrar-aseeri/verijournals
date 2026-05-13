export const dynamic = 'force-dynamic'

export default function RegisterCompletePage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 font-fs"
      style={{ background: '#F8FAFC' }}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-gray-100">
        <h1
          dir="rtl"
          className="text-lg font-bold mb-1"
          style={{ color: '#0B4644' }}
        >
          الحساب ينقصه موافقات إلزامية
        </h1>
        <h2 lang="en" className="text-sm font-semibold mb-6" style={{ color: '#6B7280' }}>
          Your account is missing required consents
        </h2>
        <p dir="rtl" className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>
          حسابك ينقصه موافقات إلزامية مطلوبة بموجب نظام حماية البيانات الشخصية. الرجاء التواصل مع الدعم لتحديث موافقاتك. [بريد دعم placeholder]
        </p>
        <p lang="en" className="text-sm leading-relaxed" style={{ color: '#374151' }}>
          Your account is missing required consents under the Saudi Personal Data Protection Law. Please contact support to update your consents. [support email placeholder]
        </p>
      </div>
    </main>
  )
}
