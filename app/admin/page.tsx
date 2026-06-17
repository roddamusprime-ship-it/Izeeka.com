'use client'

import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function loadDrafts() {
    setLoading(true)
    const res = await fetch('/api/admin/drafts')
    const data = await res.json()
    setDrafts(data)
    setLoading(false)
  }

  async function publish(id: string, title: string) {
    setPublishing(id)
    setMessage(null)
    const res = await fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.ok) {
      setMessage(`✓ Published: ${title}`)
      loadDrafts()
    } else {
      setMessage(`✗ Failed: ${data.error}`)
    }
    setPublishing(null)
  }

  useEffect(() => { loadDrafts() }, [])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ fontFamily: 'VT323, monospace', fontSize: '2.5rem', color: 'var(--yellow)', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '20px' }}>
        // ADMIN — PUBLISH TAKES
      </div>

      {message && (
        <div style={{ background: message.startsWith('✓') ? 'rgba(0,255,65,0.1)' : 'rgba(255,45,45,0.1)', border: `1px solid ${message.startsWith('✓') ? 'var(--green)' : 'var(--red)'}`, padding: '10px 14px', marginBottom: '16px', fontFamily: 'VT323, monospace', fontSize: '1.2rem', color: message.startsWith('✓') ? 'var(--green)' : 'var(--red)' }}>
          {message}
        </div>
      )}

      {loading && (
        <div style={{ color: '#3a7a3a', fontSize: '1rem' }}>Loading drafts...</div>
      )}

      {!loading && drafts.length === 0 && (
        <div style={{ color: '#3a7a3a', fontSize: '1rem', padding: '20px', border: '1px dashed var(--border)', textAlign: 'center' }}>
          No drafts waiting to publish.
        </div>
      )}

      {drafts.map((draft: any) => (
        <div key={draft._id} style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '14px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: 'VT323, monospace', fontSize: '1.4rem', color: 'var(--green)', marginBottom: '4px' }}>{draft.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#3a7a3a' }}>
              slug: {draft.slug?.current || 'none'} &nbsp;|&nbsp; {draft.publishedAt ? new Date(draft.publishedAt).toLocaleDateString() : 'no date'}
              &nbsp;|&nbsp; conviction: {draft.conviction || 'none'}
            </div>
          </div>
          <button
            onClick={() => publish(draft._id, draft.title)}
            disabled={publishing === draft._id}
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '1.2rem',
              padding: '4px 16px',
              background: publishing === draft._id ? '#0a2a0a' : 'rgba(0,255,65,0.1)',
              border: '1px solid var(--green)',
              color: 'var(--green)',
              cursor: publishing === draft._id ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
              letterSpacing: '1px',
            }}
          >
            {publishing === draft._id ? 'PUBLISHING...' : '▶ PUBLISH'}
          </button>
        </div>
      ))}

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button onClick={loadDrafts} style={{ fontFamily: 'VT323, monospace', fontSize: '1rem', padding: '4px 16px', background: 'transparent', border: '1px solid var(--border)', color: '#4a8a4a', cursor: 'pointer' }}>
          ↺ REFRESH
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#050505', border: '1px solid var(--border)', fontSize: '0.7rem', color: '#2a4a2a' }}>
        ⚠ This page is not password protected in v1. Don't share the URL publicly.
      </div>
    </div>
  )
}
