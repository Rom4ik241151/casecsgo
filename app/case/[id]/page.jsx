'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '../../store'

function playSound(type) {
  if (typeof window === 'undefined') return
  const audio = new Audio('/sounds/go-new-gambling.mp3')
  audio.volume = 0.4
  switch(type) {
    case 'spin':
      audio.play().catch(e => console.log('Sound error:', e))
      break
    case 'win':
      audio.volume = 0.5
      audio.play().catch(e => console.log('Sound error:', e))
      break
    case 'jackpot':
      audio.volume = 0.6
      audio.play().catch(e => console.log('Sound error:', e))
      setTimeout(() => {
        const audio2 = new Audio('/sounds/go-new-gambling.mp3')
        audio2.volume = 0.5
        audio2.play().catch(e => console.log('Sound error:', e))
      }, 200)
      break
  }
}

const allCases = [
  {
    id: 1, name: 'Древний Свиток', price: 39, color: '#cd853f', image: '/cases/Ancient-Scroll-Case.png',
    items: [
      { id: 1, name: 'Glock-18 | Steel Disruption', rarity: 'Ширпотреб', price: 12, chance: 10, color: '#b0b0b0' },
      { id: 2, name: 'P250 | Sand Dune', rarity: 'Ширпотреб', price: 10, chance: 10, color: '#b0b0b0' },
      { id: 3, name: 'Tec-9 | Tornado', rarity: 'Ширпотреб', price: 15, chance: 9, color: '#b0b0b0' },
      { id: 4, name: 'Five-SeveN | Forest Night', rarity: 'Ширпотреб', price: 11, chance: 9, color: '#b0b0b0' },
      { id: 5, name: 'CZ75-Auto | Army Mesh', rarity: 'Ширпотреб', price: 13, chance: 8, color: '#b0b0b0' },
      { id: 6, name: 'Dual Berettas | Contractor', rarity: 'Промышленное', price: 30, chance: 7, color: '#5e98d9' },
      { id: 7, name: 'P2000 | Oceanic', rarity: 'Промышленное', price: 35, chance: 7, color: '#5e98d9' },
      { id: 8, name: 'Tec-9 | Isaac', rarity: 'Промышленное', price: 40, chance: 6, color: '#5e98d9' },
      { id: 9, name: 'USP-S | Pathfinder', rarity: 'Промышленное', price: 45, chance: 6, color: '#5e98d9' },
      { id: 10, name: 'P250 | Asiimov', rarity: 'Запрещённое', price: 80, chance: 5, color: '#4b69ff' },
      { id: 11, name: 'Glock-18 | Fade', rarity: 'Запрещённое', price: 150, chance: 5, color: '#4b69ff' },
      { id: 12, name: 'Five-SeveN | Flame Test', rarity: 'Запрещённое', price: 120, chance: 4, color: '#4b69ff' },
      { id: 13, name: 'CZ75-Auto | Victoria', rarity: 'Запрещённое', price: 100, chance: 4, color: '#4b69ff' },
      { id: 14, name: 'Tec-9 | Avalanche', rarity: 'Запрещённое', price: 90, chance: 3, color: '#4b69ff' },
      { id: 15, name: 'Desert Eagle | Blaze', rarity: 'Засекреченное', price: 500, chance: 2.5, color: '#8847ff' },
      { id: 16, name: 'USP-S | Orion', rarity: 'Засекреченное', price: 300, chance: 2, color: '#8847ff' },
      { id: 17, name: 'Glock-18 | Dragon Tattoo', rarity: 'Засекреченное', price: 400, chance: 1.5, color: '#8847ff' },
      { id: 18, name: 'P250 | Gunsmoke', rarity: 'Засекреченное', price: 350, chance: 1.5, color: '#8847ff' },
      { id: 19, name: 'Desert Eagle | Golden Koi', rarity: 'Тайное', price: 1200, chance: 0.8, color: '#d32ce6' },
      { id: 20, name: 'USP-S | Neo-Noir', rarity: 'Тайное', price: 900, chance: 0.5, color: '#d32ce6' },
      { id: 21, name: 'Glock-18 | Twilight Galaxy', rarity: 'Контрабанда', price: 4000, chance: 0.15, color: '#eb4b4b' },
      { id: 22, name: 'Desert Eagle | Emerald Jörmungandr', rarity: 'Контрабанда', price: 6000, chance: 0.05, color: '#eb4b4b' },
    ]
  },
  {
    id: 2, name: 'Замерзший Реликт', price: 79, color: '#00ced1', image: '/cases/Frozen-Relic-Case.png',
    items: [
      { id: 1, name: 'MAC-10 | Indigo', rarity: 'Ширпотреб', price: 20, chance: 9, color: '#b0b0b0' },
      { id: 2, name: 'MP9 | Sand Scale', rarity: 'Ширпотреб', price: 18, chance: 9, color: '#b0b0b0' },
      { id: 3, name: 'UMP-45 | Bone Pile', rarity: 'Ширпотреб', price: 22, chance: 8, color: '#b0b0b0' },
      { id: 4, name: 'P90 | Scorched', rarity: 'Ширпотреб', price: 15, chance: 8, color: '#b0b0b0' },
      { id: 5, name: 'MP7 | Olive Plaid', rarity: 'Ширпотреб', price: 17, chance: 7, color: '#b0b0b0' },
      { id: 6, name: 'AUG | Chameleon', rarity: 'Промышленное', price: 120, chance: 7, color: '#5e98d9' },
      { id: 7, name: 'SG 553 | Cyrex', rarity: 'Промышленное', price: 90, chance: 6, color: '#5e98d9' },
      { id: 8, name: 'FAMAS | Meltdown', rarity: 'Промышленное', price: 80, chance: 6, color: '#5e98d9' },
      { id: 9, name: 'Galil AR | Eco', rarity: 'Промышленное', price: 60, chance: 5, color: '#5e98d9' },
      { id: 10, name: 'MP5-SD | Phosphor', rarity: 'Промышленное', price: 70, chance: 5, color: '#5e98d9' },
      { id: 11, name: 'AK-47 | Redline', rarity: 'Запрещённое', price: 500, chance: 4, color: '#4b69ff' },
      { id: 12, name: 'M4A1-S | Hyper Beast', rarity: 'Запрещённое', price: 400, chance: 4, color: '#4b69ff' },
      { id: 13, name: 'M4A4 | Dragon King', rarity: 'Запрещённое', price: 350, chance: 3.5, color: '#4b69ff' },
      { id: 14, name: 'AUG | Aristocrat', rarity: 'Запрещённое', price: 300, chance: 3, color: '#4b69ff' },
      { id: 15, name: 'SG 553 | Aerial', rarity: 'Запрещённое', price: 280, chance: 3, color: '#4b69ff' },
      { id: 16, name: 'AWP | Asiimov', rarity: 'Засекреченное', price: 1500, chance: 2, color: '#8847ff' },
      { id: 17, name: 'AK-47 | Neon Rider', rarity: 'Засекреченное', price: 800, chance: 2, color: '#8847ff' },
      { id: 18, name: 'M4A1-S | Decimator', rarity: 'Засекреченное', price: 700, chance: 1.5, color: '#8847ff' },
      { id: 19, name: 'AWP | Neo-Noir', rarity: 'Засекреченное', price: 900, chance: 1.5, color: '#8847ff' },
      { id: 20, name: 'AK-47 | Vulcan', rarity: 'Тайное', price: 3000, chance: 0.8, color: '#d32ce6' },
      { id: 21, name: 'AWP | Medusa', rarity: 'Тайное', price: 4000, chance: 0.5, color: '#d32ce6' },
      { id: 22, name: 'AK-47 | Wild Lotus', rarity: 'Контрабанда', price: 6000, chance: 0.15, color: '#eb4b4b' },
      { id: 23, name: 'M4A4 | Howl', rarity: 'Контрабанда', price: 25000, chance: 0.05, color: '#eb4b4b' },
    ]
  },
  {
    id: 3, name: 'Лунная Сакура', price: 129, color: '#da70d6', image: '/cases/Moon-Sakura-Case.png',
    items: [
      { id: 1, name: 'Gut Knife | Forest DDPAT', rarity: 'Тайное', price: 1500, chance: 10, color: '#d32ce6' },
      { id: 2, name: 'Gut Knife | Safari Mesh', rarity: 'Тайное', price: 1400, chance: 9, color: '#d32ce6' },
      { id: 3, name: 'Gut Knife | Fade', rarity: 'Тайное', price: 2000, chance: 8, color: '#d32ce6' },
      { id: 4, name: 'Gut Knife | Tiger Tooth', rarity: 'Тайное', price: 1800, chance: 8, color: '#d32ce6' },
      { id: 5, name: 'Flip Knife | Forest DDPAT', rarity: 'Тайное', price: 2000, chance: 7, color: '#d32ce6' },
      { id: 6, name: 'Flip Knife | Marble Fade', rarity: 'Тайное', price: 3000, chance: 7, color: '#d32ce6' },
      { id: 7, name: 'Flip Knife | Tiger Tooth', rarity: 'Тайное', price: 2500, chance: 6, color: '#d32ce6' },
      { id: 8, name: 'Flip Knife | Doppler', rarity: 'Тайное', price: 3500, chance: 6, color: '#d32ce6' },
      { id: 9, name: 'Bayonet | Forest DDPAT', rarity: 'Тайное', price: 2200, chance: 5, color: '#d32ce6' },
      { id: 10, name: 'Bayonet | Tiger Tooth', rarity: 'Тайное', price: 4000, chance: 5, color: '#d32ce6' },
      { id: 11, name: 'Bayonet | Marble Fade', rarity: 'Тайное', price: 5000, chance: 4, color: '#d32ce6' },
      { id: 12, name: 'Bayonet | Doppler', rarity: 'Тайное', price: 4500, chance: 4, color: '#d32ce6' },
      { id: 13, name: 'Karambit | Forest DDPAT', rarity: 'Контрабанда', price: 5000, chance: 4, color: '#eb4b4b' },
      { id: 14, name: 'Karambit | Slaughter', rarity: 'Контрабанда', price: 8000, chance: 3.5, color: '#eb4b4b' },
      { id: 15, name: 'Karambit | Tiger Tooth', rarity: 'Контрабанда', price: 9000, chance: 3, color: '#eb4b4b' },
      { id: 16, name: 'Karambit | Marble Fade', rarity: 'Контрабанда', price: 11000, chance: 2.5, color: '#eb4b4b' },
      { id: 17, name: 'M9 Bayonet | Slaughter', rarity: 'Контрабанда', price: 7000, chance: 3, color: '#eb4b4b' },
      { id: 18, name: 'M9 Bayonet | Tiger Tooth', rarity: 'Контрабанда', price: 8000, chance: 2.5, color: '#eb4b4b' },
      { id: 19, name: 'M9 Bayonet | Doppler', rarity: 'Контрабанда', price: 10000, chance: 2, color: '#eb4b4b' },
      { id: 20, name: 'Karambit | Doppler', rarity: 'Контрабанда', price: 13000, chance: 1.5, color: '#eb4b4b' },
      { id: 21, name: 'Karambit | Fade', rarity: 'Контрабанда', price: 15000, chance: 1, color: '#eb4b4b' },
      { id: 22, name: 'Karambit | Case Hardened', rarity: 'Контрабанда', price: 20000, chance: 0.5, color: '#eb4b4b' },
    ]
  },
  {
    id: 4, name: 'Неоновое Ядро', price: 199, color: '#00ff7f', image: '/cases/Neon-Core-Case.png',
    items: [
      { id: 1, name: 'AK-47 | Safari Mesh', rarity: 'Ширпотреб', price: 30, chance: 8, color: '#b0b0b0' },
      { id: 2, name: 'M4A4 | Desert Storm', rarity: 'Ширпотреб', price: 25, chance: 8, color: '#b0b0b0' },
      { id: 3, name: 'AWP | Safari Mesh', rarity: 'Ширпотреб', price: 35, chance: 7, color: '#b0b0b0' },
      { id: 4, name: 'AK-47 | Slate', rarity: 'Промышленное', price: 80, chance: 7, color: '#5e98d9' },
      { id: 5, name: 'M4A1-S | Bright Water', rarity: 'Промышленное', price: 100, chance: 6, color: '#5e98d9' },
      { id: 6, name: 'AWP | Worm God', rarity: 'Промышленное', price: 90, chance: 6, color: '#5e98d9' },
      { id: 7, name: 'Glock-18 | Fade', rarity: 'Запрещённое', price: 150, chance: 5, color: '#4b69ff' },
      { id: 8, name: 'AWP | Containment Breach', rarity: 'Запрещённое', price: 300, chance: 5, color: '#4b69ff' },
      { id: 9, name: 'AK-47 | The Empress', rarity: 'Запрещённое', price: 400, chance: 4, color: '#4b69ff' },
      { id: 10, name: 'M4A4 | Neo-Noir', rarity: 'Запрещённое', price: 350, chance: 4, color: '#4b69ff' },
      { id: 11, name: 'USP-S | Kill Confirmed', rarity: 'Засекреченное', price: 1500, chance: 3, color: '#8847ff' },
      { id: 12, name: 'AWP | Lightning Strike', rarity: 'Засекреченное', price: 2000, chance: 3, color: '#8847ff' },
      { id: 13, name: 'AK-47 | Neon Revolution', rarity: 'Засекреченное', price: 1200, chance: 2.5, color: '#8847ff' },
      { id: 14, name: 'M4A1-S | Master Piece', rarity: 'Засекреченное', price: 1800, chance: 2, color: '#8847ff' },
      { id: 15, name: 'AWP | Fade', rarity: 'Засекреченное', price: 2500, chance: 1.5, color: '#8847ff' },
      { id: 16, name: 'Glock-18 | Fade', rarity: 'Тайное', price: 1000, chance: 1.5, color: '#d32ce6' },
      { id: 17, name: 'AWP | Medusa', rarity: 'Тайное', price: 4000, chance: 1, color: '#d32ce6' },
      { id: 18, name: 'USP-S | Kill Confirmed Blue', rarity: 'Тайное', price: 3000, chance: 0.8, color: '#d32ce6' },
      { id: 19, name: 'AK-47 | Fire Serpent', rarity: 'Контрабанда', price: 8000, chance: 0.5, color: '#eb4b4b' },
      { id: 20, name: 'M4A4 | Howl', rarity: 'Контрабанда', price: 25000, chance: 0.3, color: '#eb4b4b' },
      { id: 21, name: 'AWP | Dragon Lore', rarity: 'Контрабанда', price: 50000, chance: 0.15, color: '#eb4b4b' },
      { id: 22, name: 'AK-47 | Gold Arabesque', rarity: 'Контрабанда', price: 35000, chance: 0.05, color: '#eb4b4b' },
    ]
  },
]

