'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function PublicProfilePage() {
  const router = useRouter()
  const params = useParams()
  const steamId = params.steamId as string
  const [user, setUser] = useState<any>(null)
  const [drops, setDrops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!steamId) return
    fetch(`/api/profile/${steamId}`)
      .then(r => r.json())
      .then(data => {
        setUser(data.user)
        setDrops(data.drops)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [steamId])

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '18px', color: '#888' }}>Загрузка профиля...</div>
    </main>
  )

  if (!user) return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>👤</div>
      <div style={{ fontSize: '18px', color: '#888' }}>Профиль не найден</div>
      <button onClick={() => router.push('/')} style={{ background: '#e94560', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
        На главную
      </button>
    </main>
  )

  const totalEarned = drops.reduce((sum: number, d: any) => sum + d.price, 0)

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0a0a1a', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e94560', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>OtakuCase</span>
        <button onClick={() => router.back()} style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', color: '#e94560', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          ← Назад
        </button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Шапка профиля */}
        <div style={{ background: '#16213e', borderRadius: '16px', padding: '28px', marginBottom: '24px', border: '1px solid #1e2a4a', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e94560', flexShrink: 0 }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e94560, #8847ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>👤</div>
            }
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{user.username || 'Игрок'}</h1>
            <span style={{ fontSize: '12px', color: '#555' }}>Steam ID: {user.steamId}</span>
          </div>
        </div>

        {/* Статистика */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Дропов выбито', value: drops.length, color: '#4b9de8' },
            { label: 'Заработано', value: `${totalEarned.toLocaleString()} ₽`, color: '#4caf50' },
            { label: 'Лучший дроп', value: drops.length ? `${Math.max(...drops.map((d: any) => d.price)).toLocaleString()} ₽` : '—', color: '#e4ae39' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#16213e', borderRadius: '12px', padding: '16px', border: '1px solid #1e2a4a' }}>
              <p style={{ color: '#555', fontSize: '12px', marginBottom: '6px' }}>{stat.label}</p>
              <p style={{ color: stat.color, fontWeight: 'bold', fontSize: '18px' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* История дропов */}
        <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>📜 Дропы игрока ({drops.length})</h2>
          {drops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📜</div>
              <p>У игрока пока нет дропов</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {drops.map((drop: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f1021', borderRadius: '8px', padding: '12px 16px', borderLeft: `3px solid ${drop.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🔫</span>
                    <div>
                      <p style={{ color: drop.color, fontWeight: 'bold', fontSize: '13px' }}>{drop.name}</p>
                      <p style={{ color: '#555', fontSize: '11px' }}>{drop.caseName}</p>
                    </div>
                  </div>
                  <span style={{ color: '#e94560', fontWeight: 'bold' }}>{drop.price.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}