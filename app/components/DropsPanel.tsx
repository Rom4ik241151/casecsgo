'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CASE_IMAGES: Record<string, string> = {
  'Замерзший Реликт': '/cases/Frozen-Relic-Case.png',
  'Лунная Сакура': '/cases/Moon-Sakura-Case.png',
  'Древний Свиток': '/cases/Ancient-Scroll-Case.png',
  'Неоновое Ядро': '/cases/Neon-Core-Case.png',
}

const CASE_IDS: Record<string, number> = {
  'Древний Свиток': 1,
  'Замерзший Реликт': 2,
  'Лунная Сакура': 3,
  'Неоновое Ядро': 4,
}

export default function DropsPanel() {
  const [drops, setDrops] = useState<any[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDrops = () => {
      fetch('/api/drops/recent').then(r => r.json()).then(setDrops).catch(() => {})
    }
    fetchDrops()
    const interval = setInterval(fetchDrops, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      width: '210px', flexShrink: 0,
      background: '#08080f',
      borderRight: '1px solid rgba(233,69,96,0.08)',
      overflowY: 'auto', overflowX: 'hidden',
      height: 'calc(100vh - 80px)',
      position: 'sticky', top: 80,
      scrollbarWidth: 'none',
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes casePopIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .drop-row:hover { background: rgba(255,255,255,0.02) !important; }
        .avatar-btn:hover { transform: scale(1.1); }
      `}</style>

      {/* Шапка */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: '8px',
        position: 'sticky', top: 0, zIndex: 10,
        background: '#08080f',
      }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#e94560', display: 'inline-block',
          boxShadow: '0 0 8px #e94560',
          animation: 'pulse 2s infinite', flexShrink: 0,
        }} />
        <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px' }}>
          ОНЛАЙН ДРОПЫ
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: '9px', color: '#e94560',
          background: 'rgba(233,69,96,0.15)', padding: '2px 6px',
          borderRadius: '3px', fontWeight: '900', letterSpacing: '1px',
          border: '1px solid rgba(233,69,96,0.3)',
        }}>LIVE</span>
      </div>

      {drops.length === 0 && (
        <div style={{ padding: '40px 14px', textAlign: 'center', color: '#2a2a3a', fontSize: '11px' }}>
          Ожидание дропов...
        </div>
      )}

      {drops.map((drop, i) => {
        const isHovered = hoveredId === drop.id
        const caseImg = CASE_IMAGES[drop.caseName]

        return (
          <div
            key={drop.id}
            className="drop-row"
            onMouseEnter={() => setHoveredId(drop.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '10px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              animation: i === 0 ? 'slideDown 0.4s ease' : 'none',
              transition: 'background 0.2s',
            }}
          >
            {/* Цветная полоска слева */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
              background: drop.color,
              opacity: i === 0 || isHovered ? 1 : 0.3,
              boxShadow: isHovered ? `0 0 10px ${drop.color}` : 'none',
              transition: 'all 0.3s',
            }} />

            {/* Размытый фон при ховере */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: caseImg ? `url(${caseImg})` : 'none',
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: isHovered ? 0.07 : 0,
              filter: 'blur(8px)', transform: 'scale(1.2)',
              transition: 'opacity 0.4s ease', zIndex: 0,
            }} />

            {/* Оверлей с кейсом */}
            {caseImg && isHovered && (
              <div
                onClick={() => { const id = CASE_IDS[drop.caseName]; if (id) router.push(`/case/${id}`) }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 5,
                  display: 'flex', alignItems: 'center',
                  gap: '10px', padding: '0 14px',
                  background: `linear-gradient(120deg, rgba(8,8,15,0.95) 0%, ${drop.color}18 100%)`,
                  backdropFilter: 'blur(4px)',
                  cursor: 'pointer',
                  animation: 'casePopIn 0.2s ease',
                  borderLeft: `2px solid ${drop.color}`,
                }}
              >
                <img src={caseImg} alt="" style={{
                  width: '56px', height: '56px', objectFit: 'contain', flexShrink: 0,
                  filter: `drop-shadow(0 0 12px ${drop.color})`,
                }} />
                <div>
                  <p style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>{drop.caseName}</p>
                  <p style={{
                    fontSize: '11px', fontWeight: '800', color: drop.color,
                    textShadow: `0 0 10px ${drop.color}80`,
                  }}>Открыть →</p>
                </div>
              </div>
            )}

            {/* Контент */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '9px' }}>
              {/* Аватарка */}
              <div
                className="avatar-btn"
                onClick={() => drop.steamId && router.push(`/profile/${drop.steamId}`)}
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: `1.5px solid ${drop.color}80`,
                  boxShadow: `0 0 8px ${drop.color}40`,
                  cursor: drop.steamId ? 'pointer' : 'default',
                  transition: 'transform 0.2s',
                  background: `${drop.color}20`,
                }}
              >
                {drop.avatar
                  ? <img src={drop.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👤</div>
                }
              </div>

              {/* Текст */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                  <span style={{
                    fontSize: '11px', color: '#ddd', fontWeight: '600',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{drop.username || 'Игрок'}</span>
                  {i === 0 && (
                    <span style={{
                      fontSize: '8px', color: '#4caf50', fontWeight: '900',
                      background: 'rgba(76,175,80,0.12)', padding: '1px 4px',
                      borderRadius: '3px', flexShrink: 0, letterSpacing: '0.5px',
                      border: '1px solid rgba(76,175,80,0.2)',
                    }}>NEW</span>
                  )}
                </div>
                <p style={{
                  fontSize: '11px', fontWeight: '700', color: drop.color,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textShadow: isHovered ? `0 0 8px ${drop.color}` : 'none',
                  transition: 'text-shadow 0.3s',
                }}>{drop.name}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}