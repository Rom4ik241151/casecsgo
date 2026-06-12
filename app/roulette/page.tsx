'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

const RARITY_COLORS: Record<string, string> = {
  Common:     '#888888',
  Uncommon:   '#5e98d9',
  Rare:       '#4b69ff',
  Epic:       '#8847ff',
  Legendary:  '#d32ce6',
  Ancient:    '#eb4b4b',
  Contraband: '#e4ae39',
  // русские названия (на случай если в БД так)
  'Ширпотреб':    '#888888',
  'Промышленное': '#5e98d9',
  'Запрещённое':  '#4b69ff',
  'Засекреченное':'#8847ff',
  'Тайное':       '#d32ce6',
  'Контрабанда':  '#eb4b4b',
}

function getRarityColor(item: any): string {
  return RARITY_COLORS[item.rarity ?? ''] ?? item.color ?? '#888888'
}

function getRarityBg(item: any): string {
  const c = getRarityColor(item)
  return `linear-gradient(135deg, rgba(22,33,62,0.95), ${c}30)`
}

// ---- Лента прокрутки ----
const ITEM_W = 140
const ITEM_GAP = 8
const WINNER_POS = 40

function generateStrip(items: any[], winner: any) {
  const strip: any[] = []
  for (let i = 0; i < 80; i++) {
    strip.push(items[Math.floor(Math.random() * items.length)])
  }
  strip[WINNER_POS] = winner
  return strip
}

