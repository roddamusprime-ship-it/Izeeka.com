import { getTakes, getPositions } from '@/lib/sanity'
import { getBatchQuotes } from '@/lib/polygon'
import { SECTOR_LABELS } from '@/lib/tickers'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage() {
  const [takes, positions] = await Promise.all([getTakes(), getPositions()])
  const recentTakes = takes.slice(0, 2)
  const tickers = positions.map((p: any) => p.ticker)
  const quotes = tickers.length > 0 ? await getBatchQuotes(tickers) : []

  const quotemap: Record<string, any> = {}
  quotes.forEach((q: any) => { if (q?.ticker) quotemap[q.ticker] = q })

  const winners = quotes.filter((q: any) => q?.changePercent > 0).length
  const topMovers = [...quotes]
    .filter((q: any) => q?.changePercent != null)
    .sort((a: any, b: any) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 6)

  const sectorMap: Record<string, number[]> = {}
  positions.forEach((p: any) => {
    const q = quotemap[p.ticker]
    if (q?.changePercent != null) {
      if (!sectorMap[p.sector]) sectorMap[p.sector] = []
      sectorMap[p.sector].push(q.changePercent)
    }
  })

  const strongBull = positions.filter((p: any) => p.conviction === 'strong_bull')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: '80vh' }}>
      <div style={{ padding: '14px 16px', borderRight: '1px solid var(--border)' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '14px' }}>
          {[
            { label: 'POSITIONS', val: positions.length, sub: 'watchlist tickers' },
            { label: 'WINNERS TODAY', val: winners, sub: `of ${quotes.length} green` },
            { label: 'TAKES PUBLISHED', val: takes.length, sub: 'all time' },
            { label: 'STRONG BULL', val: strongBull.length, sub: 'high conviction' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '8px 10px' }}>
              <div style={{ fontSize: '9px', color: '#3a7a3a', marginBottom: '3px', letterSpacing: '1px' }}>{card.label}</div>
              <div style={{ fontFamily: 'VT323, monospace', fontSize: '26px', color: 'var(--green)', lineHeight: '1' }}>{card.val}</div>
              <div style={{ fontSize: '9px', color: '#2a5a2a', marginTop: '2px' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '10px' }}>
            <div style={{ fontFamily: 'VT323, monospace', fontSize: '15px', color: 'var(--yellow)', marginBottom: '8px', letterSpacing: '1px' }}>// TOP MOVERS</div>
            {topMovers.length === 0 && <div style={{ fontSize: '11px', color: '#2a5a2a' }}>Loading...</div>}
            {topMovers.map((q: any) => (
              <div key={q.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #0d200d', fontSize: '11px' }}>
                <span style={{ fontFamily: 'VT323, monospace', fontSize: '15px', color: 'var(--green)' }}>{q.ticker}</span>
                <span style={{ color: q.changePercent > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {q.changePercent > 0 ? '+' : ''}{q.changePercent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '10px' }}>
            <div style={{ fontFamily: 'VT323, monospace', fontSize: '15px', color: 'var(--yellow)', marginBottom: '8px', letterSpacing: '1px' }}>// SECTOR SNAPSHOT</div>
            {Object.entries(sectorMap).slice(0,6).map(([sector, changes]) => {
              const avg = changes.reduce((a, b) => a + b, 0) / changes.length
              return (
                <div key={sector} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #0d200d', fontSize: '11px' }}>
                  <span style={{ color: '#6a9a6a', fontSize: '10px' }}>{(SECTOR_LABELS as any)[sector] || sector.toUpperCase()}</span>
                  <span style={{ color: avg > 0 ? 'var(--green)' : 'var(--red)' }}>
                    {avg > 0 ? '+' : ''}{avg.toFixed(1)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: 'var(--yellow)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '10px', letterSpacing: '2px' }}>
          // LATEST FROM T-DUBBS
        </div>

        {recentTakes.map((take: any) => (
          <Link key={take._id} href={`/takes/${take.slug.current}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#000', border: '1px solid var(--border)', borderLeft: '2px solid var(--green)', padding: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: '#3a7a3a', marginBottom: '2px' }}>
                {new Date(take.publishedAt).toLocaleDateString()}
              </div>
              <div style={{ fontFamily: 'VT323, monospace', fontSize: '17px', color: 'var(--green)', marginBottom: '4px', lineHeight: '1.2' }}>
                {take.title}
              </div>
              {take.pullQuote && (
                <div style={{ fontSize: '10px', color: 'var(--yellow)', fontStyle: 'italic', borderLeft: '2px solid var(--yellow)', paddingLeft: '8px', marginBottom: '6px' }}>
                  &ldquo;{take.pullQuote}&rdquo;
                </div>
              )}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'VT323, monospace', fontSize: '12px', padding: '1px 5px', border: '1px solid', color: take.conviction === 'bull' ? 'var(--green)' : take.conviction === 'bear' ? 'var(--red)' : 'var(--yellow)', borderColor: take.conviction === 'bull' ? 'var(--green)' : take.conviction === 'bear' ? 'var(--red)' : 'var(--yellow)' }}>
                  {take.conviction?.toUpperCase()}
                </span>
                {take.tickers?.slice(0,3).map((t: string) => (
                  <span key={t} style={{ fontSize: '10px', color: 'var(--cyan)', border: '1px solid rgba(0,234,255,0.3)', padding: '1px 4px' }}>{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}

        {recentTakes.length === 0 && (
          <div style={{ color: '#3a7a3a', fontSize: '11px', padding: '20px', textAlign: 'center', border: '1px dashed var(--border)' }}>
            No takes yet. Head to /studio and drop some alpha.
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Link href="/takes" style={{ fontSize: '11px', padding: '3px 12px', border: '1px solid var(--border)', color: '#4a8a4a', textDecoration: 'none' }}>
            [ READ ALL TAKES → ]
          </Link>
        </div>
      </div>

      <div style={{ padding: '14px 12px' }}>
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: 'var(--yellow)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '8px' }}>// T-DUBBS RADAR</div>
          {strongBull.slice(0,6).map((p: any) => (
            <div key={p.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #0d200d' }}>
              <span style={{ fontFamily: 'VT323, monospace', fontSize: '15px', color: 'var(--green)' }}>{p.ticker}</span>
              <span style={{ fontSize: '10px', color: 'var(--green)' }}>◆ STRONG</span>
            </div>
          ))}
          {strongBull.length === 0 && (
            <div style={{ fontSize: '11px', color: '#2a5a2a' }}>No strong bull positions yet.</div>
          )}
        </div>

        {recentTakes[0] && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: 'var(--yellow)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '8px' }}>// RECENT TAKE</div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '8px' }}>
              <div style={{ fontSize: '10px', color: '#3a7a3a', marginBottom: '3px' }}>{new Date(recentTakes[0].publishedAt).toLocaleDateString()}</div>
              <div style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: 'var(--green)', marginBottom: '4px', lineHeight: '1.2' }}>{recentTakes[0].title}</div>
              <span style={{ fontFamily: 'VT323, monospace', fontSize: '12px', padding: '1px 5px', border: '1px solid', color: recentTakes[0].conviction === 'bull' ? 'var(--green)' : recentTakes[0].conviction === 'bear' ? 'var(--red)' : 'var(--yellow)', borderColor: recentTakes[0].conviction === 'bull' ? 'var(--green)' : recentTakes[0].conviction === 'bear' ? 'var(--red)' : 'var(--yellow)' }}>
                {recentTakes[0].conviction?.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <div style={{ background: '#050f05', border: '1px solid var(--border)', borderLeft: '2px solid var(--cyan)', padding: '8px', fontSize: '10px', color: '#4a8a6a' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '13px', color: 'var(--cyan)', display: 'block', marginBottom: '3px' }}>// STACK</span>
          Next.js 14 · Sanity CMS · Polygon.io<br />
          GitHub → Vercel auto-deploy<br />
          <span style={{ color: 'var(--green)' }}>● All systems nominal</span>
        </div>
      </div>
    </div>
  )
}
