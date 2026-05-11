import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#0B4644' }} className="w-full mt-auto font-fs">
      <div style={{ paddingTop: '40px', paddingBottom: '40px' }} className="px-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4 text-center">
          <div
            className="text-white text-lg tracking-wide"
            style={{ fontWeight: 700 }}
          >
            VeriJournals
          </div>

          <div className="text-sm">
            <Link
              href="/methodology"
              style={{ color: '#FFFFFF', fontWeight: 600 }}
              className="underline hover:opacity-80 transition-opacity"
            >
              المنهجية / Methodology
            </Link>
          </div>

          <p
            dir="rtl"
            className="text-sm leading-relaxed font-fs"
            style={{ color: '#FFFFFF', fontWeight: 400, textAlign: 'center' }}
          >
            هذا الموقع لا يزال في المرحلة التجريبية (Beta Version)، وقد تحتوي البيانات أو النتائج أو التصنيفات المعروضة على أخطاء، أو نقص، أو تأخير في التحديث، ولا يُعتمد عليها لاتخاذ قرارات رسمية أو أكاديمية أو بحثية. نعمل باستمرار على تحسين دقة البيانات وجودة المنصة وتطوير خصائصها.
          </p>

          <p
            dir="rtl"
            className="text-sm leading-relaxed font-fs"
            style={{ color: '#FFFFFF', fontWeight: 400, textAlign: 'center' }}
          >
            للتواصل والاستفسارات:{' '}
            <a
              href="mailto:abrar.aseeri@hotmail.com"
              style={{ color: '#FFFFFF', fontWeight: 600 }}
              className="underline hover:opacity-80 transition-opacity"
            >
              abrar.aseeri@hotmail.com
            </a>
          </p>
        </div>
      </div>

      <div
        style={{ background: '#073332', height: '40px' }}
        className="w-full flex items-center justify-center"
      >
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
          © 2026 VeriJournals — جميع الحقوق محفوظة
        </span>
      </div>
    </footer>
  )
}