function RouletteStrip({ items, winner, spinning, fastMode, done }: {
  items: any[], winner: any, spinning: boolean, fastMode: boolean, done: boolean
}) {
  const DURATION = fastMode ? 1500 : 5500
  const containerRef = useRef<HTMLDivElement>(null)
  const [strip, setStrip] = useState<any[]>([])
  const [translateX, setTranslateX] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setStrip(generateStrip(items, items[0] ?? {}))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!spinning || !winner || items.length === 0) return
    const newStrip = generateStrip(items, winner)
    setAnimate(false)
    setTranslateX(0)
    setTimeout(() => {
      setStrip(newStrip)
      setTimeout(() => {
        const containerW = containerRef.current?.offsetWidth ?? 900
        const randomOffset = (Math.random() - 0.5) * (ITEM_W * 0.6)
        const target = WINNER_POS * (ITEM_W + ITEM_GAP) - containerW / 2 + ITEM_W / 2 + randomOffset
        setAnimate(true)
        setTranslateX(target)
      }, 50)
    }, 50)
  }, [spinning, winner])

  return (
    <div ref={containerRef} style={{
      position: 'relative', overflow: 'hidden', borderRadius: '16px',
      height: '170px',
      background: 'rgba(15, 16, 33, 0.9)',
      border: '1px solid rgba(233,69,96,0.25)',
      boxShadow: '0 0 30px rgba(233,69,96,0.1)',
    }}>
      {/* Боковые градиенты */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to right, rgba(15,16,33,0.97) 0%, transparent 12%, transparent 88%, rgba(15,16,33,0.97) 100%)'
      }} />
      {/* Указатели */}
      {[{ top: 0, border: 'borderTop' }, { bottom: 0, border: 'borderBottom' }].map((s, idx) => (
        <div key={idx} style={{
          position: 'absolute', left: '50%', ...(idx === 0 ? { top: 0 } : { bottom: 0 }),
          transform: 'translateX(-50%)', zIndex: 10,
          width: 0, height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          ...(idx === 0
            ? { borderTop: '16px solid #e94560' }
            : { borderBottom: '16px solid #e94560' }),
          filter: 'drop-shadow(0 0 6px #e94560)',
        }} />
      ))}

      {/* Лента */}
      <div style={{
        display: 'flex', gap: `${ITEM_GAP}px`,
        transform: `translateX(-${translateX}px)`,
        transition: animate ? `transform ${DURATION}ms cubic-bezier(0.05, 0.8, 0.2, 1)` : 'none',
        paddingLeft: '10px', alignItems: 'center', height: '100%',
        visibility: mounted ? 'visible' : 'hidden',
        willChange: 'transform',
      }}>
        {strip.map((item, i) => {
          const color = getRarityColor(item)
          const isWinner = i === WINNER_POS && done
          return (
            <div key={i} style={{
              width: `${ITEM_W}px`, minWidth: `${ITEM_W}px`,
              height: '145px', flexShrink: 0,
              background: isWinner ? getRarityBg(item) : `linear-gradient(135deg, rgba(22,33,62,0.7), ${color}15)`,
              borderRadius: '10px',
              border: isWinner ? `1px solid ${color}` : `1px solid ${color}35`,
              borderBottom: `3px solid ${color}`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '8px',
              boxShadow: isWinner ? `0 0 20px ${color}60` : 'none',
              transition: 'all 0.3s ease',
            }}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '72px', height: '52px', objectFit: 'contain', marginBottom: '6px',
                    filter: `drop-shadow(0 2px 8px ${color}80)` }}
                />
              ) : (
                <div style={{ fontSize: '36px', marginBottom: '6px' }}>🔫</div>
              )}
              <p style={{
                fontSize: '10px', textAlign: 'center', color,
                fontWeight: 'bold', lineHeight: 1.2,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>{item.name}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Главный компонент ----
const TICKET_PRICES = [50, 100, 250, 500, 1000]

export default function RoulettePage() {
  const router = useRouter()
  const { balance, addBalance, addDrop, addToInventory, sellItem, steamUser } = useStore()

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [betAmount, setBetAmount] = useState(100)
  const [spinning, setSpinning] = useState(false)
  const [fastMode, setFastMode] = useState(false)
  const [winner, setWinner] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [done, setDone] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Загружаем все предметы из БД через /api/items
  useEffect(() => {
    fetch('/api/items')
      .then(r => r.json())
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : data.items ?? []
        setItems(arr)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function getRandomItem() {
    if (items.length === 0) return null
    // Взвешенный рандом по цене (дешевле — чаще)
    const weights = items.map(i => Math.max(1, 10000 / (Number(i.price) || 100)))
    const total = weights.reduce((s, w) => s + w, 0)
    let rand = Math.random() * total
    for (let i = 0; i < items.length; i++) {
      rand -= weights[i]
      if (rand <= 0) return items[i]
    }
    return items[0]
  }

  const DURATION = fastMode ? 1500 : 5500

  function spin() {
    if (spinning || balance < betAmount || items.length === 0) return
    const won = getRandomItem()
    if (!won) return

    addBalance(-betAmount)
    setDone(false)
    setResult(null)
    setWinner(won)
    setSpinning(true)

    setTimeout(() => {
      setSpinning(false)
      setDone(true)
      setResult(won)
      setHistory(prev => [won, ...prev].slice(0, 10))
      addDrop(won, 'Рулетка')
    }, DURATION + 500)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white', fontFamily: 'sans-serif' }}>
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
          font-weight: 800;
        }
        .nav-item { position: relative; transition: all 0.3s ease; }
        .nav-item::after {
          content: ''; position: absolute; bottom: -6px; left: 0;
          width: 0%; height: 2px;
          background: linear-gradient(90deg, #e94560, #ff6b6b);
          transition: width 0.3s ease; border-radius: 2px;
        }
        .nav-item:hover::after { width: 100%; }
        .skeleton {
          background: linear-gradient(90deg, #1e1e3a 25%, #252545 50%, #1e1e3a 75%);
          background-size: 200% 100%;
          animation: shimmerSkeleton 1.5s infinite;
          border-radius: 10px;
        }
        @keyframes shimmerSkeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Навбар */}
      <nav style={{
        background: 'rgba(8,8,20,0.98)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(233,69,96,0.3)',
        padding: '0 30px', height: '80px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div onClick={() => router.push('/')} style={{ cursor: 'pointer', fontSize: '44px', letterSpacing: '-1px', padding: '8px 0' }} className="logo-glow">
          OtakuCase
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          {([['/', 'Кейсы'], ['/upgrade', 'Апгрейд'], ['/roulette', 'Рулетка'], ['/contracts', 'Контракты']] as [string, string][]).map(([href, label]) => (
            <span key={href} onClick={() => router.push(href)} className="nav-item" style={{
              color: href === '/roulette' ? '#e94560' : '#aaa',
              cursor: 'pointer', fontSize: '15px', fontWeight: '500', padding: '6px 0',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#e94560'}
              onMouseLeave={e => e.currentTarget.style.color = href === '/roulette' ? '#e94560' : '#aaa'}
            >{label}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {mounted && (
            <div style={{
              background: 'rgba(233,69,96,0.12)', padding: '10px 24px',
              borderRadius: '50px', border: '1px solid rgba(233,69,96,0.4)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '20px', fontFamily: 'monospace' }}>
                {balance.toLocaleString()} ₽
              </span>
            </div>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '36px 24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '4px', background: 'linear-gradient(135deg,#fff,#e94560)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🎰 Рулетка предметов
        </h1>
        <p style={{ color: '#555', marginBottom: '28px', fontSize: '14px' }}>Поставь монеты — выиграй скин из базы</p>

        {/* История выпавших */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          {history.length === 0
            ? <span style={{ color: '#333', fontSize: '13px' }}>История появится после первого спина</span>
            : history.map((item, i) => {
              const color = getRarityColor(item)
              return (
                <div key={i} title={item.name} style={{
                  width: '42px', height: '42px', borderRadius: '8px',
                  background: getRarityBg(item),
                  border: `1px solid ${color}60`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: '36px', height: '26px', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '20px' }}>🔫</span>}
                </div>
              )
            })}
        </div>

        {/* Лента */}
        {loading ? (
          <div className="skeleton" style={{ height: '170px', marginBottom: '20px' }} />
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#555', padding: '60px 0', fontSize: '16px', marginBottom: '20px' }}>
            Нет предметов в базе. Добавь предметы в админ-панели.
          </div>
        ) : (
          <RouletteStrip
            items={items}
            winner={winner}
            spinning={spinning}
            fastMode={fastMode}
            done={done}
          />
        )}

        {/* Результат */}
        {result && done && (
          <div style={{
            margin: '20px 0',
            padding: '20px 24px',
            borderRadius: '16px',
            background: getRarityBg(result),
            border: `1px solid ${getRarityColor(result)}60`,
            display: 'flex', alignItems: 'center', gap: '20px',
            boxShadow: `0 0 30px ${getRarityColor(result)}30`,
          }}>
            {result.image
              ? <img src={result.image} alt={result.name} style={{ width: '80px', height: '58px', objectFit: 'contain', filter: `drop-shadow(0 0 12px ${getRarityColor(result)})` }} />
              : <div style={{ fontSize: '52px' }}>🔫</div>}
            <div style={{ flex: 1 }}>
              <p style={{ color: getRarityColor(result), fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '4px' }}>
                {result.rarity?.toUpperCase() ?? 'ПРЕДМЕТ'}
              </p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{result.name}</p>
              <p style={{ color: '#e94560', fontWeight: 'bold', fontSize: '18px' }}>
                {Number(result.price).toLocaleString()} ₽
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => {
                sellItem(result)
                setResult(null)
              }} style={{
                background: 'linear-gradient(135deg, #e94560, #c73550)',
                color: 'white', border: 'none', padding: '10px 24px',
                borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              }}>Продать</button>
              <button onClick={() => {
                addToInventory(result, 'Рулетка')
                setResult(null)
              }} style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#aaa', border: '1px solid rgba(255,255,255,0.15)',
                padding: '10px 24px', borderRadius: '30px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              }}>В инвентарь</button>
            </div>
          </div>
        )}

        {/* Панель ставки */}
        <div style={{
          background: 'rgba(22,33,62,0.7)', borderRadius: '20px',
          padding: '24px', border: '1px solid rgba(233,69,96,0.15)', marginTop: '16px',
        }}>
          {/* Обычный / Быстрый */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            {([['Обычный', false], ['Быстрый', true]] as [string, boolean][]).map(([label, fast]) => (
              <button key={label} onClick={() => setFastMode(fast)} style={{
                padding: '8px 28px', borderRadius: '30px', border: 'none',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                background: fastMode === fast ? 'linear-gradient(135deg, #e94560, #c73550)' : 'rgba(255,255,255,0.05)',
                color: fastMode === fast ? 'white' : '#aaa',
                transition: 'all 0.2s ease',
              }}>{label}</button>
            ))}
          </div>

          <p style={{ color: '#666', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>СУММА СТАВКИ</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {TICKET_PRICES.map(p => (
              <button key={p} onClick={() => setBetAmount(p)} style={{
                padding: '8px 20px', borderRadius: '30px',
                border: `1px solid ${betAmount === p ? '#e94560' : 'rgba(255,255,255,0.08)'}`,
                background: betAmount === p ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.03)',
                color: betAmount === p ? '#e94560' : '#666',
                fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
                transition: 'all 0.2s ease',
              }}>{p.toLocaleString()} ₽</button>
            ))}
            <input
              type="number" value={betAmount}
              onChange={e => setBetAmount(Math.max(1, Number(e.target.value)))}
              style={{
                width: '110px', padding: '8px 14px', borderRadius: '30px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px',
              }}
            />
          </div>

          <button
            onClick={spin}
            disabled={spinning || balance < betAmount || items.length === 0}
            style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              background: (spinning || balance < betAmount || items.length === 0)
                ? 'rgba(255,255,255,0.05)'
                : 'linear-gradient(135deg, #e94560, #c73550)',
              color: (spinning || balance < betAmount || items.length === 0) ? '#444' : 'white',
              fontWeight: 'bold', fontSize: '17px',
              cursor: (spinning || balance < betAmount || items.length === 0) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: spinning ? 'none' : '0 4px 20px rgba(233,69,96,0.35)',
            }}
          >
            {spinning ? '⏳ Крутится...' : `🎰 Крутить за ${betAmount.toLocaleString()} ₽`}
          </button>

          {balance < betAmount && (
            <p style={{ textAlign: 'center', color: '#e94560', fontSize: '13px', marginTop: '10px' }}>
              Недостаточно средств
            </p>
          )}
        </div>

        {/* Превью предметов */}
        {!loading && items.length > 0 && (
          <div style={{ marginTop: '36px' }}>
            <h2 style={{ color: '#aaa', fontSize: '18px', marginBottom: '16px', fontWeight: '700' }}>
              Все предметы в рулетке ({items.length})
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '10px',
            }}>
              {items.map((item: any) => {
                const color = getRarityColor(item)
                return (
                  <div key={item.id} style={{
                    background: `linear-gradient(135deg, rgba(22,33,62,0.8), ${color}15)`,
                    border: `1px solid ${color}40`,
                    borderBottom: `3px solid ${color}`,
                    borderRadius: '12px', padding: '12px', textAlign: 'center',
                    transition: 'all 0.25s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${color}30` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '64px', height: '46px', objectFit: 'contain', marginBottom: '6px', filter: `drop-shadow(0 2px 6px ${color}60)` }} />
                      : <div style={{ fontSize: '28px', marginBottom: '6px' }}>🔫</div>}
                    <p style={{ fontSize: '10px', color, fontWeight: 'bold', lineHeight: 1.3, marginBottom: '4px' }}>{item.name}</p>
                    <p style={{ fontSize: '12px', color: '#e94560', fontWeight: 'bold' }}>{Number(item.price).toLocaleString()} ₽</p>
                    <p style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>{item.rarity ?? 'Common'}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}