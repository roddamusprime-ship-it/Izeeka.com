import type { Metadata } from 'next'
import './globals.css'
import CvnaCounter from '@/components/CvnaCounter'
import TickerTape from '@/components/TickerTape'
import QuoteWidget from '@/components/QuoteWidget'

export const metadata: Metadata = {
  title: 'IZEEKA — T-Dubbs Stock Commentary',
  description: 'Real data. Unhinged takes. Not financial advice.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TickerTape />
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          borderBottom: '1px solid var(--border)',
          background: '#000',
          gap: '12px',
        }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontFamily: 'VT323, monospace', fontSize: '2rem', color: 'var(--green)', letterSpacing: '4px', lineHeight: '1' }}>
              IZE<span style={{ color: 'var(--yellow)' }}>EK</span>A<span className="blink">_</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: '#2a5a2a', whiteSpace: 'nowrap' }}>
              NOT FINANCIAL ADVICE &nbsp;|&nbsp; T-DUBBS APPROVED &nbsp;|&nbsp; BURRY IS OUR SPIRIT ANIMAL
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {[['/', 'HOME'], ['/takes', 'THE TAKES'], ['/watchlist', 'WATCHLIST'], ['/pit', 'THE PIT']].map(([href, label]) => (
              <a key={href} href={href} style={{
                fontFamily: 'VT323, monospace',
                fontSize: '1.1rem',
                color: '#4a8a4a',
                padding: '2px 10px',
                border: '1px solid transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </a>
            ))}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{
              fontSize: '0.6rem', padding: '1px 8px',
              border: '1px solid var(--green)',
              color: 'var(--green)', background: 'rgba(0,255,65,0.08)',
              whiteSpace: 'nowrap',
            }}>● MARKET OPEN</span>
            <div style={{ fontSize: '0.6rem', color: '#2a5a2a', marginTop: '2px' }}>POLYGON.IO LIVE</div>
          </div>
        </nav>

        <main style={{ minHeight: 'calc(100vh - 110px)' }}>
          {children}
        </main>

        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '6px 20px',
          fontSize: '0.6rem',
          color: '#2a4a2a',
          display: 'flex',
          justifyContent: 'space-between',
          background: '#000',
        }}>
          <span>IZEEKA.COM © 2025 — NOT FINANCIAL ADVICE. DR. BURRY SEES WHAT YOU DON&apos;T.</span>
          <span>CONVICTION IS A LIFESTYLE <span className="blink">▮</span></span>
        </footer>

        <QuoteWidget ticker="SPCX" />
        <CvnaCounter />
      </body>
    </html>
  )
}
