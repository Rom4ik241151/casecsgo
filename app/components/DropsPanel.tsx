'use client'

import { useState, useEffect } from 'react'

export default function DropsPanel() {
  const [drops, setDrops] = useState<any[]>([])

  const fetchDrops = () => {
    fetch('/api/drops/recent')
      .then(r => r.json())
      .then(data => setDrops(data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchDrops()
    const interval = setInterval(fetchDrops, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      width: '220px',
      flexShrink: 0,
      background: 'rgba(10,10,26,0.95)',
      borderRight: '1px solid rgba(233,69,96,0.15)',
      overflowY: 'auto',
      height: 'calc(100vh - 80px)',
      position: 'sticky',
      top: 80
    }}>
      {/* Заголовок */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid rgba(233,69,96,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,26,0.98)',
        zIndex: 1
      }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#e94560', display: 'inline-block',
          boxShadow: '0 0 8px #e94560',
          animation: 'pulse 2s infinite'
        }} />
        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Онлайн дропы</span>
        <span style={{
          marginLeft: 'auto', fontSize: '10px', color: '#e94560',
          background: 'rgba(233,69,96,0.15)', padding: '2px 6px', borderRadius: '4px',
          fontWeight: 'bold'
        }}>LIVE</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {drops.length === 0 && (
        <div style={{ padding: '30px 14px', textAlign: 'center', color: '#444', fontSize: '12px' }}>
          Пока нет дропов...
        </div>
      )}

      {drops.map((drop, i) => (
        <div key={drop.id} style={{
          padding: '10px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          borderLeft: `2px solid ${i === 0 ? drop.color : 'transparent'}`,
          background: i === 0 ? `${drop.color}10` : 'transparent',
          animation: i === 0 ? 'slideIn 0.4s ease' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: `${drop.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', border: `1px solid ${drop.color}40`,
              flexShrink: 0
            }}>🎰</div>
            <span style={{ fontSize: '11px', color: '#bbb', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {drop.username || 'Игрок'}
            </span>
            {i === 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: '9px', color: '#4caf50',
                background: 'rgba(76,175,80,0.15)', padding: '1px 5px',
                borderRadius: '3px', flexShrink: 0
              }}>new</span>
            )}
          </div>
          <p style={{
            fontSize: '11px', color: drop.color, fontWeight: 'bold',
            marginBottom: '3px', paddingLeft: '31px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{drop.name}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '31px' }}>
            <span style={{ fontSize: '11px', color: '#e94560', fontWeight: 'bold' }}>
              {drop.price.toLocaleString()} ₽
            </span>
            <span style={{ fontSize: '9px', color: '#333' }}>
              {drop.caseName}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}