'use client'

import { useEffect, useState } from 'react'

export default function CvnaCounter() {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    const target = new Date('2026-09-19')
    const now = new Date()
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    setDays(diff)
  }, [])

  const color = days === null ? 'var(--red)' : days === 0 ? '#ff0000' : days < 0 ? '#ff8040' : 'var(--red)'
  const label = days === null ? '—' : days === 0 ? 'TODAY' : Math.abs(days).toString()
  const sub = days === null ? 'Burry saw it coming.' : days < 0 ? 'Days since implosion. Called it.' : 'Est. detonation: Q3 2026. Burry saw it coming.'

  return (
    <div className="cvna-counter">
      <div style={{ fontFamily: 'VT323, monospace', fontSize: '13px', color: '#ff4444', marginBottom: '4px', letterSpacing: '1px' }}>
        // CVNA IMPLOSION
      </div>
      <div style={{ fontFamily: 'VT323, monospace', fontSize: '38px', color, lineHeight: '1' }}>
        {label}
      </div>
      <div style={{ fontSize: '9px', color: '#4a1a1a', marginTop: '2px' }}>DAYS UNTIL CVNA EXPLODES</div>
      <div style={{ fontSize: '9px', color: '#6a2a2a', marginTop: '4px', lineHeight: '1.4' }}>{sub}</div>
    </div>
  )
}
