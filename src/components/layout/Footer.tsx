export default function Footer() {
  return (
    <footer style={{ background: '#0A1628', borderTop: '1px solid rgba(255,255,255,0.08)' }} className="w-full py-6 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div style={{ background: '#00A05A' }} className="w-7 h-7 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <path d="M10 2v18M3 6l7 4 7-4" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-white text-sm font-bold">VeriJournals</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Research & Innovation Institute — MOD</div>
          </div>
        </div>

        <div className="text-center">
          <div
            className="text-xs px-4 py-2 rounded-lg border"
            style={{ color: '#FFB020', borderColor: 'rgba(255,176,32,0.3)', background: 'rgba(255,176,32,0.08)' }}
          >
            ⚠ Beta Platform — Data is for reference only, not an official certified source
          </div>
        </div>

        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © 2026 VeriJournals. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
