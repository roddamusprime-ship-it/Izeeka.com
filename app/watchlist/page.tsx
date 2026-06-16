import { getPositions } from '@/lib/sanity'
import { getBatchQuotes } from '@/lib/polygon'
import { SECTOR_LABELS } from '@/lib/tickers'

export const revalidate = 60

export default async function WatchlistPage() {
  const positions = await getPositions()
  const tickers = positions.map((p: any) => p.ticker)
  const quotes = tickers.length > 0 ? await getBatchQuotes(tickers) : []

  const quotemap: Record<string, any> = {}
  quotes.forEach((q: any) => { if (q?.ticker) quotemap[q.ticker] = q })

  const sectorColors: Record<string, string> = {
    ai: '#a070ff', semi: '#4090ff', energy: '#40c060',
    mega: '#a0a090', fin: '#ff80b0', financial: '#e0c040',
    quantum: '#ff8040', space: '#40c8b0', meme: '#ffb830',
  }

  const cvLabels: Record<string, string> = {
    strong_bull: '◆ STRONG BULL', bull: '▲ BULL', hold: '— HOLD', bear: '▼ BEAR'
  }
  const cvColors: Record<string, string> = {
    strong_bull: 'var(--green)', bull: '#80ff80', hold: 'var(--yellow)', bear: 'var(--red)'
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'VT323, monospace', fontSize: '32px', color: 'var(--yellow)', letterSpacing: '2px' }}>
          // WATCHLIST
        </div>
        <span style={{ fontSize: '12px', padding: '2px 10px', border: '1px solid var(--green)', color: 'var(--green)', background: 'rgba(0,255,65,0.08)' }}>
          ● LIVE — 60s CACHE
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['TICKER', 'PRICE', 'DAY CHG', 'SINCE ADDED', 'SECTOR', 'CONVICTION', 'NOTES'].map(h => (
                <th key={h} style={{ color: '#3a7a3a', fontSize: '12px', textAlign: 'left', padding: '5px 10px', borderBottom: '1px solid var(--border)', fontWeight: '400', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((p: any) => {
              const q = quotemap[p.ticker]
              const price = q?.close ?? null
              const chgPct = q?.changePercent ?? null
              const chgPts = price && q?.open ? price - q.open : null
              const since = price && p.addedPrice ? ((price - p.addedPrice) / p.addedPrice) * 100 : null
              const sc = (sectorColors as any)[p.sector] || '#a070ff'

              return (
                <tr key={p._id} style={{ borderBottom: '1px solid #0d200d' }}>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: 'var(--green)' }}>{p.ticker}</span>
                  </td>
                  <td style={{ padding: '6px 10px', fontFamily: 'Share Tech Mono, monospace', color: '#d0ffd0', fontSize: '14px' }}>
                    {price ? `$${price.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '6px 10px', fontSize: '13px', color: chgPts == null ? '#3a7a3a' : chgPts > 0 ? 'var(--green)' : 'var(--red)' }}>
                    {chgPts != null ? `${chgPts > 0 ? '+' : ''}${chgPts.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '6px 10px', fontSize: '13px', color: since == null ? '#3a7a3a' : since > 0 ? 'var(--green)' : 'var(--red)' }}>
                    {since != null ? `${since > 0 ? '+' : ''}${since.toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', border: `1px solid ${sc}40`, color: sc, background: `${sc}15`, borderRadius: '2px' }}>
                      {(SECTOR_LABELS as any)[p.sector] || p.sector?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '6px 10px', fontSize: '13px', color: cvColors[p.conviction] || 'var(--text)' }}>
                    {cvLabels[p.conviction] || p.conviction}
                  </td>
                  <td style={{ padding: '6px 10px', fontSize: '12px', color: '#4a7a4a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.notes || '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {positions.length === 0 && (
        <div style={{ color: '#3a7a3a', fontSize: '13px', padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', marginTop: '16px' }}>
          No positions yet. Add them in /studio under Positions.
        </div>
      )}
    </div>
  )
}
