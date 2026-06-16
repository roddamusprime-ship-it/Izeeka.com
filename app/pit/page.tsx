export default function PitPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <div style={{ fontFamily: 'VT323, monospace', fontSize: '28px', color: 'var(--yellow)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '16px', letterSpacing: '2px' }}>
        // THE PIT
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontFamily: 'VT323, monospace', fontSize: '28px', color: 'var(--yellow)', marginBottom: '8px' }}>COMMUNITY TAKES</div>
        <div style={{ fontSize: '11px', color: '#4a8a4a', lineHeight: '1.8', marginBottom: '16px' }}>
          Powered by Giscus (GitHub Discussions)<br />
          Comment on any Take. GitHub account required.<br />
          Drop your ticker calls. Based behavior only.
        </div>
        <div style={{ border: '1px dashed var(--border)', padding: '16px', color: '#2a5a2a', fontSize: '11px' }}>
          [ GISCUS WIDGET LOADS HERE ]<br />
          <span style={{ fontSize: '10px', color: '#1a3a1a' }}>Configure at giscus.app once repo is on GitHub</span>
        </div>
      </div>

      <div style={{ background: '#000', border: '1px solid #3a003a', padding: '16px' }}>
        <div style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#cc44cc', borderBottom: '1px solid #3a003a', paddingBottom: '4px', marginBottom: '12px', letterSpacing: '1px' }}>
          // CHAD'S GAY TAKES
        </div>
        <div style={{ fontSize: '11px', color: '#884488', lineHeight: '1.6', padding: '8px 0', borderBottom: '1px dashed #2a002a' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#dd88dd' }}>TSLA</span>
          <span style={{ float: 'right', fontSize: '9px', color: '#4a1a4a' }}>Jun 10</span><br />
          "Everyone keeps calling it overvalued. I keep buying it. One of us is wrong and it isn't me."
        </div>
        <div style={{ fontSize: '11px', color: '#884488', lineHeight: '1.6', padding: '8px 0', borderBottom: '1px dashed #2a002a' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#dd88dd' }}>MSTR</span>
          <span style={{ float: 'right', fontSize: '9px', color: '#4a1a4a' }}>Jun 7</span><br />
          "A leveraged Bitcoin ETF that also does enterprise software. What's not to love. Saylor is unhinged and I respect it."
        </div>
        <div style={{ fontSize: '11px', color: '#884488', lineHeight: '1.6', padding: '8px 0' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#dd88dd' }}>HOOD</span>
          <span style={{ float: 'right', fontSize: '9px', color: '#4a1a4a' }}>Jun 3</span><br />
          "The options on this thing are stupid cheap. IV is sleeping. I am not sleeping."
        </div>
        <div style={{ marginTop: '12px', fontSize: '10px', color: '#4a1a4a', fontStyle: 'italic' }}>
          Chad is not T-Dubbs. Chad's takes are Chad's takes. We love Chad anyway.
        </div>
      </div>
    </div>
  )
}
