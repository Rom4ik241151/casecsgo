'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

const proxyImage = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`

export default function ProfilePage() {
  const router = useRouter()
  const { balance, setBalance, steamUser, setSteamUser } = useStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sellingId, setSellingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const [stats, setStats] = useState({ casesOpened: 0, upgradesCount: 0, totalWon: 0 })
  const [tradeUrl, setTradeUrl] = useState('')
  const [savingTrade, setSavingTrade] = useState(false)
  const [tradeSaved, setTradeSaved] = useState(false)

  // Читаем cookie steam_user, как на главной странице
  useEffect(() => {
    setMounted(true)
    if (steamUser) return

    const cookies = document.cookie.split(';')
    const steamCookie = cookies.find(c => c.trim().startsWith('steam_user='))
    if (steamCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(steamCookie.split('=')[1]))
        setSteamUser(user)
        fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ steamId: user.steamId, username: user.name, avatar: user.avatar })
        })
          .then(r => r.json())
          .then(dbUser => {
            if (dbUser?.balance !== undefined) setBalance(dbUser.balance)
          })
          .catch(() => {})
      } catch {}
    }
  }, [])

  const steamId = (steamUser as any)?.steamId
  const username = (steamUser as any)?.name || 'Игрок'
  const avatar = (steamUser as any)?.avatar || null

  const loadInventory = () => {
    if (!steamId) {
      setLoading(false)
      return
    }
    fetch(`/api/inventory?steamId=${steamId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const loadStats = () => {
    if (!steamId) return
    fetch(`/api/profile/stats?steamId=${steamId}`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setStats({ casesOpened: data.casesOpened, upgradesCount: data.upgradesCount, totalWon: data.totalWon })
          setTradeUrl(data.tradeUrl || '')
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadInventory()
    loadStats()
  }, [steamId])

  const handleSell = async (item: any) => {
    if (!steamId || sellingId) return
    setSellingId(item.id)
    try {
      const res = await fetch('/api/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, sell: true, steamId }),
      })
      const data = await res.json()
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== item.id))
        if (typeof data.balance === 'number') setBalance(data.balance)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSellingId(null)
    }
  }

  const handleSaveTrade = async () => {
    if (!steamId || savingTrade) return
    setSavingTrade(true)
    setTradeSaved(false)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamId, tradeUrl }),
      })
      if (res.ok) {
        setTradeSaved(true)
        setTimeout(() => setTradeSaved(false), 2000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingTrade(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'steam_user=; max-age=0; path=/'
    setSteamUser(null)
    router.push('/')
  }

  const totalInventoryValue = items.reduce((sum, i) => sum + i.price, 0)

  if (!mounted) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a14', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666' }}>Загрузка...</p>
      </main>
    )
  }

  if (!steamId) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a14', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '18px', color: '#888' }}>Войдите через Steam, чтобы увидеть профиль</p>
        <button onClick={() => router.push('/')} style={{ background: '#e84b6a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          На главную
        </button>
      </main>
    )
  }

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(22,33,62,0.9), rgba(26,26,46,0.9))',
    borderRadius: '16px',
    border: '1px solid rgba(136,71,255,0.15)',
    padding: '20px',
  }

  const isTradeValid = tradeUrl.trim() === '' || tradeUrl.includes('steamcommunity.com/tradeoffer/new')

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a14', color: 'white' }}>
      <nav style={{ background: 'rgba(8,8,20,0.98)', borderBottom: '1px solid rgba(233,69,96,0.3)', padding: '0 24px', height: '70px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>OtakuCase</span>
        <span style={{ color: '#555' }}>→</span>
        <span style={{ color: '#888', fontSize: '14px' }}>Профиль</span>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 20px' }}>

        {/* Верхний ряд: профиль + трейд-ссылка */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '14px', overflow: 'hidden', border: '2px solid #e84b6a', flexShrink: 0 }}>
                {avatar
                  ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: '#0f1021' }}>👤</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{username}</p>
                <p style={{ color: '#666', fontSize: '12px' }}>SteamID: {steamId}</p>
              </div>
              <button onClick={handleLogout} style={{
                background: 'rgba(232,75,106,0.12)', border: '1px solid rgba(232,75,106,0.4)',
                color: '#e84b6a', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
              }}>
                Выйти →
              </button>
            </div>

            {/* Трейд-ссылка */}
            <div>
              <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                Ссылка на обмен Steam (для вывода скинов)
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  value={tradeUrl}
                  onChange={e => setTradeUrl(e.target.value)}
                  placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
                  style={{
                    flex: '1 1 280px', background: '#0a0a14', border: `1px solid ${isTradeValid ? 'rgba(136,71,255,0.25)' : '#e84b6a'}`,
                    color: 'white', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none',
                  }}
                />
                <a
                  href="https://steamcommunity.com/my/tradeoffers/privacy"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(136,71,255,0.25)',
                    color: '#a570ff', padding: '10px 16px', borderRadius: '10px', fontSize: '13px',
                    textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', fontWeight: 'bold',
                  }}
                >
                  Где найти?
                </a>
                <button
                  onClick={handleSaveTrade}
                  disabled={savingTrade || !isTradeValid}
                  style={{
                    background: tradeSaved ? '#4caf50' : '#e84b6a', color: 'white', border: 'none',
                    padding: '10px 24px', borderRadius: '10px', cursor: (savingTrade || !isTradeValid) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold', fontSize: '13px', opacity: (savingTrade || !isTradeValid) ? 0.6 : 1, whiteSpace: 'nowrap',
                  }}
                >
                  {tradeSaved ? '✓ Сохранено' : savingTrade ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
              {!isTradeValid && (
                <p style={{ color: '#e84b6a', fontSize: '12px', marginTop: '6px' }}>
                  Ссылка должна быть вида steamcommunity.com/tradeoffer/new/...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={cardStyle}>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Открыто кейсов</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#fff' }}>{stats.casesOpened}</p>
          </div>
          <div style={cardStyle}>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Выведено всего</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#f5a623' }}>{stats.totalWon} ₽</p>
          </div>
          <div style={cardStyle}>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Улучшений</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#a570ff' }}>{stats.upgradesCount}</p>
          </div>
          <div style={cardStyle}>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Баланс</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#e84b6a' }}>{balance.toFixed(2)} ₽</p>
          </div>
        </div>

        {/* Кнопка пополнения */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => router.push('/payment')} style={{
            background: 'linear-gradient(135deg, #e84b6a, #8847ff)', color: 'white', border: 'none',
            padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
          }}>
            💳 Пополнить баланс
          </button>
        </div>

        {/* Инвентарь */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>🎒 Инвентарь ({items.length})</h2>
            <p style={{ color: '#888', fontSize: '13px' }}>Общая стоимость: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{totalInventoryValue.toFixed(2)} ₽</span></p>
          </div>

          {loading ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Загрузка...</p>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
              <p style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '16px' }}>Предметов нет</p>
              <p style={{ marginBottom: '16px', color: '#555', fontSize: '13px' }}>Откройте кейсы, чтобы получить предметы</p>
              <button onClick={() => router.push('/')} style={{ background: '#e84b6a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                Открыть кейс →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {items.map(item => (
                <div key={item.id} style={{
                  background: 'linear-gradient(135deg, #0d1117, #16213e)', borderRadius: '14px', padding: '12px',
                  textAlign: 'center', border: `1px solid ${item.color || '#1e2a4a'}40`,
                }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
                    {item.image
                      ? <img src={proxyImage(item.image)} alt={item.name} style={{ width: '100%', height: '70px', objectFit: 'contain' }} />
                      : <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎁</div>
                    }
                  </div>
                  <p style={{ color: '#bbb', fontSize: '11px', marginBottom: '4px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
                    {item.name}
                  </p>
                  <p style={{ color: '#e84b6a', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>{item.price} ₽</p>
                  <button
                    onClick={() => handleSell(item)}
                    disabled={sellingId === item.id}
                    style={{
                      width: '100%', background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.4)',
                      color: '#4caf50', borderRadius: '8px', padding: '6px', fontSize: '12px', fontWeight: 'bold',
                      cursor: sellingId === item.id ? 'not-allowed' : 'pointer',
                      opacity: sellingId === item.id ? 0.6 : 1,
                    }}
                  >
                    {sellingId === item.id ? 'Продажа...' : 'Продать'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}