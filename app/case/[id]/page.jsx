'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '../../store'

const FALLBACK_IMAGE = 'https://community.cloudflare.steamstatic.com/public/images/skin_illustrations/econ/default_generated_item.png'

const RARITY_COLORS = {
  Common: '#b0b0b0',
  Uncommon: '#5e98d9',
  Rare: '#4b69ff',
  Epic: '#8847ff',
  Legendary: '#d32ce6',
  Ancient: '#eb4b4b',
  Contraband: '#e4ae39',
  'Ширпотреб': '#b0b0b0',
  'Промышленное': '#5e98d9',
  'Запрещённое': '#4b69ff',
  'Засекреченное': '#8847ff',
  'Тайное': '#d32ce6',
  'Контрабанда': '#eb4b4b',
}

function getColor(item) {
  return item.color || RARITY_COLORS[item.rarity] || '#888888'
}
function roundTo10(num) {
  return Math.round(num / 10) * 10
}

function playSound(type, muted, activeAudios) {
  if (typeof window === 'undefined' || muted) return
  const audio = new Audio('/sounds/go-new-gambling.mp3')
  audio.volume = 0.4
  activeAudios.push(audio)
  switch (type) {
    case 'spin':
      audio.play().catch(() => {})
      break
    case 'win':
      audio.volume = 0.5
      audio.play().catch(() => {})
      break
    case 'jackpot':
      audio.volume = 0.6
      audio.play().catch(() => {})
      setTimeout(() => {
        const audio2 = new Audio('/sounds/go-new-gambling.mp3')
        audio2.volume = 0.5
        activeAudios.push(audio2)
        audio2.play().catch(() => {})
      }, 200)
      break
  }
}

function getRandomItem(items) {
  const total = items.reduce((sum, i) => sum + (i.chance ?? 1), 0)
  const rand = Math.random() * total
  let cumulative = 0
  for (const item of items) {
    cumulative += (item.chance ?? 1)
    if (rand <= cumulative) return item
  }
  return items[0]
}

const ITEM_GAP = 8
const WINNER_POS = 35

function generateStrip(items, winner) {
  const strip = []
  for (let i = 0; i < 60; i++) {
    strip.push(items[Math.floor(Math.random() * items.length)])
  }
  strip[WINNER_POS] = winner
  return strip
}

