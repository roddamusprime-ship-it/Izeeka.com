import { getTake, getTakes } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'

export const revalidate = 60

export async function generateStaticParams() {
  const takes = await getTakes()
  return takes.map((take: any) => ({ slug: take.slug.current }))
}

export default async function TakePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const take = await getTake(slug)
  if (!take) notFound()

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <a href="/takes" style={{ fontSize: '1rem', color: '#3a7a3a', textDecoration: 'none' }}>← BACK TO ALL TAKES</a>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1rem', color: '#3a7a3a' }}>
            {new Date(take.publishedAt).toLocaleDateString()}
          </span>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '1.4rem', padding: '1px 8px', border: '1px solid', color: take.conviction === 'bull' ? 'var(--green)' : take.conviction === 'bear' ? 'var(--red)' : 'var(--yellow)', borderColor: take.conviction === 'bull' ? 'var(--green)' : take.conviction === 'bear' ? 'var(--red)' : 'var(--yellow)' }}>
            {take.conviction?.toUpperCase()}
          </span>
        </div>

        <h1 style={{ fontFamily: 'VT323, monospace', fontSize: '3rem', color: 'var(--green)', lineHeight: '1.2', marginBottom: '20px' }}>
          {take.title}
        </h1>

        {take.pullQuote && (
          <div style={{ borderLeft: '2px solid var(--yellow)', padding: '10px 16px', background: 'rgba(255,230,0,0.04)', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem', color: '#8a7a00', marginBottom: '4px' }}>T-DUBBS SAYS:</div>
            <div style={{ fontSize: '1.1rem', color: 'var(--yellow)', fontStyle: 'italic' }}>&ldquo;{take.pullQuote}&rdquo;</div>
          </div>
        )}

        <div style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: '2' }}>
          <PortableText value={take.body} />
        </div>

        {take.tickers?.length > 0 && (
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: '#3a7a3a', marginBottom: '8px', letterSpacing: '1px' }}>TICKERS MENTIONED</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {take.tickers.map((t: string) => (
                <span key={t} style={{ fontSize: '1rem', color: 'var(--cyan)', border: '1px solid rgba(0,234,255,0.3)', padding: '2px 10px', background: 'rgba(0,234,255,0.05)' }}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '20px' }}>
        <div style={{ fontFamily: 'VT323, monospace', fontSize: '2rem', color: 'var(--yellow)', marginBottom: '14px' }}>// THE PIT — DROP YOUR TAKE</div>
        <div style={{ border: '1px dashed var(--border)', padding: '16px', color: '#2a5a2a', fontSize: '1rem', textAlign: 'center' }}>
          [ GISCUS COMMENTS LOAD HERE ]<br />
          <span style={{ fontSize: '0.85rem', color: '#1a3a1a' }}>Configure at giscus.app once repo is on GitHub</span>
        </div>
      </div>
    </div>
  )
}
