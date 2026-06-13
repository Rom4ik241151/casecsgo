'use client'

import { useState, useEffect } from 'react'
import { useOnline } from './hooks/useOnline'
import { useRouter } from 'next/navigation'
import { useStore } from './store'
import DropsPanel from './components/DropsPanel'

// Цвет по редкости (так как в Case нет color)
const RARITY_COLORS: Record<string, string> = {
  Common: '#888888',
  Uncommon: '#4b69ff',
  Rare: '#8847ff',
  Epic: '#d32ce6',
  Legendary: '#eb4b4b',
  Ancient: '#e4ae39',
}

function getCaseColor(c: any): string {
  // Берём цвет самого редкого предмета в кейсе
  if (c.items && c.items.length > 0) {
    const rarities = ['Ancient', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']
    for (const r of rarities) {
      const found = c.items.find((ci: any) => ci.item?.rarity === r)
      if (found) return RARITY_COLORS[r] ?? '#888888'
    }
    return c.items[0].item?.color ?? '#888888'
  }
  return '#e94560'
}

export default function Home() {
  const router = useRouter()
  const { balance, steamUser, setSteamUser } = useStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [cases, setCases] = useState<any[]>([])
  const [casesLoading, setCasesLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Все')
  const online = useOnline()
  const [totalOpened, setTotalOpened] = useState(0)

  // Загрузка кейсов из БД
  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCases(data)
      })
      .catch(() => {})
      .finally(() => setCasesLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/drops')
      .then(r => r.json())
      .then(data => setTotalOpened(data.total))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const su = urlParams.get('su')
    if (su) {
      try {
        const user = JSON.parse(decodeURIComponent(su))
        document.cookie = `steam_user=${encodeURIComponent(JSON.stringify(user))}; max-age=${60*60*24*7}; path=/`
        setSteamUser(user)
        window.history.replaceState({}, '', '/')
        fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ steamId: user.steamId, username: user.name, avatar: user.avatar })
        }).then(r => r.json()).then(dbUser => {
          if (dbUser?.balance !== undefined) useStore.setState({ balance: dbUser.balance })
        }).catch(() => {})
      } catch {}
    }
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
          .then(r => { if (!r.ok) throw new Error('API error'); return r.json() })
          .then(dbUser => { if (dbUser?.balance !== undefined) useStore.setState({ balance: dbUser.balance }) })
          .catch(e => console.log('User API error:', e))
      } catch {}
    }
  }, [])