function Roulette({ items, winner, spinning, fastMode, done, count, caseColor }) {
  const SPIN_DURATION = fastMode ? 1500 : 6000
  const height = count === 1 ? 180 : count <= 3 ? 130 : 90
  const itemW = count === 1 ? 160 : count <= 3 ? 120 : 85
  const fontSize = count === 1 ? 36 : count <= 3 ? 28 : 20
  const textSize = count === 1 ? 11 : count <= 3 ? 10 : 9
  const itemH = height - 30

  const [strip, setStrip] = useState([])
  const [translateX, setTranslateX] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef(null)

  function calcTarget() {
    const containerWidth = containerRef.current?.offsetWidth || 800
    const randomOffset = (Math.random() - 0.5) * (itemW * 0.7)
    return WINNER_POS * (itemW + ITEM_GAP) - containerWidth / 2 + itemW / 2 + randomOffset
  }

  useEffect(() => {
    setStrip(generateStrip(items, items[0]))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!spinning || !winner) return
    const newStrip = generateStrip(items, winner)
    setAnimate(false)
    setTranslateX(0)
    setTimeout(() => {
      setStrip(newStrip)
      setTimeout(() => {
        setAnimate(true)
        setTranslateX(calcTarget())
      }, 50)
    }, 50)
  }, [spinning, winner])

  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: '12px',
      height: `${height}px`,
      background: 'rgba(22, 33, 62, 0.8)',
      border: `1px solid ${caseColor}40`,
      marginBottom: '8px',
      boxShadow: `0 0 20px ${caseColor}20`
    }} suppressHydrationWarning ref={containerRef}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(26,26,46,0.95) 0%, transparent 15%, transparent 85%, rgba(26,26,46,0.95) 100%)',
        zIndex: 2, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '0px',
        transform: 'translateX(-50%)', zIndex: 10,
        width: 0, height: 0,
        borderLeft: '14px solid transparent',
        borderRight: '14px solid transparent',
        borderTop: `18px solid #e94560`,
        filter: 'drop-shadow(0 0 6px #e94560)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', bottom: '0px',
        transform: 'translateX(-50%)', zIndex: 10,
        width: 0, height: 0,
        borderLeft: '14px solid transparent',
        borderRight: '14px solid transparent',
        borderBottom: `18px solid #e94560`,
        filter: 'drop-shadow(0 0 6px #e94560)',
      }} />
      <div style={{
        display: 'flex', gap: `${ITEM_GAP}px`,
        transform: `translateX(-${translateX}px)`,
        transition: animate ? `transform ${SPIN_DURATION}ms cubic-bezier(0.05, 0.8, 0.2, 1)` : 'none',
        paddingLeft: '10px', alignItems: 'center', height: '100%',
        visibility: mounted ? 'visible' : 'hidden'
      }}>
        {strip.map((item, i) => {
          const color = getColor(item)
          return (
            <div key={i} style={{
              width: `${itemW}px`, minWidth: `${itemW}px`,
              flexShrink: 0, height: `${itemH}px`,
              background: i === WINNER_POS && done
                ? `linear-gradient(135deg, rgba(22,33,62,0.9), ${color}30)`
                : 'rgba(15,52,96,0.6)',
              borderRadius: '8px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              borderBottom: `3px solid ${color}`,
              border: i === WINNER_POS && done ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.05)',
              padding: '6px', transition: 'all 0.3s ease'
            }}>
              <img src={item.image || FALLBACK_IMAGE} alt={item.name}
                style={{ width: '80%', height: `${fontSize * 1.4}px`, objectFit: 'contain', marginBottom: '4px' }} />
              <p style={{ fontSize: `${textSize}px`, textAlign: 'center', color, fontWeight: 'bold', lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CasePage() {
  const activeAudiosRef = useRef([])

  // Останавливаем все звуки при уходе со страницы
  useEffect(() => {
    return () => {
      activeAudiosRef.current.forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
      activeAudiosRef.current = []
    }
  }, [])

  const params = useParams()
  const router = useRouter()

  const [caseData, setCaseData] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const { balance, addBalance, addDrop, addToInventory, sellItem } = useStore()
  const [spinning, setSpinning] = useState(false)
  const [fastMode, setFastMode] = useState(false)
  const [multiCount, setMultiCount] = useState(1)
  const [results, setResults] = useState([])
  const [winners, setWinners] = useState([])
  const [done, setDone] = useState(false)
  const [activeCount, setActiveCount] = useState(1)
  const [muted, setMuted] = useState(false)

  // Реф для доступа к актуальным значениям в cleanup
  const pendingRef = useRef({ results: [], caseData: null })
  const winnersRef = useRef([])
useEffect(() => {
  winnersRef.current = winners
}, [winners])

  useEffect(() => {
    pendingRef.current.results = results
  }, [results])

  useEffect(() => {
    pendingRef.current.caseData = caseData
  }, [caseData])

  // ✅ При уходе со страницы — все непринятые предметы идут в инвентарь
  useEffect(() => {
    return () => {
      const { results: pendingResults, caseData: pendingCase } = pendingRef.current
      if (pendingResults.length > 0 && pendingCase) {
        pendingResults.forEach(item => {
          useStore.getState().addToInventory(item, pendingCase.name)
        })
      }
    }
  }, [])

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(list => {
        const found = Array.isArray(list) ? list.find(c => c.id === params.id) : null
        if (!found) { setNotFound(true); return }
        setCaseData(found)
        const mapped = (found.items || []).map(ci => ({
          ...ci.item,
          chance: ci.dropRate,
        }))
        setItems(mapped)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.id])

  const [steamPrices, setSteamPrices] = useState({})
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current || items.length === 0) return
    fetchedRef.current = true
    const names = items.map(i => i.name)
    fetch('/api/steam-price/steam-prices-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names })
    })
      .then(r => r.json())
      .then(data => { if (data.prices) setSteamPrices(data.prices) })
      .catch(() => {})
  }, [items])

  const getPrice = (item) => steamPrices[item.name] ?? item.price

  const caseColor = '#e94560'

  function spin() {
    if (spinning || !caseData || items.length === 0) return
    const totalCost = caseData.price * multiCount
    if (balance < totalCost) {
      alert('Недостаточно средств!')
      return
    }
    const wonItems = Array.from({ length: multiCount }, () => getRandomItem(items))
    addBalance(-totalCost)
    setResults([])
    setDone(false)
    setActiveCount(multiCount)
    setWinners(wonItems)
    playSound('spin', muted, activeAudiosRef.current)
    setTimeout(() => setSpinning(true), 50)

    const spinDuration = (fastMode ? 1500 : 6000) + 500
    setTimeout(() => {
      setSpinning(false)
      setDone(true)
      setResults(wonItems)

      wonItems.forEach(item => {
        addDrop(item, caseData.name)
        fetch('/api/drops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            price: item.price,
            color: getColor(item),
            caseName: caseData.name,
            steamId: useStore.getState().steamUser?.steamId || null
          })
        }).catch(() => {})
      })

      const hasJackpot = wonItems.some(i => i.rarity === 'Контрабанда' || i.rarity === 'Ancient')
      const hasRare = wonItems.some(i => ['Тайное', 'Засекреченное', 'Legendary', 'Epic'].includes(i.rarity))
      if (hasJackpot) playSound('jackpot', muted, activeAudiosRef.current)
else if (hasRare) playSound('win', muted, activeAudiosRef.current)
    }, spinDuration)
  }

  const maxCount = caseData ? Math.min(10, Math.floor(balance / caseData.price)) : 0

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
        Загрузка...
      </main>
    )
  }

  if (notFound || !caseData) {
    return (
      <main style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', gap: '20px' }}>
        <p>Кейс не найден</p>
        <button onClick={() => router.push('/')} style={{
          background: 'linear-gradient(135deg, #e94560, #c73550)',
          color: 'white', border: 'none', padding: '10px 24px',
          borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold'
        }}>← На главную</button>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1a1a2e' }}>
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
        .spin-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(233,69,96,0.6) !important;
        }
        .item-card:hover { transform: translateY(-3px); }
      `}</style>

      {/* Навбар */}
      <nav style={{
        background: 'rgba(22, 33, 62, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(233,69,96,0.3)', padding: '0 30px',
        height: '80px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div onClick={() => router.push('/')} style={{ cursor: 'pointer', fontSize: '44px', fontWeight: '800', letterSpacing: '-1px', padding: '8px 0' }} className="logo-glow">
          OtakuCase
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          {[['/', 'Кейсы'], ['/upgrade', 'Апгрейд'], ['/roulette', 'Рулетка'], ['/contracts', 'Контракты']].map(([href, label]) => (
            <span key={href} onClick={() => router.push(href)} style={{ color: '#aaa', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e94560'}
              onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
            >{label}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(233,69,96,0.12)', padding: '10px 24px', borderRadius: '50px', border: '1px solid rgba(233,69,96,0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💰</span>
            <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '20px', fontFamily: 'monospace' }}>
              {balance.toLocaleString()} ₽
            </span>
          </div>
          <button onClick={() => setMuted(m => !m)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '10px 16px', borderRadius: '50px', cursor: 'pointer', fontSize: '18px' }}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={() => router.push('/profile')} style={{ background: 'linear-gradient(135deg, #e94560, #c73550)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            👤 Профиль
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 30px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '8px 20px', borderRadius: '30px', cursor: 'pointer', marginBottom: '30px', fontSize: '13px' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >← Назад</button>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={caseData.image || FALLBACK_IMAGE} alt={caseData.name} style={{ width: '120px', height: '120px', objectFit: 'contain', filter: `drop-shadow(0 0 30px ${caseColor})`, marginBottom: '15px' }} />
          <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', background: `linear-gradient(135deg, #fff, ${caseColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{caseData.name}</h1>
          <p style={{ color: '#888', fontSize: '15px' }}>Цена открытия: <span style={{ color: caseColor, fontWeight: 'bold' }}>{caseData.price} ₽</span></p>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#555', padding: '60px 0', fontSize: '16px' }}>
            В этом кейсе пока нет предметов.
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: activeCount <= 3 ? `repeat(${activeCount}, 1fr)` : activeCount <= 6 ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
              gap: '8px', marginBottom: '25px'
            }}>
              {Array.from({ length: activeCount }).map((_, i) => (
                <div key={i} style={{ minWidth: 0 }}>
                  <Roulette items={items} winner={winners[i] || null} spinning={spinning} fastMode={fastMode} done={done} count={activeCount <= 3 ? activeCount : activeCount <= 6 ? 3 : 5} caseColor={caseColor} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
              {[['Обычный', false], ['Быстрый', true]].map(([label, fast]) => (
                <button key={label} onClick={() => setFastMode(fast)} style={{
                  padding: '8px 28px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                  background: fastMode === fast ? 'linear-gradient(135deg, #e94560, #c73550)' : 'rgba(255,255,255,0.05)',
                  color: fastMode === fast ? 'white' : '#aaa',
                  border: fastMode === fast ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>{label}</button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '25px' }}>
              {[1, 2, 3, 5, 10].map(n => (
                <button key={n} onClick={() => setMultiCount(n)} disabled={n > maxCount} style={{
                  padding: '6px 18px', borderRadius: '30px', border: 'none',
                  cursor: n > maxCount ? 'not-allowed' : 'pointer', fontWeight: 'bold',
                  background: multiCount === n ? `linear-gradient(135deg, ${caseColor}, ${caseColor}aa)` : 'rgba(255,255,255,0.05)',
                  color: n > maxCount ? '#555' : multiCount === n ? 'white' : '#aaa',
                  border: multiCount === n ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>x{n}</button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <button className="spin-btn" onClick={spin} disabled={spinning} style={{
                background: spinning ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #e94560, #c73550)',
                color: spinning ? '#666' : 'white', border: 'none', padding: '16px 70px',
                fontSize: '18px', fontWeight: 'bold', borderRadius: '50px',
                cursor: spinning ? 'not-allowed' : 'pointer',
                boxShadow: spinning ? 'none' : '0 4px 20px rgba(233,69,96,0.4)'
              }}>
                {spinning ? '⏳ Крутится...' : `🎰 Открыть ${multiCount > 1 ? multiCount + 'x ' : ''}за ${caseData.price * multiCount} ₽`}
              </button>
            </div>

            {/* Результаты */}
            {results.length > 0 && (
              <div style={{ marginBottom: '50px' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#aaa', fontSize: '18px' }}>
                  {results.length > 1 ? '🎁 Ваши выигрыши:' : '🎉 Вы выиграли!'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', maxWidth: '900px', margin: '0 auto' }}>
                  {results.map((item, i) => {
                    const color = getColor(item)
                    return (
                      <div key={i} className="item-card" style={{
                        textAlign: 'center',
                        background: `linear-gradient(135deg, rgba(22,33,62,0.9), ${color}20)`,
                        border: `1px solid ${color}60`, borderRadius: '16px', padding: '20px',
                        boxShadow: `0 4px 20px ${color}30`
                      }}>
                        <img src={item.image || FALLBACK_IMAGE} alt={item.name} style={{ width: '100%', height: '60px', objectFit: 'contain', marginBottom: '8px' }} />
                        <h3 style={{ color, fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>{item.name}</h3>
                        <p style={{ color: '#e94560', fontSize: '18px', fontWeight: 'bold' }}>{getPrice(item)} ₽</p>
                        <p style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>{item.rarity}</p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                          <button onClick={() => {
                            // ✅ продаём по актуальной цене (steam или базовой)
                            const price = roundTo10(getPrice(item))
addBalance(price)
                            setResults(prev => prev.filter((_, idx) => idx !== i))
                          }} style={{
                            flex: 1, background: 'linear-gradient(135deg, #e94560, #c73550)',
                            color: 'white', border: 'none', padding: '8px',
                            borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                          }}>Продать</button>
                          <button onClick={() => {
                            addToInventory(item, caseData.name)
                            setResults(prev => prev.filter((_, idx) => idx !== i))
                          }} style={{
                            flex: 1, background: 'rgba(255,255,255,0.05)',
                            color: '#aaa', border: '1px solid rgba(255,255,255,0.1)',
                            padding: '8px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                          }}>Оставить</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {results.length > 1 && (
  <>
    <p style={{ textAlign: 'center', marginTop: '20px', color: '#e94560', fontSize: '20px', fontWeight: 'bold' }}>
      💰 Итого: {roundTo10(results.reduce((sum, i) => sum + (Number(getPrice(i)) || 0), 0))} ₽
    </p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
      <button onClick={() => {
        const total = roundTo10(results.reduce((sum, i) => sum + (Number(getPrice(i)) || 0), 0))
addBalance(total)
        addBalance(total)
        setResults([])
      }} style={{
        background: 'linear-gradient(135deg, #e94560, #c73550)',
        color: 'white', border: 'none', padding: '12px 32px',
        borderRadius: '30px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
      }}>Продать всё</button>
      <button onClick={() => {
        results.forEach(item => addToInventory(item, caseData.name))
        setResults([])
      }} style={{
        background: 'rgba(255,255,255,0.05)',
        color: '#aaa', border: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 32px', borderRadius: '30px',
        cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
      }}>Оставить всё</button>
    </div>
  </>
)}
              </div>
            )}

            <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '22px', color: '#aaa' }}>Содержимое кейса</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '60px' }}>
              {items.map(item => {
                const color = getColor(item)
                return (
                  <div key={item.id} className="item-card" style={{
                    background: `linear-gradient(135deg, rgba(22,33,62,0.8), ${color}15)`,
                    borderRadius: '12px', padding: '14px', textAlign: 'center',
                    border: `1px solid ${color}40`, transition: 'all 0.3s ease'
                  }}>
                    <img src={item.image || FALLBACK_IMAGE} alt={item.name} style={{ width: '100%', height: '50px', objectFit: 'contain', marginBottom: '6px' }} />
                    <p style={{ fontSize: '11px', color, fontWeight: 'bold', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ fontSize: '12px', color: '#e94560', fontWeight: 'bold' }}>{getPrice(item)} ₽</p>
                    <p style={{ fontSize: '10px', color: '#555', marginTop: '3px' }}>{item.chance}%</p>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}