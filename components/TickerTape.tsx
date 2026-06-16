'use client'

export default function TickerTape() {
  const tickers = [
    { sym: 'NVDA', price: 131.20, chg: 3.08 },
    { sym: 'RKLB', price: 28.40, chg: 1.38 },
    { sym: 'ASTS', price: 87.57, chg: 2.71 },
    { sym: 'PLTR', price: 118.00, chg: -1.07 },
    { sym: 'QBTS', price: 26.26, chg: -0.48 },
    { sym: 'GEV', price: 375.00, chg: 4.13 },
    { sym: 'TSM', price: 191.00, chg: 3.44 },
    { sym: 'OKLO', price: 60.74, chg: 1.76 },
    { sym: 'ARM', price: 142.00, chg: 0.99 },
    { sym: 'ASML', price: 742.00, chg: -8.90 },
    { sym: 'MSTR', price: 388.00, chg: 11.73 },
    { sym: 'HOOD', price: 68.20, chg: -1.46 },
    { sym: 'IONQ', price: 31.40, chg: 0.65 },
    { sym: 'NET', price: 132.00, chg: 1.06 },
    { sym: 'APP', price: 520.00, chg: 11.44 },
    { sym: 'AMZN', price: 210.00, chg: 1.26 },
  ]

  const items = [...tickers, ...tickers]

  return (
    <div style={{
      background: '#000',
      borderBottom: '1px solid var(--green)',
      overflow: 'hidden',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <style>{`
        @keyframes tape-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .tape-inner {
          display: flex;
          animation: tape-scroll 50s linear infinite;
          white-space: nowrap;
        }
      `}</style>
      <div className="tape-inner">
        {items.map((t, i) => (
          <span key={i}>
            <span style={{
              fontFamily: 'VT323, monospace',
              fontSize: '15px',
              padding: '0 14px',
              color: t.chg >= 0 ? 'var(--green)' : 'var(--red)',
            }}>
              {t.sym} {t.price.toFixed(2)} <b>{t.chg >= 0 ? '+' : ''}{t.chg.toFixed(2)}</b>
            </span>
            <span style={{ color: '#1a4a1a', fontFamily: 'VT323, monospace', fontSize: '15px' }}>|</span>
          </span>
        ))}
      </div>
    </div>
  )
}
