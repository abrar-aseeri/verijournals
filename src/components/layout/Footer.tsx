export default function Footer() {
  return (
    <footer style={{ background: '#1E3D2F' }} className="w-full mt-auto">
      <div style={{ paddingTop: '40px', paddingBottom: '40px' }} className="px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-4 text-center">
          <div
            className="text-white text-lg tracking-wide"
            style={{ fontWeight: 700 }}
          >
            VeriJournals
          </div>

          <p
            dir="rtl"
            className="text-sm leading-relaxed"
            style={{ color: '#FFFFFF', fontWeight: 400, textAlign: 'center' }}
          >
            هذا الموقع في مرحلة تجريبية. البيانات للاستئناس فقط. للتواصل:{' '}
            <a
              href="mailto:abrar.aseeri@hotmail.com"
              style={{ color: '#FFFFFF', fontWeight: 600 }}
              className="underline"
            >
              abrar.aseeri@hotmail.com
            </a>
          </p>
        </div>
      </div>

      <div
        style={{ background: '#0D2214', height: '40px' }}
        className="w-full flex items-center justify-center"
      >
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
          © 2026 VeriJournals — جميع الحقوق محفوظة
        </span>
      </div>
    </footer>
  )
}
