'use client'

import { useEffect, useState } from 'react'

export default function QuoteWidget({ ticker: defaultTicker = 'SPCX' }: { ticker?: string }) {
  const [ticker, setTicker] = useState(defaultTicker)
  const [input, setInput] = useState(defaultTicker)
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [blink, setBlink] = useState(true)

  async function fetchQuote(t: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/quote?ticker=${t}`)
      const data = await res.json()
      setQuote(data)
    } catch (e) {
      console.error(e)
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote(ticker)
    const interval = setInterval(() => fetchQuote(ticker), 60000)
    const blinkInterval = setInterval(() => setBlink(b => !b), 800)
    return () => { clearInterval(interval); clearInterval(blinkInterval) }
  }, [ticker])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = input.trim().toUpperCase()
    if (val) { setTicker(val); setInput(val) }
  }

  const chg = quote ? quote.close - quote.open : null
  const chgPct = quote ? ((quote.close - quote.open) / quote.open) * 100 : null
  const isUp = chg != null && chg >= 0
  const priceColor = isUp ? '#00ff41' : '#ff2d2d'
  const chgColor = isUp ? '#00ff41' : '#ff2d2d'

  return (
    <div style={{
      position: 'fixed',
      bottom: '148px',
      right: 0,
      background: '#000',
      border: '1px solid #1a3a1a',
      borderRight: 'none',
      minWidth: '240px',
      zIndex: 1000,
      fontFamily: 'Share Tech Mono, monospace',
    }}>
      {/* Header bar with editable ticker */}
      <div style={{
        background: '#001a00',
        padding: '4px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1a4a1a',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            maxLength={6}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #2a6a2a',
              color: 'var(--green)',
              fontFamily: 'VT323, monospace',
              fontSize: '1.2rem',
              letterSpacing: '2px',
              width: '70px',
              outline: 'none',
              padding: '0 2px',
            }}
          />
          <button type="submit" style={{
            background: 'transparent',
            border: '1px solid #2a5a2a',
            color: '#3a8a3a',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.55rem',
            padding: '1px 5px',
            cursor: 'pointer',
            letterSpacing: '1px',
          }}>GO</button>
        </form>
        <span style={{ fontSize: '0.6rem', color: '#2a6a2a', letterSpacing: '1px' }}>
          {blink ? '●' : '○'} DELAYED
        </span>
      </div>

      {loading && (
        <div style={{ padding: '12px', fontSize: '0.7rem', color: '#2a5a2a', textAlign: 'center', letterSpacing: '1px' }}>
          FETCHING DATA...
        </div>
      )}

      {!loading && !quote && (
        <div style={{ padding: '12px', fontSize: '0.7rem', color: '#4a2a2a', textAlign: 'center', letterSpacing: '1px' }}>
          NO DATA — BAD TICKER?
        </div>
      )}

      {quote && (
        <>
          {/* Price block */}
          <div style={{
            padding: '8px 12px 6px',
            borderBottom: '1px solid #0d200d',
            background: '#000800',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{
                fontFamily: 'VT323, monospace',
                fontSize: '2.2rem',
                color: priceColor,
                lineHeight: '1',
              }}>
                ${quote.close?.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.85rem', color: chgColor, fontWeight: 'bold' }}>
                {chg != null ? `${isUp ? '+' : ''}${chg.toFixed(2)}` : ''}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: chgColor, marginTop: '3px', letterSpacing: '1px' }}>
              {chgPct != null ? `${isUp ? '▲' : '▼'} ${Math.abs(chgPct).toFixed(2)}% TODAY` : ''}
            </div>
          </div>

          {/* Data rows — Bloomberg amber/orange values */}
          <div style={{ padding: '6px 12px 8px' }}>
            {[
              { label: 'OPEN', val: `$${quote.open?.toFixed(2)}` },
              { label: 'HIGH', val: `$${quote.high?.toFixed(2)}` },
              { label: 'LOW',  val: `$${quote.low?.toFixed(2)}`  },
              { label: 'VOL',  val: quote.volume ? (quote.volume > 1e6 ? (quote.volume/1e6).toFixed(2)+'M' : (quote.volume/1e3).toFixed(0)+'K') : '—' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0',
                borderBottom: '1px solid #0a180a',
                fontSize: '0.75rem',
              }}>
                <span style={{ color: '#3a6a3a', letterSpacing: '1px' }}>{row.label}</span>
                <span style={{ color: '#ffaa00' }}>{row.val}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            background: '#001000',
            padding: '3px 10px',
            fontSize: '0.55rem',
            color: '#1a4a1a',
            borderTop: '1px solid #0d200d',
            letterSpacing: '1px',
          }}>
            PREV CLOSE · 60S REFRESH · POLYGON.IO
          </div>
        </>
      )}
    </div>
  )
}
