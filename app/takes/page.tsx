import { getTakes } from '@/lib/sanity'
import Link from 'next/link'

export const revalidate = 60

export default async function TakesPage() {
  const takes = await getTakes()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <div style={{ fontFamily: 'VT323, monospace', fontSize: '28px', color: 'var(--yellow)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '16px', letterSpacing: '2px' }}>
        // THE TAKES <span style={{ fontSize: '14px', color: '#3a7a3a' }}>({takes.length} ENTRIES)</span>
      </div>

      {takes.map((take: any) => (
        <Link key={take._id} href={`/takes/${take.slug.current}`} style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '12px', marginBottom: '10px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#3a7a3a' }}>
                {new Date(take.publishedAt).toLocaleDateString()}
              </span>
              <span style={{ fontFamily: 'VT323, monospace', fontSize: '13px', padding: '1px 6px', border: '1px solid', color: take.conviction === 'bull' ? 'var(--green)' : take.conviction === 'bear' ? 'var(--red)' : 'var(--yellow)', borderColor: take.conviction === 'bull' ? 'var(--green)' : take.conviction === 'bear' ? 'var(--red)' : 'var(--yellow)' }}>
                {take.conviction?.toUpperCase()}
              </span>
            </div>
            <div style={{ fontFamily: 'VT323, monospace', fontSize: '22px', color: 'var(--green)', lineHeight: '1.2', marginBottom: '6px' }}>
              {take.title}
            </div>
            {take.pullQuote && (
              <div style={{ borderLeft: '2px solid var(--yellow)', padding: '4px 10px', background: 'rgba(255,230,0,0.04)', fontSize: '11px', color: 'var(--yellow)', fontStyle: 'italic', marginBottom: '8px' }}>
                &ldquo;{take.pullQuote}&rdquo;
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {take.tickers?.map((t: string) => (
                <span key={t} style={{ fontSize: '10px', color: 'var(--cyan)', border: '1px solid rgba(0,234,255,0.3)', padding: '1px 5px', background: 'rgba(0,234,255,0.05)' }}>{t}</span>
              ))}
            </div>
          </div>
        </Link>
      ))}

      {takes.length === 0 && (
        <div style={{ color: '#3a7a3a', fontSize: '12px', padding: '40px', textAlign: 'center', border: '1px dashed var(--border)' }}>
          No takes yet. Head to /studio and drop some alpha.
        </div>
      )}
    </div>
  )
}
