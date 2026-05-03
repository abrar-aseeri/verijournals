export default function Footer() {
  return (
    <footer
      style={{ background: '#1B5E20', paddingTop: '40px', paddingBottom: '40px' }}
      className="w-full px-6 mt-auto"
    >
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

        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
          © 2026 VeriJournals
        </div>
      </div>
    </footer>
  )
}
