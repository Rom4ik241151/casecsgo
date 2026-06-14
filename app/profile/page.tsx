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
  const [ghostItems, setGhostItems] = useState<any[]>([])

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
        else setItems([])
      })
      .catch(() => { setItems([]) })
      .finally(() => setLoading(false))
  }
  const loadGhostItems = () => {
    fetch('/api/items?limit=40')
  .then(r => r.json())
  .then(data => {
    if (Array.isArray(data)) {
      const shuffled = data.sort(() => Math.random() - 0.5)
      setGhostItems(shuffled.slice(0, 8))
    }
  })
  .catch(() => {})
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGhostItems(data.slice(0, 8)) })
      .catch(() => {})
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
    loadGhostItems()
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

  // Ранг игрока по количеству открытых кейсов
  const getRank = (count: number) => {
    if (count >= 500) return { name: 'Легенда', color: '#e4ae39', icon: 'crown' }
    if (count >= 200) return { name: 'Ветеран', color: '#d32ce6', icon: 'medal' }
    if (count >= 100) return { name: 'Профи', color: '#8847ff', icon: 'star' }
    if (count >= 30) return { name: 'Опытный', color: '#4b9de8', icon: 'diamond' }
    return { name: 'Новичок', color: '#888', icon: 'circle' }
  }
  const rank = getRank(stats.casesOpened)

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
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        .fade-card {
          animation: fadeInUp 0.5s ease both;
        }
        .stat-box {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-box:hover {
          transform: translateY(-4px);
          border-color: rgba(232,75,106,0.5);
          box-shadow: 0 8px 24px rgba(232,75,106,0.15);
        }
        .inv-item {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .inv-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }
        .sell-btn:hover:not(:disabled) {
          background: rgba(76,175,80,0.25) !important;
        }
        .rank-badge {
          animation: glowPulse 2.5s ease-in-out infinite;
        }
        .deco-icon {
          animation: floatSlow 5s ease-in-out infinite;
        }
          @keyframes particleFloat {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.07; }
        }
          @keyframes pulse {
          from { opacity: 0.15; }
          to { opacity: 0.35; }
        }
      `}</style>
      {/* Анимированный фон */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Сетка */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(136,71,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(136,71,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridPulse 4s ease-in-out infinite'
        }} />
        {/* Градиентные пятна */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,75,106,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(136,71,255,0.08) 0%, transparent 70%)',
        }} />
        {/* Частицы */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 8.3) % 100}%`,
            top: `${100 + (i * 7) % 20}%`,
            width: i % 3 === 0 ? '3px' : '2px',
            height: i % 3 === 0 ? '3px' : '2px',
            borderRadius: '50%',
            background: i % 2 === 0 ? '#e84b6a' : '#8847ff',
            animation: `particleFloat ${8 + i * 1.5}s linear infinite`,
            animationDelay: `${i * 0.8}s`,
            boxShadow: `0 0 6px ${i % 2 === 0 ? '#e84b6a' : '#8847ff'}`
          }} />
        ))}
      </div>

      <nav style={{ position: 'relative', zIndex: 1, background: 'rgba(8,8,20,0.98)', borderBottom: '1px solid rgba(233,69,96,0.3)', padding: '0 24px', height: '70px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>OtakuCase</span>
        <span style={{ color: '#555' }}>→</span>
        <span style={{ color: '#888', fontSize: '14px' }}>Профиль</span>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '24px auto', padding: '0 20px' }}>

        {/* Шапка профиля с декором */}
        <div className="fade-card" style={{
          ...cardStyle,
          position: 'relative', overflow: 'visible',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(232,75,106,0.12), rgba(136,71,255,0.08), rgba(22,33,62,0.9))',
          border: '1px solid rgba(232,75,106,0.25)',
        }}>
          {/* фоновый узор */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '16px', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 680 220" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e84b6a" stopOpacity="0.18"/>
                  <stop offset="50%" stopColor="#8847ff" stopOpacity="0.10"/>
                  <stop offset="100%" stopColor="#16213e" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <rect width="680" height="220" fill="#0a0a14"/>
              <rect width="680" height="220" fill="url(#bgGrad)"/>
              <g stroke="#e84b6a" strokeOpacity="0.25" strokeWidth="1" fill="none">
                <rect x="520" y="20" width="40" height="40" rx="4" transform="rotate(15 540 40)"/>
                <rect x="580" y="60" width="28" height="28" rx="4" transform="rotate(15 594 74)"/>
                <rect x="600" y="120" width="50" height="50" rx="4" transform="rotate(15 625 145)"/>
                <rect x="500" y="130" width="30" height="30" rx="4" transform="rotate(15 515 145)"/>
                <rect x="630" y="20" width="22" height="22" rx="4" transform="rotate(15 641 31)"/>
              </g>
              <g stroke="#8847ff" strokeOpacity="0.18" strokeWidth="1" fill="none">
                <rect x="450" y="80" width="35" height="35" rx="4" transform="rotate(15 467 97)"/>
                <rect x="560" y="170" width="45" height="45" rx="4" transform="rotate(15 582 192)"/>
                <circle cx="430" cy="40" r="14"/>
                <circle cx="620" cy="200" r="18"/>
              </g>
              <g stroke="#e84b6a" strokeOpacity="0.12" strokeWidth="0.5" fill="none">
                <line x1="480" y1="0" x2="680" y2="200"/>
                <line x1="540" y1="0" x2="680" y2="140"/>
                <line x1="400" y1="220" x2="600" y2="20"/>
              </g>
            </svg>
          </div>
          {/* угловые скобки */}
          {[
            { top: -2, left: -2, b: 'borderTop, borderLeft' },
            { top: -2, right: -2, b: 'borderTop, borderRight' },
            { bottom: -2, left: -2, b: 'borderBottom, borderLeft' },
            { bottom: -2, right: -2, b: 'borderBottom, borderRight' },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: '28px', height: '28px',
              top: pos.top, left: (pos as any).left, right: (pos as any).right, bottom: (pos as any).bottom,
              borderTop: pos.b.includes('borderTop') ? '3px solid #e84b6a' : 'none',
              borderBottom: pos.b.includes('borderBottom') ? '3px solid #e84b6a' : 'none',
              borderLeft: pos.b.includes('borderLeft') ? '3px solid #e84b6a' : 'none',
              borderRight: pos.b.includes('borderRight') ? '3px solid #e84b6a' : 'none',
              borderRadius: '6px',
              filter: 'drop-shadow(0 0 4px rgba(232,75,106,0.6))',
              pointerEvents: 'none', zIndex: 2,
            }} />
          ))}
          {/* декоративные пятна */}
          
          <div className="deco-icon" style={{ position: 'absolute', top: '10px', right: '20px', opacity: 0.12, pointerEvents: 'none' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e84b6a" strokeWidth="1">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '76px', height: '76px', borderRadius: '18px', overflow: 'hidden',
                  border: '3px solid #e84b6a', boxShadow: '0 0 24px rgba(232,75,106,0.5)',
                }}>
                  {avatar
                    ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: '#0f1021' }}>👤</div>
                  }
                </div>
                <div style={{
                  position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                  background: '#0a0a14', border: `1px solid ${rank.color}`,
                  borderRadius: '20px', padding: '3px 12px 3px 6px', fontSize: '11px', fontWeight: 'bold',
                  color: rank.color, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <svg width="14" height="14" viewBox="0 0 80 100" fill="none">
                    <path d="M40 0 L78 14 L78 50 Q78 85 40 100 Q2 85 2 50 L2 14 Z" fill={rank.color} fillOpacity="0.2" stroke={rank.color} strokeWidth="3"/>
                    {rank.icon === 'circle' && <circle cx="40" cy="45" r="14" fill="none" stroke={rank.color} strokeWidth="5"/>}
                    {rank.icon === 'diamond' && <path d="M40 30 L52 45 L40 60 L28 45 Z" fill="none" stroke={rank.color} strokeWidth="5"/>}
                    {rank.icon === 'star' && <path d="M40 28 L48 44 L66 46 L53 58 L57 76 L40 67 L23 76 L27 58 L14 46 L32 44 Z" fill="none" stroke={rank.color} strokeWidth="5"/>}
                    {rank.icon === 'medal' && <><path d="M22 35 L40 50 L58 35 M40 50 L40 70" fill="none" stroke={rank.color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="40" cy="35" r="12" fill="none" stroke={rank.color} strokeWidth="5"/></>}
                    {rank.icon === 'crown' && <><path d="M22 40 L30 30 L40 38 L50 30 L58 40 L54 58 L26 58 Z" fill="none" stroke={rank.color} strokeWidth="5" strokeLinejoin="round"/><circle cx="30" cy="30" r="4" fill={rank.color}/><circle cx="40" cy="26" r="4" fill={rank.color}/><circle cx="50" cy="30" r="4" fill={rank.color}/></>}
                  </svg>
                  {rank.name}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <p style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>{username}</p>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>SteamID: {steamId}</p>
                {(() => {
                  const thresholds = [0, 30, 100, 200, 500]
                  const next = thresholds.find(t => t > stats.casesOpened) ?? 500
                  const prev = [...thresholds].reverse().find(t => t <= stats.casesOpened) ?? 0
                  const progress = next === prev ? 100 : Math.min(100, ((stats.casesOpened - prev) / (next - prev)) * 100)
                  return (
                    <div style={{ maxWidth: '260px' }}>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${rank.color}, #e84b6a)`, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                      </div>
                      <p style={{ color: '#555', fontSize: '10px', marginTop: '4px' }}>
                        {stats.casesOpened} / {next} кейсов до следующего ранга
                      </p>
                    </div>
                  )
                })()}
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
          <div className="fade-card stat-box" style={{ ...cardStyle, animationDelay: '0.05s', borderBottom: '2px solid rgba(255,255,255,0.15)' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '-14px', opacity: 0.08 }}>
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1"><path d="M21 8L12 3 3 8l9 5 9-5z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/></svg>
            </div>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Открыто кейсов</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#fff' }}>{stats.casesOpened}</p>
          </div>
          <div className="fade-card stat-box" style={{ ...cardStyle, animationDelay: '0.1s', borderBottom: '2px solid rgba(245,166,35,0.4)' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '-14px', opacity: 0.08 }}>
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="1"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h4.5a1.5 1.5 0 010 3H9.5a1.5 1.5 0 000 3H15"/></svg>
            </div>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Выведено всего</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#f5a623' }}>{stats.totalWon} ₽</p>
          </div>
          <div className="fade-card stat-box" style={{ ...cardStyle, animationDelay: '0.15s', borderBottom: '2px solid rgba(165,112,255,0.4)' }}>
           <div style={{ position: 'absolute', top: '-14px', right: '-14px', opacity: 0.08 }}>
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#a570ff" strokeWidth="1"><path d="M13 2L4 13h6l-1 9 9-11h-6l1-9z"/></svg>
            </div>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Улучшений</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#a570ff' }}>{stats.upgradesCount}</p>
          </div>
          <div className="fade-card stat-box" style={{ ...cardStyle, animationDelay: '0.2s', borderBottom: '2px solid rgba(232,75,106,0.4)' }}>
            <div style={{ position: 'absolute', bottom: '4px', right: '-10px', opacity: 0.18, transform: 'rotate(-8deg)' }}>
              <svg width="90" height="50" viewBox="0 0 135 40" fill="#e84b6a">
                <rect x="0" y="15" width="120" height="8" rx="2"/>
                <rect x="105" y="6" width="8" height="26" rx="2"/>
                <rect x="15" y="23" width="10" height="18" rx="2"/>
                <path d="M112 15 L132 4 L135 13 L118 24 Z"/>
              </svg>
            </div>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Баланс</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#e84b6a' }}>{balance.toFixed(2)} ₽</p>
          </div>
        </div>

        {/* Кнопка пополнения */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => router.push('/payment')} style={{
            background: 'linear-gradient(135deg, #e84b6a, #8847ff)', color: 'white', border: 'none',
            padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
            boxShadow: '0 4px 16px rgba(232,75,106,0.3)',
          }}>
            Пополнить баланс
          </button>
        </div>

        {/* Инвентарь */}
        {/* Инвентарь */}
        <div className="fade-card" style={{ ...cardStyle, animationDelay: '0.25s', overflow: 'hidden', padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Инвентарь ({items.length})</h2>
            <p style={{ color: '#888', fontSize: '13px' }}>Общая стоимость: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{totalInventoryValue.toFixed(2)} ₽</span></p>
          </div>

          {loading ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Загрузка...</p>
          ) : items.length === 0 ? (
            <div style={{ position: 'relative', minHeight: '280px', padding: '0 20px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', filter: 'blur(1px)', opacity: 6, pointerEvents: 'none' }}>
                {(ghostItems.length > 0 ? ghostItems : Array(8).fill(null)).map((item, i) => (
  <div key={i} style={{
    background: 'linear-gradient(135deg, #0d1117, #1a1a2e)',
    borderRadius: '14px', padding: '12px', textAlign: 'center',
    border: '1px solid rgba(136,71,255,0.3)',
    animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite alternate`
  }}>
    <div style={{ height: '70px', background: 'rgba(136,71,255,0.05)', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {item?.image
        ? <img src={proxyImage(item.image)} alt={item?.name} style={{ width: '100%', height: '70px', objectFit: 'contain' }} />
        : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8847ff" strokeWidth="1"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      }
    </div>
    <p style={{ color: '#666', fontSize: '11px', marginBottom: '4px' }}>{item?.name || '???'}</p>
    <p style={{ color: '#8847ff', fontSize: '13px', fontWeight: 'bold' }}>{item ? `${Math.round(item.price)} ₽` : '??? ₽'}</p>
  </div>
))}
              </div>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(ellipse at center, rgba(10,10,20,0.0) 0%, rgba(10,10,20,0.15) 40%)'
              }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Инвентарь пуст</p>
                <p style={{ color: '#555', fontSize: '13px', marginBottom: '20px' }}>Откройте кейсы, чтобы получить предметы</p>
                <button onClick={() => router.push('/')} style={{
                  background: 'linear-gradient(135deg, #e84b6a, #8847ff)',
                  color: 'white', border: 'none', padding: '12px 28px',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
                  boxShadow: '0 4px 20px rgba(232,75,106,0.4)'
                }}>Открыть кейс →</button>
              </div>
              
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {items.map(item => {
                const color = item.color || '#888888'
                return (
                  <div key={item.id} className="inv-item" style={{
                    background: `linear-gradient(135deg, #0d1117, ${color}15)`, borderRadius: '14px', padding: '12px',
                    textAlign: 'center', border: `1px solid ${color}40`,
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
                      {item.image
                        ? <img src={proxyImage(item.image)} alt={item.name} style={{ width: '100%', height: '70px', objectFit: 'contain' }} />
                        : <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.3"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 8h18M12 8v13"/></svg></div>
                      }
                    </div>
                    <p style={{ color: '#bbb', fontSize: '11px', marginBottom: '4px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
                      {item.name}
                    </p>
                    <p style={{ color: '#e84b6a', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>{item.price} ₽</p>
                    <button
                      className="sell-btn"
                      onClick={() => handleSell(item)}
                      disabled={sellingId === item.id}
                      style={{
                        width: '100%', background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.4)',
                        color: '#4caf50', borderRadius: '8px', padding: '6px', fontSize: '12px', fontWeight: 'bold',
                        cursor: sellingId === item.id ? 'not-allowed' : 'pointer',
                        opacity: sellingId === item.id ? 0.6 : 1, transition: 'background 0.2s ease',
                      }}
                    >
                      {sellingId === item.id ? 'Продажа...' : 'Продать'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}