useEffect(() => {
    const syncBalance = () => {
      const cookies = document.cookie.split(';')
      const steamCookie = cookies.find(c => c.trim().startsWith('steam_user='))
      if (!steamCookie) return
      try {
        const user = JSON.parse(decodeURIComponent(steamCookie.split('=')[1]))
        fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ steamId: user.steamId, username: user.name, avatar: user.avatar })
        })
          .then(r => r.json())
          .then(dbUser => {
            if (dbUser?.balance !== undefined) useStore.setState({ balance: dbUser.balance })
          })
          .catch(() => {})
      } catch {}
    }
    syncBalance()
    const interval = setInterval(syncBalance, 30000)
    return () => clearInterval(interval)
  }, [])

 const filteredCases = cases.filter(c => {
    if (activeFilter === 'Все') return true
    if (activeFilter === 'Дешёвые') return c.price < 70
    if (activeFilter === 'Средние') return c.price >= 70 && c.price < 150
    if (activeFilter === 'Дорогие') return c.price >= 150
    return true
  })

  const dailyCase = cases.length > 0
    ? cases[Math.floor(Date.now() / 86400000) % cases.length]
    : null

  return (
    <main style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>
      <style jsx global>{`
        @keyframes fastShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .logo-glow {
          background: linear-gradient(90deg, #ffffff 0%, #e94560 15%, #ff6b6b 30%, #e94560 45%, #ff6b6b 60%, #e94560 75%, #ffffff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fastShimmer 2.5s ease-in-out infinite;
          position: relative;
          font-weight: 800;
        }
        .logo-glow::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 15%;
          width: 70%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e94560aa, #ff6b6b88, transparent);
          border-radius: 3px;
          box-shadow: 0 0 6px #e9456066;
        }
        .nav-item { position: relative; transition: all 0.3s ease; }
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: -6px; left: 0;
          width: 0%; height: 2px;
          background: linear-gradient(90deg, #e94560, #ff6b6b);
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .nav-item:hover::after { width: 100%; }
        .balance-card { transition: all 0.3s ease; }
        .balance-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(233,69,96,0.5);
          background: rgba(233,69,96,0.2);
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .skeleton {
          background: linear-gradient(90deg, #1e1e3a 25%, #252545 50%, #1e1e3a 75%);
          background-size: 200% 100%;
          animation: shimmerSkeleton 1.5s infinite;
          border-radius: 16px;
        }
        @keyframes shimmerSkeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Навигация */}
      <nav style={{
        background: 'rgba(8, 8, 20, 0.98)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(233,69,96,0.3)',
        padding: '0 30px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div
          onClick={() => router.push('/')}
          style={{ cursor: 'pointer', fontSize: '44px', fontWeight: '800', letterSpacing: '-1px', padding: '8px 0' }}
          className="logo-glow"
        >
          OtakuCase
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          {[['/', 'Кейсы'], ['/upgrade', 'Апгрейд'], ['/contracts', 'Контракты']].map(([href, label]) => (
            <span
              key={href}
              onClick={() => router.push(href)}
              className="nav-item"
              style={{
                color: href === '/' ? '#fff' : '#aaa',
                cursor: 'pointer', fontSize: '15px', fontWeight: '500',
                padding: '6px 0', borderBottom: '2px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#e94560'}
              onMouseLeave={e => e.currentTarget.style.color = href === '/' ? '#fff' : '#aaa'}
            >{label}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {mounted && steamUser && (
            <div className="balance-card" style={{
              background: 'rgba(233,69,96,0.12)', padding: '10px 24px',
              borderRadius: '50px', border: '1px solid rgba(233,69,96,0.4)',
              display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s ease'
            }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '20px', fontFamily: 'monospace' }}>
                {balance.toFixed(2)} ₽
              </span>
            </div>
          )}

          {mounted && steamUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                onClick={() => router.push('/profile')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(233,69,96,0.08)',
                  border: '1px solid rgba(233,69,96,0.3)',
                  padding: '6px 14px 6px 6px', borderRadius: '50px',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(233,69,96,0.2)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(233,69,96,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(233,69,96,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <img src={(steamUser as any).avatar} width={32} height={32} style={{ borderRadius: '50%', border: '2px solid #e94560' }} />
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{(steamUser as any).name}</span>
              </div>
              <button onClick={() => {
                document.cookie = 'steam_user=; max-age=0; path=/'
                setSteamUser(null)
              }} style={{
                background: 'transparent', border: '1px solid #444',
                color: '#888', padding: '6px 12px', borderRadius: '20px',
                cursor: 'pointer', fontSize: '12px'
              }}>Выйти</button>
            </div>
          ) : mounted ? (
            <button
              onClick={() => router.push('/api/auth/steam')}
              style={{
                background: 'linear-gradient(135deg, #1b2838, #2a475e)',
                color: 'white', border: '1px solid #4c6b22',
                padding: '10px 20px', borderRadius: '50px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <img src="https://store.steampowered.com/favicon.ico" width={16} height={16} />
              Войти через Steam
            </button>
          ) : null}
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <DropsPanel />

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Хиро */}
          <div style={{ position: 'relative', padding: '60px 40px', textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url(/bg.png) center/cover no-repeat' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ color: '#e94560', fontSize: '13px', letterSpacing: '4px', marginBottom: '15px', fontWeight: 'bold' }}>★ CSGO CASE OPENING ★</p>
              <h1 style={{ fontSize: '52px', fontWeight: 'bold', lineHeight: 1.2, marginBottom: '20px', color: '#fff' }}>
                Открывай кейсы и<br />
                <span style={{ background: 'linear-gradient(135deg, #e94560, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  выигрывай скины!
                </span>
              </h1>
              <p style={{ color: '#aaa', marginBottom: '35px', fontSize: '15px' }}>
                Честные шансы • Мгновенные выплаты • {casesLoading ? '...' : cases.length} кейсов
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '70px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e94560' }}>
                    {casesLoading ? '...' : `${cases.length}+`}
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Кейсов</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e94560', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                    {online}<span style={{ fontSize: '14px', color: '#4caf50' }}>●</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Игроков онлайн</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e94560' }}>{totalOpened}</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Открытий</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '30px 40px' }}>
            {/* Кейс дня */}
            {casesLoading ? (
              <div className="skeleton" style={{ height: '140px', marginBottom: '35px' }} />
            ) : dailyCase ? (() => {
              const color = getCaseColor(dailyCase)
              // Считаем oldPrice как price * 2 (у нас нет oldPrice в схеме)
              const oldPrice = dailyCase.price * 2
              return (
                <div
                  style={{
                    borderRadius: '20px', marginBottom: '35px',
                    background: 'linear-gradient(135deg, #16213e, #1a1a2e)',
                    border: `1px solid ${color}60`,
                    padding: '20px 25px', transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 0 30px ${color}60`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
                    {dailyCase.image ? (
                      <img
                        src={dailyCase.image}
                        alt={dailyCase.name}
                        style={{ width: '100px', height: '100px', objectFit: 'contain', filter: `drop-shadow(0 4px 15px ${color})` }}
                      />
                    ) : (
                      <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>📦</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ color, fontSize: '11px', letterSpacing: '2px', marginBottom: '5px', fontWeight: 'bold' }}>КЕЙС ДНЯ</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>{dailyCase.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <s style={{ color: '#666', fontSize: '16px' }}>{oldPrice} ₽</s>
                        <span style={{ color, fontWeight: 'bold', fontSize: '28px' }}>{dailyCase.price} ₽</span>
                        <span style={{ background: color, color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>-50%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/case/' + dailyCase.id)}
                      style={{
                        background: color, color: 'white', border: 'none',
                        padding: '10px 30px', borderRadius: '30px',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Открыть
                    </button>
                  </div>
                </div>
              )
            })() : null}

            {/* Фильтры */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Все', 'Дешёвые', 'Средние', 'Дорогие'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  style={{
                    background: activeFilter === cat ? '#e94560' : 'rgba(255,255,255,0.05)',
                    color: activeFilter === cat ? '#fff' : '#aaa',
                    border: activeFilter === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 28px', borderRadius: '30px',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Скелетон / Сетка кейсов */}
            {casesLoading ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton" style={{ width: '200px', height: '260px' }} />
                ))}
              </div>
            ) : filteredCases.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#555', padding: '80px 0', fontSize: '18px' }}>
                Кейсов не найдено
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
                {filteredCases.map((c) => {
                  const color = getCaseColor(c)
                  return (
                    <div
                      key={c.id}
                      onClick={() => router.push('/case/' + c.id)}
                      style={{ cursor: 'pointer', textAlign: 'center', width: '220px', transition: 'transform 0.2s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          style={{
                            width: '200px', height: '200px', objectFit: 'contain',
                            marginBottom: '12px',
                            filter: `drop-shadow(0 8px 20px ${color}60)`,
                            borderRadius: '50px', transition: 'all 0.25s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.filter = `drop-shadow(0 0 25px ${color})`}
                          onMouseLeave={e => e.currentTarget.style.filter = `drop-shadow(0 8px 20px ${color}60)`}
                        />
                      ) : (
                        <div style={{
                          width: '200px', height: '200px', marginBottom: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '80px', borderRadius: '50px',
                          background: `radial-gradient(circle, ${color}22, transparent)`,
                          border: `1px solid ${color}40`,
                          transition: 'all 0.25s ease'
                        }}>📦</div>
                      )}
                      <div style={{
                        fontSize: '16px', fontWeight: 'bold',
                        background: `linear-gradient(135deg, #fff, ${color})`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '8px'
                      }}>
                        {c.name}
                      </div>
                      <div style={{
                        fontSize: '22px', fontWeight: 'bold',
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                      }}>
                        {c.price} ₽
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}