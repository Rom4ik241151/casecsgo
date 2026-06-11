'use client'

import { useState, useEffect } from 'react'

const generateRandomNick = () => {
  const names = ['xXSlayer', 'Ivan_cs', 'AWPer', 'KnifeGod', 'CS_Master', 'Pro100', 'Ruslan_G', 'Nikita_K', 'Sanya228']
  return names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100)
}

const itemsList = [
  { name: 'AK-47 | Redline', price: 950, color: '#8847ff' },
  { name: 'AK-47 | Neon Rider', price: 1100, color: '#8847ff' },
  { name: 'AWP | Asiimov', price: 1450, color: '#d32ce6' },
  { name: 'AWP | Neo-Noir', price: 1250, color: '#d32ce6' },
  { name: 'Desert Eagle | Blaze', price: 1850, color: '#eb4b4b' },
  { name: 'USP-S | Kill Confirmed', price: 1650, color: '#d32ce6' },
  { name: 'Glock-18 | Fade', price: 1450, color: '#8847ff' },
  { name: 'M4A4 | Neo-Noir', price: 1150, color: '#8847ff' },
  { name: 'M4A1-S | Printstream', price: 1850, color: '#eb4b4b' },
  { name: 'MAC-10 | Neon Rider', price: 350, color: '#4b69ff' },
]

export default function DropsPanel() {
  const [visibleDrops, setVisibleDrops] = useState<any[]>([])

  useEffect(() => {
    // Начальные дропы
    const initial = Array.from({ length: 25 }, () => {
      const item = itemsList[Math.floor(Math.random() * itemsList.length)]
      return {
        user: generateRandomNick(),
        item: item.name,
        price: item.price,
        color: item.color
      }
    })
    setVisibleDrops(initial)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const item = itemsList[Math.floor(Math.random() * itemsList.length)]
      setVisibleDrops(prev => [{
        user: generateRandomNick(),
        item: item.name,
        price: item.price,
        color: item.color
      }, ...prev].slice(0, 30))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      width: '260px',
      flexShrink: 0,
      background: '#16213e',
      borderRight: '1px solid #0f3460',
      overflowY: 'auto',
      height: 'calc(100vh - 60px)',
      position: 'sticky',
      top: 60
    }}>
      <div style={{
        padding: '15px',
        background: 'rgba(233,69,96,0.08)',
        borderBottom: '1px solid #0f3460',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#e94560',
          display: 'inline-block',
          boxShadow: '0 0 6px #e94560'
        }}></span>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Онлайн дропы</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '11px',
          color: '#e94560',
          background: 'rgba(233,69,96,0.15)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>LIVE</span>
      </div>

      {visibleDrops.map((drop, i) => (
        <div key={i} style={{
          padding: '12px 12px',
          borderBottom: '1px solid rgba(15,52,96,0.6)',
          borderLeft: `2px solid ${i === 0 ? drop.color : 'transparent'}`,
          background: i === 0 ? `${drop.color}08` : (i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: `${drop.color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              border: `1px solid ${drop.color}44`
            }}>
              🎲
            </div>
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#ccc' }}>
              {drop.user}
            </span>
            {i === 0 && (
              <span style={{
                marginLeft: 'auto',
                fontSize: '9px',
                color: '#e94560',
                background: 'rgba(233,69,96,0.15)',
                padding: '2px 5px',
                borderRadius: '3px'
              }}>new</span>
            )}
          </div>
          
          <p style={{
            fontSize: '11px',
            color: drop.color,
            fontWeight: 'bold',
            marginBottom: '5px',
            paddingLeft: '34px'
          }}>
            {drop.item}
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: '34px'
          }}>
            <span style={{ fontSize: '11px', color: '#e94560', fontWeight: 'bold' }}>
              {drop.price.toLocaleString()} ₽
            </span>
            <span style={{ fontSize: '9px', color: '#4a6a8a' }}>
              сейчас
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}