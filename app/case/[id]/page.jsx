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

function getRandomItem(items, luckMod = 1.0) {
  // Применяем модификатор: дорогие предметы (низкий chance) получают буст
  // Чем выше luckMod > 1, тем больше шанс выпадения редких предметов
  const avgChance = items.reduce((s, i) => s + (i.chance ?? 1), 0) / items.length
  const weighted = items.map(i => {
    const base = i.chance ?? 1
    // Редкие предметы (chance ниже среднего) усиливаются при luckMod > 1
    const isRare = base < avgChance
    const adjusted = isRare
      ? base * luckMod
      : base / Math.max(0.5, luckMod)
    return { ...i, _w: Math.max(0.01, adjusted) }
  })
  const total = weighted.reduce((sum, i) => sum + i._w, 0)
  const rand = Math.random() * total
  let cumulative = 0
  for (const item of weighted) {
    cumulative += item._w
    if (rand <= cumulative) return item
  }
  return weighted[0]
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
  const height = count === 1 ? 220 : count <= 3 ? 160 : 110
const itemW = count === 1 ? 200 : count <= 3 ? 150 : 100
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
  style={{ width: '90%', height: `${itemH * 0.65}px`, objectFit: 'contain', marginBottom: '4px' }} />
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

  const { balance, addBalance, addDrop, addToInventory, sellItem, steamUser } = useStore()
  const { setSteamUser } = useStore()

useEffect(() => {
  const cookies = document.cookie.split(';')
  const steamCookie = cookies.find(c => c.trim().startsWith('steam_user='))
  if (steamCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(steamCookie.split('=')[1]))
      setSteamUser(user)
    } catch {}
  }
}, [])
  const [spinning, setSpinning] = useState(false)
  const [fastMode, setFastMode] = useState(false)
  const [multiCount, setMultiCount] = useState(1)
  const [results, setResults] = useState([])
  const [winners, setWinners] = useState([])
  const [done, setDone] = useState(false)
  const [activeCount, setActiveCount] = useState(1)
  const [muted, setMuted] = useState(false)
  const [luckModifier, setLuckModifier] = useState(1.0)

  useEffect(() => {
    fetch('/api/user/luck').then(r => r.json()).then(d => {
      if (typeof d?.luckModifier === 'number') setLuckModifier(d.luckModifier)
    }).catch(() => {})
  }, [])

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
    const wonItems = Array.from({ length: multiCount }, () => getRandomItem(items, luckModifier))
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
            image: item.image || null,
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
    <main style={{ minHeight: '100vh', background: '#0a0a14' }}>
  {/* Фон */}
  <div style={{
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: 'url(/upgrade-bg.png)',
    backgroundSize: 'cover', backgroundPosition: 'center',
    opacity: 0.15,
  }} />
  <div style={{
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse at 20% 50%, rgba(232,75,106,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(136,71,255,0.1) 0%, transparent 50%)',
  }} />
      <div className="bg-orb" style={{ width: '600px', height: '600px', background: 'rgba(233,69,96,0.08)', top: '-200px', left: '-200px' }} />
      <div className="bg-orb" style={{ width: '500px', height: '500px', background: 'rgba(100,50,200,0.08)', bottom: '-100px', right: '-100px', animationDelay: '3s' }} />
      <style jsx global>{`
        @keyframes fastShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
          @keyframes mutePulse {
  0% { box-shadow: 0 0 0 0 rgba(233,69,96,0.4); }
  70% { box-shadow: 0 0 0 8px rgba(233,69,96,0); }
  100% { box-shadow: 0 0 0 0 rgba(233,69,96,0); }
  
}
  @keyframes caseFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
.case-float { animation: caseFloat 3s ease-in-out infinite; }
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
        @keyframes winAppear {
  0% { transform: scale(0.5) translateY(30px); opacity: 0; }
  70% { transform: scale(1.05) translateY(-5px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.win-card { animation: winAppear 0.5s ease forwards; }
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
.bg-orb {
  position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
  filter: blur(80px); animation: pulse 6s ease-in-out infinite;
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
      `}</style>

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
  <div onClick={() => router.push('/')} style={{ cursor: 'pointer', fontSize: '44px', fontWeight: '800', letterSpacing: '-1px', padding: '8px 0' }} className="logo-glow">
    OtakuCase
  </div>

  <div style={{ display: 'flex', gap: '40px' }}>
    {[['/', 'Кейсы'], ['/upgrade', 'Апгрейд'], ['/contracts', 'Контракты']].map(([href, label]) => (
      <span key={href} onClick={() => router.push(href)} className="nav-item"
        style={{ color: '#aaa', cursor: 'pointer', fontSize: '15px', fontWeight: '500', padding: '6px 0' }}
        onMouseEnter={e => e.currentTarget.style.color = '#e94560'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >{label}</span>
    ))}
  </div>

  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
    <div style={{
      background: 'rgba(233,69,96,0.12)', padding: '10px 24px',
      borderRadius: '50px', border: '1px solid rgba(233,69,96,0.4)',
      display: 'flex', alignItems: 'center', gap: '10px'
    }}>
      <span style={{ fontSize: '20px' }}>💰</span>
      <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '20px', fontFamily: 'monospace' }}>
        {balance.toFixed(2)} ₽
      </span>
    </div>
    <button
      onClick={() => setMuted(m => !m)}
      title={muted ? 'Включить звук' : 'Выключить звук'}
      style={{
        width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: muted ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.05)',
        border: muted ? '1px solid rgba(233,69,96,0.5)' : '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {muted ? (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#e94560"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke="#e94560" strokeWidth="2" strokeLinecap="round"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke="#e94560" strokeWidth="2" strokeLinecap="round"/>
          </>
        ) : (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#aaa"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          </>
        )}
      </svg>
    </button>
    {steamUser ? (
      <div onClick={() => router.push('/profile')} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(233,69,96,0.08)',
        border: '1px solid rgba(233,69,96,0.3)',
        padding: '6px 14px 6px 6px', borderRadius: '50px',
        cursor: 'pointer', transition: 'all 0.3s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,69,96,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(233,69,96,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <img src={steamUser.avatar} width={32} height={32} style={{ borderRadius: '50%', border: '2px solid #e94560' }} />
<span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{steamUser.name}</span>
      </div>
    ) : (
      <button onClick={() => router.push('/profile')} style={{
        background: 'linear-gradient(135deg, #e94560, #c73550)',
        color: 'white', border: 'none', padding: '10px 24px',
        borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
      }}>👤 Профиль</button>
    )}
  </div>
</nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 30px', position: 'relative', zIndex: 2 }}>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '8px 20px', borderRadius: '30px', cursor: 'pointer', marginBottom: '30px', fontSize: '13px' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >← Назад</button>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
  <img src={caseData.image || FALLBACK_IMAGE} alt={caseData.name} className="case-float" style={{ width: '220px', height: '220px', objectFit: 'contain', filter: `drop-shadow(0 0 60px ${caseColor}) drop-shadow(0 0 120px ${caseColor}60) drop-shadow(0 0 200px ${caseColor}30)`, marginBottom: '20px' }} />
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
              gap: '24px', marginBottom: '25px'
            }}>
              {Array.from({ length: activeCount }).map((_, i) => (
  <div key={i} style={{ minWidth: 0, position: 'relative' }}>
    <img src="/corner-pink.png" style={{ position: 'absolute', top: -20, left: -20, width: '60px', opacity: 0.7, pointerEvents: 'none', zIndex: 10 }} alt="" />
    <img src="/corner-pink.png" style={{ position: 'absolute', top: -20, right: -20, width: '60px', opacity: 0.7, pointerEvents: 'none', transform: 'scaleX(-1)', zIndex: 10 }} alt="" />
    <img src="/corner-pink.png" style={{ position: 'absolute', bottom: -8, left: -20, width: '60px', opacity: 0.7, pointerEvents: 'none', transform: 'scaleY(-1)', zIndex: 10 }} alt="" />
    <img src="/corner-pink.png" style={{ position: 'absolute', bottom: -8, right: -20, width: '60px', opacity: 0.7, pointerEvents: 'none', transform: 'scale(-1)', zIndex: 10 }} alt="" />
    <Roulette items={items} winner={winners[i] || null} spinning={spinning} fastMode={fastMode} done={done} count={activeCount <= 3 ? activeCount : activeCount <= 6 ? 3 : 5} caseColor={caseColor} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
  {[['Обычный', false], ['Быстрый', true]].map(([label, fast]) => (
    <button key={label} onClick={() => setFastMode(fast)} style={{
      padding: '10px 32px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
      background: fastMode === fast
        ? 'linear-gradient(135deg, #e94560, #c73550)'
        : 'linear-gradient(135deg, rgba(22,33,62,0.9), rgba(26,26,46,0.9))',
      color: fastMode === fast ? 'white' : '#666',
      border: fastMode === fast ? 'none' : '1px solid rgba(136,71,255,0.25)',
      boxShadow: fastMode === fast ? '0 4px 20px rgba(233,69,96,0.5)' : 'none',
      transition: 'all 0.2s'
    }}>{label}</button>
  ))}
</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '25px' }}>
  {[1, 2, 3, 5, 10].map(n => (
    <button key={n} onClick={() => setMultiCount(n)} disabled={n > maxCount} style={{
      padding: '10px 24px', borderRadius: '12px',
      cursor: n > maxCount ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px',
      background: multiCount === n
        ? `linear-gradient(135deg, ${caseColor}, #c73550)`
        : 'linear-gradient(135deg, rgba(22,33,62,0.9), rgba(26,26,46,0.9))',
      color: n > maxCount ? '#333' : multiCount === n ? 'white' : '#666',
      border: multiCount === n ? 'none' : '1px solid rgba(136,71,255,0.25)',
      boxShadow: multiCount === n ? `0 4px 20px ${caseColor}66` : 'none',
      transition: 'all 0.2s'
    }}>x{n}</button>
  ))}
</div>

            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
  {results.length > 0 ? (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
      <button onClick={() => {
        const total = roundTo10(results.reduce((sum, i) => sum + (Number(getPrice(i)) || 0), 0))
        addBalance(total)
        setResults([])
      }} style={{
        background: 'linear-gradient(135deg, #e94560, #c73550)',
        color: 'white', border: 'none', padding: '18px 48px',
        borderRadius: '16px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold',
        boxShadow: '0 6px 30px rgba(233,69,96,0.6)'
      }}>Продать{results.length > 1 ? ' всё' : ''} · {roundTo10(results.reduce((sum, i) => sum + (Number(getPrice(i)) || 0), 0))} ₽</button>
      <button onClick={() => {
        results.forEach(item => addToInventory(item, caseData.name))
        setResults([])
      }} style={{
        background: 'linear-gradient(135deg, rgba(22,33,62,0.9), rgba(26,26,46,0.9))',
        color: '#aaa', border: '1px solid rgba(136,71,255,0.25)',
        padding: '18px 48px', borderRadius: '16px',
        cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'
      }}>Оставить{results.length > 1 ? ' всё' : ''}</button>
    </div>
  ) : (
    <button className="spin-btn" onClick={spin} disabled={spinning} style={{
      background: spinning ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #e94560, #c73550, #e94560)',
      backgroundSize: '200% auto',
      animation: spinning ? 'none' : 'fastShimmer 3s ease infinite',
      color: spinning ? '#555' : 'white', border: 'none', padding: '18px 80px',
      fontSize: '20px', fontWeight: '800', borderRadius: '16px', letterSpacing: '1px',
      cursor: spinning ? 'not-allowed' : 'pointer',
      boxShadow: spinning ? 'none' : '0 6px 30px rgba(233,69,96,0.6)',
      transition: 'all 0.3s'
    }}>
      {spinning ? 'Открываем...' : `Открыть${multiCount > 1 ? ' ' + multiCount + 'x' : ''} · ${(caseData.price * multiCount).toLocaleString()} ₽`}
    </button>
  )}
</div>

            {/* Результаты */}
            {results.length > 0 && (
              <div style={{ marginBottom: '50px' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#aaa', fontSize: '18px' }}>
                  {results.length > 1 ? 'Ваши выигрыши:' : 'Вы выиграли!'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: results.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', maxWidth: results.length === 1 ? '480px' : '900px', margin: '0 auto' }}>
                  {results.map((item, i) => {
                    const color = getColor(item)
                    return (
                      <div key={i} className="item-card win-card" style={{
  textAlign: 'center',
  background: `linear-gradient(135deg, rgba(15,20,40,0.95), ${color}25)`,
  border: `2px solid ${color}80`, borderRadius: '20px', padding: '24px',
  boxShadow: `0 8px 40px ${color}40, 0 0 80px ${color}15`,
  position: 'relative', overflow: 'hidden'
}}>
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`
  }} />
  <div style={{
    background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
    borderRadius: '12px', padding: '16px', marginBottom: '12px'
  }}>
    <img src={item.image || FALLBACK_IMAGE} alt={item.name} style={{ width: '100%', height: '130px', objectFit: 'contain' }} />
  </div>
  <div style={{ background: `${color}20`, borderRadius: '6px', padding: '3px 10px', display: 'inline-block', marginBottom: '8px' }}>
    <span style={{ color, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.rarity}</span>
  </div>
  <h3 style={{ color: '#fff', fontSize: '13px', marginBottom: '8px', fontWeight: 'bold', lineHeight: 1.3 }}>{item.name}</h3>
  <p style={{ color, fontSize: '22px', fontWeight: '800', marginBottom: '4px', fontFamily: 'monospace' }}>{getPrice(item)} ₽</p>
                        
                        {results.length > 1 && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                            <button onClick={() => {
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
                        )}
                      </div>
                    )
                  })}
                </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '3px', textTransform: 'uppercase', display: 'inline-block', position: 'relative' }}>
    <span style={{ background: 'linear-gradient(135deg, #fff, #e94560)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Содержимое кейса</span>
  </h2>
  <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #e94560, transparent)', marginTop: '10px' }} />
</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '60px' }}>
              {[...items].sort((a, b) => getPrice(b) - getPrice(a)).map(item => {
                const color = getColor(item)
                return (
                  <div key={item.id} className="item-card" style={{
  background: `linear-gradient(145deg, rgba(8,10,24,0.98), rgba(18,22,45,0.95))`,
  borderRadius: '16px', padding: '0', textAlign: 'center',
  border: `1px solid ${color}50`, borderBottom: `3px solid ${color}`,
  transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
  boxShadow: `0 4px 20px ${color}10`
}}
onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${color}35` }}
onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${color}10` }}
>
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
  <div style={{ background: `linear-gradient(180deg, ${color}18 0%, transparent 100%)`, padding: '20px 16px 12px' }}>
    <img src={item.image || FALLBACK_IMAGE} alt={item.name} style={{ width: '100%', height: '70px', objectFit: 'contain', filter: `drop-shadow(0 4px 16px ${color}90)` }} />
  </div>
  <div style={{ padding: '0 12px 14px' }}>
    <div style={{ display: 'inline-block', background: `${color}20`, border: `1px solid ${color}40`, borderRadius: '20px', padding: '2px 10px', marginBottom: '8px' }}>
      <span style={{ color, fontSize: '9px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{item.rarity}</span>
    </div>
    <p style={{ fontSize: '11px', color: '#d0d0d0', fontWeight: '600', marginBottom: '6px', lineHeight: 1.3 }}>{item.name}</p>
    <p style={{ fontSize: '14px', color, fontWeight: '800', marginBottom: '6px', fontFamily: 'monospace' }}>{getPrice(item)} ₽</p>
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '3px 8px', display: 'inline-block' }}>
      
    </div>
  </div>
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