'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'


export default function DropsPanel() {
  const [drops, setDrops] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/cases').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCases(data)
    }).catch(() => {})
  }, [])

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
      width: '260px', flexShrink: 0,
      background: `linear-gradient(rgba(5,5,20,0.82), rgba(5,5,20,0.82)), url(/bg2.png) top/cover no-repeat`,
      borderRight: '1px solid rgba(233,69,96,0.15)',
      overflowY: 'auto', overflowX: 'hidden',
      height: 'calc(100vh - 80px)',
      position: 'sticky', top: 80,
      scrollbarWidth: 'none',
    }}>
      <style>{`
        @keyframes shimmerText {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Шапка */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: '8px',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(5,5,20,0.95)',
      }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#e94560', display: 'inline-block',
          boxShadow: '0 0 8px #e94560',
          animation: 'pulse 2s infinite', flexShrink: 0,
        }} />
        <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>
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
        const caseData = cases.find(c => c.name === drop.caseName)
        const caseImg = caseData?.image || null

        return (
          <div
            key={drop.id}
            onMouseEnter={() => setHoveredId(drop.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              position: 'relative', overflow: 'hidden',
              height: '120px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              animation: i === 0 ? 'slideDown 0.4s ease' : 'none',
              background: isHovered ? `${drop.color}08` : 'transparent',
              transition: 'background 0.2s',
            }}
          >
            {/* Цветная полоска слева */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
              background: drop.color,
              opacity: i === 0 || isHovered ? 1 : 0.25,
              boxShadow: isHovered ? `0 0 10px ${drop.color}` : 'none',
              transition: 'all 0.3s', zIndex: 2,
            }} />

            {/* Размытый фон */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: caseImg ? `url(${caseImg})` : 'none',
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: isHovered ? 0.08 : 0,
              filter: 'blur(8px)', transform: 'scale(1.2)',
              transition: 'opacity 0.4s ease', zIndex: 0,
            }} />

            {/* Обычный вид */}
            {!isHovered && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                display: 'flex', alignItems: 'center',
                gap: '10px', padding: '0 12px 0 14px',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: `1.5px solid ${drop.color}60`,
                  boxShadow: `0 0 8px ${drop.color}30`,
                  background: `${drop.color}20`,
                }}>
                  {drop.avatar
                    ? <img src={drop.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '16px' }}>
                    <span style={{
                      fontSize: '11px', color: '#666', fontWeight: '500', letterSpacing: '0.5px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>👤 {drop.username || 'Игрок'}</span>
                    {i === 0 && (
                      <span style={{
                        fontSize: '8px', color: '#4caf50', fontWeight: '900',
                        background: 'rgba(76,175,80,0.12)', padding: '1px 4px',
                        borderRadius: '3px', flexShrink: 0,
                        border: '1px solid rgba(76,175,80,0.2)',
                      }}>NEW</span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '14px', fontWeight: '800', color: drop.color,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textShadow: `0 0 10px ${drop.color}80`,
                    letterSpacing: '0.3px',
                  }}>{drop.name}</p>
                  <p style={{
                    fontSize: '10px', color: '#444', fontWeight: '500', marginTop: '2px',
                  }}>из {drop.caseName}</p>
                </div>
              </div>
            )}

            {/* Ховер вид: кейс слева, аватар справа */}
            {isHovered && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 3,
                display: 'flex', alignItems: 'stretch',
                animation: 'popIn 0.2s ease',
              }}>
                {/* Аватар — левая (меньше) */}
                <div
                  onClick={() => drop.steamId && router.push(`/profile/${drop.steamId}`)}
                  style={{
                    flex: '0 0 35%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '4px',
                    background: 'rgba(8,8,20,0.9)',
                    cursor: drop.steamId ? 'pointer' : 'default',
                    padding: '6px',
                    borderRight: `1px solid ${drop.color}30`,
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid ${drop.color}`,
                    boxShadow: `0 0 10px ${drop.color}60`,
                  }}>
                    {drop.avatar
                      ? <img src={drop.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: `${drop.color}20` }}>👤</div>
                    }
                  </div>
                  <span style={{ fontSize: '8px', color: '#aaa', fontWeight: '700' }}>Профиль</span>
                </div>

                {/* Кейс — правая (шире) */}
<div
  onClick={() => { const c = cases.find(c => c.name === drop.caseName); if (c) router.push(`/case/${c.id}`) }}
  style={{
    flex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '4px',
    background: `linear-gradient(135deg, rgba(8,8,20,0.95), ${drop.color}30)`,
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    padding: '0',
  }}
>
  <style>{`
    @keyframes floatCase {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-4px) scale(1.06); }
    }
  `}</style>

  {caseImg && (
    <img src={caseImg} alt="" style={{
      width: '68px', height: '68px', objectFit: 'contain',
      marginBottom: '-6px',
      animation: 'floatCase 2s ease-in-out infinite',
      position: 'relative', zIndex: 1,
      filter: `drop-shadow(0 0 12px ${drop.color}) drop-shadow(0 0 24px ${drop.color}80)`,
    }} />
  )}

  <span style={{
    fontSize: '11px', fontWeight: '900', letterSpacing: '2px',
    position: 'relative', zIndex: 1,
    background: `linear-gradient(90deg, ${drop.color}, #fff, ${drop.color})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundSize: '200% auto',
    animation: 'shimmerText 2s linear infinite',
  }}>✦ ОТКРЫТЬ ✦</span>
</div>
                
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}