function getRandomItem(items) {
  const total = items.reduce((sum, i) => sum + i.chance, 0)
  const rand = Math.random() * total
  let cumulative = 0
  for (const item of items) {
    cumulative += item.chance
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
  const spinRef = useRef(SPIN_DURATION)
  useEffect(() => { spinRef.current = SPIN_DURATION }, [fastMode])
  const height = count === 1 ? 180 : count <= 3 ? 130 : 90
  const itemW = count === 1 ? 160 : count <= 3 ? 120 : 85
  const fontSize = count === 1 ? 36 : count <= 3 ? 28 : 20
  const textSize = count === 1 ? 11 : count <= 3 ? 10 : 9
  const itemH = height - 30

  function calcTarget() {
  const containerWidth = containerRef.current?.offsetWidth || 800
  const randomOffset = (Math.random() - 0.5) * (itemW * 0.7)
  return WINNER_POS * (itemW + ITEM_GAP) - containerWidth / 2 + itemW / 2 + randomOffset
}
  const [strip, setStrip] = useState([])
  const [translateX, setTranslateX] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [mounted, setMounted] = useState(false)
    const containerRef = useRef(null)

  useEffect(() => {
    setStrip(generateStrip(items, items[0]))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!spinning || !winner) return
    const currentWinner = winner
    const newStrip = generateStrip(items, currentWinner)
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
        transform: 'translateX(-50%)',
        zIndex: 10,
        width: 0, height: 0,
        borderLeft: '14px solid transparent',
        borderRight: '14px solid transparent',
        borderTop: `18px solid #e94560`,
        filter: 'drop-shadow(0 0 6px #e94560)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', bottom: '0px',
        transform: 'translateX(-50%)',
        zIndex: 10,
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
        {strip.map((item, i) => (
          <div key={i} style={{
            width: `${itemW}px`,
minWidth: `${itemW}px`,
flexShrink: 0, height: `${itemH}px`,
            background: i === WINNER_POS && done
              ? `linear-gradient(135deg, rgba(22,33,62,0.9), ${item.color}30)`
              : 'rgba(15,52,96,0.6)',
            borderRadius: '8px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            borderBottom: `3px solid ${item.color}`,
            border: i === WINNER_POS && done ? `1px solid ${item.color}` : '1px solid rgba(255,255,255,0.05)',
            padding: '6px', flexShrink: 0,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: `${fontSize}px`, marginBottom: '4px' }}>🔫</div>
            <p style={{ fontSize: `${textSize}px`, textAlign: 'center', color: item.color, fontWeight: 'bold', lineHeight: 1.2 }}>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CasePage() {
  const params = useParams()
  const router = useRouter()
  const caseData = allCases.find(c => c.id === Number(params.id)) || allCases[0]
  const items = caseData.items
  const [steamPrices, setSteamPrices] = useState({})
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
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
  }, [])

  const getPrice = (item) => steamPrices[item.name] ?? item.price

  const { balance, addBalance, addDrop, sellItem, addToInventory, steamUser, setSteamUser } = useStore()
  const [spinning, setSpinning] = useState(false)
  const [fastMode, setFastMode] = useState(false)
  const [multiCount, setMultiCount] = useState(1)
  const [results, setResults] = useState([])
  const [winners, setWinners] = useState([])
  const [done, setDone] = useState(false)
  const [activeCount, setActiveCount] = useState(1)

  const SPIN_DURATION = fastMode ? 1500 : 6000

  function spin() {
    if (spinning) return
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
    playSound('spin')
    setTimeout(() => setSpinning(true), 50)
    setTimeout(() => {
      setSpinning(false)
      setDone(true)
      setResults(wonItems)
      wonItems.forEach(item => addDrop(item, caseData.name))

// Записываем открытия в БД
wonItems.forEach(item => {
  fetch('/api/drops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: item.name,
      price: item.price,
      color: item.color,
      caseName: caseData.name,
      steamId: useStore.getState().steamUser?.steamId || null
    })
  }).catch(() => {})
})
      const hasJackpot = wonItems.some(i => i.rarity === 'Контрабанда')
      const hasRare = wonItems.some(i => i.rarity === 'Тайное' || i.rarity === 'Засекреченное')
      if (hasJackpot) playSound('jackpot')
      else if (hasRare) playSound('win')
    }, (fastMode ? 1500 : 6000) + 500)
  }

  const maxCount = Math.min(10, Math.floor(balance / caseData.price))

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
        .item-card:hover {
          transform: translateY(-3px);
        }
      `}</style>

      {/* Навбар */}
      <nav style={{
        background: 'rgba(22, 33, 62, 0.95)',
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
          onClick={() => router.push(`/case/${drop.caseName}`)}
          style={{ cursor: 'pointer', fontSize: '44px', fontWeight: '800', letterSpacing: '-1px', padding: '8px 0' }}
          className="logo-glow"
        >
          OtakuCase
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          {['Кейсы', 'Апгрейд', 'Рулетка', 'Контракты'].map(item => (
            <span key={item} style={{ color: '#aaa', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e94560'}
              onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
            >{item}</span>
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
              {balance.toLocaleString()} ₽
            </span>
          </div>
          <button onClick={() => router.push('/profile')} style={{
            background: 'linear-gradient(135deg, #e94560, #c73550)',
            color: 'white', border: 'none', padding: '10px 24px',
            borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
          }}>👤 Профиль</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 30px' }}>

        {/* Назад */}
        <button onClick={() => router.push('/')} style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#aaa', padding: '8px 20px', borderRadius: '30px',
          cursor: 'pointer', marginBottom: '30px', fontSize: '13px',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >← Назад</button>

        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={caseData.image} alt={caseData.name} style={{
            width: '120px', height: '120px', objectFit: 'contain',
            filter: `drop-shadow(0 0 30px ${caseData.color})`,
            marginBottom: '15px'
          }} />
          <h1 style={{
            fontSize: '36px', fontWeight: '800', marginBottom: '8px',
            background: `linear-gradient(135deg, #fff, ${caseData.color})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>{caseData.name}</h1>
          <p style={{ color: '#888', fontSize: '15px' }}>Цена открытия: <span style={{ color: caseData.color, fontWeight: 'bold' }}>{caseData.price} ₽</span></p>
        </div>

        

        {/* Рулетки */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: activeCount <= 3 ? `repeat(${activeCount}, 1fr)` : activeCount <= 6 ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
          gap: '8px', marginBottom: '25px' 
        }}>
          {Array.from({ length: activeCount }).map((_, i) => (
            <div key={i} style={{ minWidth: 0 }}>
              <Roulette 
                items={items}
                winner={winners[i] || null}
                spinning={spinning}
                fastMode={fastMode}
                done={done}
                count={activeCount <= 3 ? activeCount : activeCount <= 6 ? 3 : 5}
                caseColor={caseData.color}
              />
            </div>
          ))}
        </div>
      {/* Обычный / Быстрый */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          {[['Обычный', false], ['Быстрый', true]].map(([label, fast]) => (
            <button key={label} onClick={() => setFastMode(fast)} style={{
              padding: '8px 28px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
              background: fastMode === fast ? `linear-gradient(135deg, #e94560, #c73550)` : 'rgba(255,255,255,0.05)',
              color: fastMode === fast ? 'white' : '#aaa',
              border: fastMode === fast ? 'none' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease'
            }}>{label}</button>
          ))}
        </div>

        {/* x1 x2 x3 x5 x10 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '25px' }}>
          {[1, 2, 3, 5, 10].map(n => (
            <button key={n} onClick={() => setMultiCount(n)} disabled={n > maxCount} style={{
              padding: '6px 18px', borderRadius: '30px', border: 'none',
              cursor: n > maxCount ? 'not-allowed' : 'pointer', fontWeight: 'bold',
              background: multiCount === n ? `linear-gradient(135deg, ${caseData.color}, ${caseData.color}aa)` : 'rgba(255,255,255,0.05)',
              color: n > maxCount ? '#555' : multiCount === n ? 'white' : '#aaa',
              border: multiCount === n ? 'none' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease'
            }}>x{n}</button>
          ))}
        </div>

        {/* Кнопка открыть */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <button
            className="spin-btn"
            onClick={spin}
            disabled={spinning}
            style={{
              background: spinning ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #e94560, #c73550)',
              color: spinning ? '#666' : 'white',
              border: 'none', padding: '16px 70px',
              fontSize: '18px', fontWeight: 'bold', borderRadius: '50px',
              cursor: spinning ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: spinning ? 'none' : '0 4px 20px rgba(233,69,96,0.4)'
            }}
          >
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
              {results.map((item, i) => (
                <div key={i} className="item-card" style={{
                  textAlign: 'center',
                  background: `linear-gradient(135deg, rgba(22,33,62,0.9), ${item.color}20)`,
                  border: `1px solid ${item.color}60`,
                  borderRadius: '16px', padding: '20px',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 20px ${item.color}30`
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔫</div>
                  <h3 style={{ color: item.color, fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>{item.name}</h3>
                  <p style={{ color: '#e94560', fontSize: '18px', fontWeight: 'bold' }}>{getPrice(item)} ₽</p>
                  <p style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>{item.rarity}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button onClick={() => {
                      sellItem(item)
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
              ))}
            </div>
            {results.length > 1 && (
              <p style={{ textAlign: 'center', marginTop: '20px', color: '#e94560', fontSize: '20px', fontWeight: 'bold' }}>
                💰 Итого: {results.reduce((sum, i) => sum + i.price, 0)} ₽
              </p>
            )}
          </div>
        )}

        {/* Содержимое кейса */}
        <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '22px', color: '#aaa' }}>Содержимое кейса</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '60px' }}>
          {items.map(item => (
            <div key={item.id} className="item-card" style={{
              background: `linear-gradient(135deg, rgba(22,33,62,0.8), ${item.color}15)`,
              borderRadius: '12px', padding: '14px', textAlign: 'center',
              border: `1px solid ${item.color}40`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '30px', marginBottom: '6px' }}>🔫</div>
              <p style={{ fontSize: '11px', color: item.color, fontWeight: 'bold', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</p>
              <p style={{ fontSize: '12px', color: '#e94560', fontWeight: 'bold' }}>{getPrice(item)} ₽</p>
              <p style={{ fontSize: '10px', color: '#555', marginTop: '3px' }}>{item.chance}%</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}