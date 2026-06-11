'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

export default function Navbar() {
  const router = useRouter()
  const { balance, drops, inventory } = useStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const totalWon = drops.reduce((sum, d) => sum + d.price, 0)

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          CaseCSGO
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#e94560', fontWeight: 'bold' }}>{balance} руб</span>
          <button onClick={() => router.push('/upgrade')} style={{
  background: 'transparent', border: '1px solid #e94560', color: '#e94560',
  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
}}>⚡ Апгрейдер</button>

          <button className="btn btn-primary" onClick={() => router.push('/api/auth/steam')}
  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <img src="https://steamcommunity.com/favicon.ico" width={16} height={16} />
  Войти через Steam
</button>

          <div style={{ position: 'relative' }}>
            <button onClick={() => router.push('/profile')} style={{
              background: '#16213e', border: '1px solid #444', color: 'white',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
            }}>👤 Профиль</button>

            {profileOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '45px', background: '#16213e',
                border: '1px solid #333', borderRadius: '10px', padding: '16px',
                width: '220px', zIndex: 1000
              }}>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Баланс</p>
                <p style={{ color: '#e94560', fontWeight: 'bold', marginBottom: '12px' }}>{balance} руб</p>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Выиграно за всё время</p>
                <p style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: '16px' }}>{totalWon} руб</p>
                <button onClick={() => { router.push('/inventory'); setProfileOpen(false) }} style={{
                  width: '100%', background: '#533483', color: 'white', border: 'none',
                  padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                  marginBottom: '8px'
                }}>🎒 Инвентарь ({inventory.length})</button>
                <button onClick={() => { router.push('/profile'); setProfileOpen(false) }} style={{
                  width: '100%', background: '#16213e', color: 'white', border: '1px solid #444',
                  padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                }}>👤 Страница профиля</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}