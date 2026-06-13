'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'
import DropsPanel from '../components/DropsPanel'

const proxyImage = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`

const CHANCE_PRESETS = [
  { label: 'x2', mult: 2, color: '#8847ff' },
  { label: 'x3', mult: 3, color: '#8847ff' },
  { label: 'x5', mult: 5, color: '#8847ff' },
  { label: 'x10', mult: 10, color: '#8847ff' },
]

export default function UpgradePage() {
  const router = useRouter()
  const { balance, inventory, removeFromInventory, addToInventory } = useStore()
  const [mySkin, setMySkin] = useState<any>(null)
  const [targetSkin, setTargetSkin] = useState<any>(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [needleDeg, setNeedleDeg] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [dbItems, setDbItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [multiplier, setMultiplier] = useState<number | null>(null)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(999999)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setDbItems(data)
    })
  }, [])

  

  useEffect(() => {
    if (!mySkin || !multiplier) return
    const targetPrice = mySkin.price * multiplier
    const suitable = dbItems
      .filter(i => i.price >= targetPrice * 0.85 && i.price <= targetPrice * 1.15)
      .sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice))
    if (suitable.length > 0) setTargetSkin(suitable[0])
  }, [multiplier, mySkin, dbItems])

  const chance = mySkin && targetSkin
    ? Math.min(75, Math.round((mySkin.price / targetSkin.price) * 100))
    : 0

  const R = 120
  const circumference = 2 * Math.PI * R
  const strokeDash = (chance / 100) * circumference

  const handleUpgrade = () => {
    if (!mySkin || !targetSkin || spinning) return
    const currentChance = Math.min(75, Math.round((mySkin.price / targetSkin.price) * 100))
    const winZoneDeg = (currentChance / 100) * 360
    const isWin = Math.random() * 100 < currentChance
    let finalAngle: number
    if (isWin) {
      finalAngle = Math.random() * winZoneDeg
    } else {
      finalAngle = winZoneDeg + Math.random() * (360 - winZoneDeg)
    }
    const totalSpin = 3 * 360 + finalAngle
    setSpinning(true)
    setResult(null)
    setAnimating(false)
    setNeedleDeg(0)
    setShowConfetti(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true)
        setNeedleDeg(totalSpin)
        setTimeout(() => {
          setResult(isWin ? 'win' : 'lose')
          setSpinning(false)
          setAnimating(false)
          if (isWin) setShowConfetti(true)
          removeFromInventory(mySkin.uid)
          fetch('/api/upgrades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromName: mySkin.name, fromPrice: mySkin.price, fromImage: mySkin.image,
              toName: targetSkin.name, toPrice: targetSkin.price, toImage: targetSkin.image,
              won: isWin,
            })
          }).catch(() => {})
          if (isWin) addToInventory({ ...targetSkin, color: '#e84b6a' }, 'Апгрейдер')
        }, 4100)
      })
    })
  }

  const reset = () => {
    setMySkin(null); setTargetSkin(null); setResult(null)
    setMultiplier(null); setNeedleDeg(0); setAnimating(false); setShowConfetti(false)
  }

  const filteredDb = dbItems.filter(item => {
    if (minPrice > 0 && item.price < minPrice) return false
    if (maxPrice < 999999 && item.price > maxPrice) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    if (mySkin) {
      const ch = Math.min(75, Math.round((mySkin.price / item.price) * 100))
      if (ch < 50) return false
    }
    return true
  }).sort((a, b) => b.price - a.price)

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a14', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <style suppressHydrationWarning>{`
        body { background: #0a0a14; margin: 0; }
        .nav-item-upgrade { position: relative; transition: all 0.3s ease; }
        .nav-item-upgrade::after { content: ""; position: absolute; bottom: -6px; left: 0; width: 0%; height: 2px; background: linear-gradient(90deg, #e94560, #ff6b6b); transition: width 0.3s ease; border-radius: 2px; }
        .nav-item-upgrade:hover::after { width: 100%; }
        .nav-item-upgrade-active::after { width: 100% !important; }
        @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes wheelGlow { 0%,100%{filter:drop-shadow(0 0 15px rgba(232,75,106,0.4))} 50%{filter:drop-shadow(0 0 35px rgba(232,75,106,0.9))} }
        @keyframes wreathPulse { 0%,100%{opacity:0.85;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
        @keyframes wreathWin { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
        @keyframes pulse-win { 0%{box-shadow:0 0 0 0 rgba(76,175,80,0);border-color:#1e2a4a} 50%{box-shadow:0 0 80px 30px rgba(76,175,80,0.7);border-color:#4caf50} 100%{box-shadow:0 0 0 0 rgba(76,175,80,0);border-color:#1e2a4a} }
        @keyframes pulse-lose { 0%{box-shadow:0 0 0 0 rgba(232,75,106,0);border-color:#1e2a4a} 50%{box-shadow:0 0 80px 30px rgba(232,75,106,0.7);border-color:#e84b6a} 100%{box-shadow:0 0 0 0 rgba(232,75,106,0);border-color:#1e2a4a} }
        @keyframes confetti { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes cornerGlow { 0%,100%{opacity:0.7} 50%{opacity:1} }
        .skin-card { transition: all 0.25s ease !important; }
        .skin-card:hover { transform: scale(1.03) !important; border-color: #e84b6a66 !important; box-shadow: 0 8px 25px rgba(232,75,106,0.2) !important; }
        .upgrade-btn { background: linear-gradient(135deg, #e84b6a, #c0392b, #e84b6a); background-size: 200% auto; animation: shimmer 3s ease infinite; box-shadow: 0 6px 30px rgba(232,75,106,0.5); transition: all 0.3s ease; }
        .upgrade-btn:hover { transform: translateY(-3px) scale(1.05) !important; box-shadow: 0 10px 40px rgba(232,75,106,0.7) !important; }
        .panel-scroll::-webkit-scrollbar { width: 4px; }
.panel-scroll::-webkit-scrollbar-track { background: rgba(136,71,255,0.05); border-radius: 4px; }
.panel-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #8847ff, #e84b6a); border-radius: 4px; }
.panel-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #a570ff, #ff6b8a); }
      `}</style>

      {/* Конфетти */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: '-20px',
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              background: ['#e84b6a', '#4caf50', '#f5a623', '#8847ff', '#4b9fff', '#fff'][Math.floor(Math.random() * 6)],
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              animation: `confetti ${Math.random() * 3 + 2}s ease ${Math.random() * 2}s forwards`,
            }} />
          ))}
        </div>
      )}

      {/* Фон */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'url(/upgrade-bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.15,
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(232,75,106,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(136,71,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(136,71,255,0.08) 0%, transparent 50%)',
      }} />

      {/* Угловые декорации */}
      

      {/* Навигация */}
      <nav style={{
        background: 'rgba(8,8,20,0.98)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(233,69,96,0.3)',
        padding: '0 30px', height: '80px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 30px rgba(0,0,0,0.5)'
      }}>
        <span onClick={() => router.push('/')} style={{
          cursor: 'pointer', fontSize: '36px', fontWeight: '800', letterSpacing: '-1px',
          background: 'linear-gradient(90deg, #ffffff 0%, #e94560 30%, #ff6b6b 60%, #ffffff 100%)',
          backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'shimmer 3s ease infinite',
        }}>OtakuCase</span>
        <div style={{ display: 'flex', gap: '30px' }}>
          {([['/', 'Кейсы'], ['/upgrade', 'Апгрейд'], ['/contracts', 'Контракты']] as [string, string][]).map(([href, label]) => (
            <span key={href} onClick={() => router.push(href)}
              className={`nav-item-upgrade ${href === '/upgrade' ? 'nav-item-upgrade-active' : ''}`}
              style={{ padding: '6px 0', fontSize: '15px', fontWeight: '500', cursor: 'pointer', color: href === '/upgrade' ? '#fff' : '#888' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e94560'}
              onMouseLeave={e => e.currentTarget.style.color = href === '/upgrade' ? '#fff' : '#888'}
            >{label}</span>
          ))}
        </div>
        <div style={{ background: 'rgba(233,69,96,0.12)', padding: '10px 24px', borderRadius: '50px', border: '1px solid rgba(233,69,96,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}></span>
          <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '18px', fontFamily: 'monospace' }}>{balance.toFixed(2)} ₽</span>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <DropsPanel />
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 20px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px 1fr', gap: '20px', alignItems: 'start', marginBottom: '28px' }}>

              {/* Мой скин */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(22,33,62,0.9), rgba(26,26,46,0.9))',
                borderRadius: '20px', backdropFilter: 'blur(10px)',
                border: `2px solid ${result === 'lose' ? '#e84b6a' : mySkin ? '#4caf5066' : '#1e2a4a'}`,
                padding: '28px', minHeight: '240px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                animation: result === 'lose' ? 'pulse-lose 1s ease' : 'none',
                position: 'relative', overflow: 'visible',
              }}>
                <img src="/corner-pink.png" style={{ position: 'absolute', top: -25, left: -25, width: '100px', opacity: 0.8, pointerEvents: 'none' }} alt="" />
                <img src="/corner-pink.png" style={{ position: 'absolute', top: -25, right: -25, width: '100px', opacity: 0.8, pointerEvents: 'none', transform: 'scaleX(-1)' }} alt="" />
                <img src="/corner-pink.png" style={{ position: 'absolute', bottom: -25, left: -25, width: '100px', opacity: 0.8, pointerEvents: 'none', transform: 'scaleY(-1)' }} alt="" />
                <img src="/corner-pink.png" style={{ position: 'absolute', bottom: -25, right: -25, width: '100px', opacity: 0.8, pointerEvents: 'none', transform: 'scale(-1)' }} alt="" />
                <div style={{ position: 'absolute', inset: 0, background: result === 'lose' ? 'rgba(232,75,106,0.05)' : 'transparent', transition: 'background 0.3s' }} />
                <p style={{ color: '#666', fontSize: '11px', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: 'bold' }}>ВАШ ПРЕДМЕТ</p>
                {mySkin ? (
                  <>
                    <img src={mySkin.image ? proxyImage(mySkin.image) : ''} alt={mySkin.name}
                      style={{ width: '150px', height: '110px', objectFit: 'contain', marginBottom: '12px', filter: 'drop-shadow(0 6px 16px rgba(233,69,96,0.5))' }}
                      onError={e => (e.currentTarget.style.display = 'none')} />
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>{mySkin.name}</p>
                    <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '22px', marginBottom: '12px' }}>{mySkin.price} ₽</p>
                    <button onClick={() => { setMySkin(null); setResult(null); setMultiplier(null) }}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#888', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>Сменить</button>
                  </>
                ) : (
                  <div style={{ opacity: 0.4 }}>
                    {dbItems.length > 0 && <img src={proxyImage(dbItems[0].image)} style={{ width: '120px', height: '90px', objectFit: 'contain', marginBottom: '12px', filter: 'grayscale(1)' }} alt="" />}
                    <p style={{ fontSize: '14px', color: '#333' }}>Выберите предмет снизу</p>
                  </div>
                )}
              </div>

              {/* Колесо */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '360px', height: '360px' }}>

                  {/* Венок вокруг колеса */}
                  <img src="/wreath-circle.png" style={{
                    position: 'absolute', top: '-25px', left: '-33.55px', width: 'calc(100% + 65px)', height: 'calc(100% + 65px)',
                    objectFit: 'contain', zIndex: 0, pointerEvents: 'none',
                    opacity: 0.6,
                    filter: result === 'win' ? 'drop-shadow(0 0 30px #8847ff) brightness(1.4)' : 'none',
                    transition: 'filter 0.3s',
                    mixBlendMode: 'screen' as const,
                  }} alt="" />
                  

                  <svg width="360" height="360" style={{ position: 'relative', zIndex: 1 }}>
                    <defs>
                      <linearGradient id="chanceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff6b81" />
                        <stop offset="100%" stopColor="#e84b6a" />
                      </linearGradient>
                      <linearGradient id="winGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4caf50" />
                        <stop offset="100%" stopColor="#8bc34a" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    <circle cx="180" cy="180" r={R} fill="none" stroke="#141e33" strokeWidth="36" />
                    <circle cx="180" cy="180" r={R}
                      fill="none"
                      stroke={result === 'win' ? 'url(#winGrad)' : 'url(#chanceGrad)'}
                      strokeWidth="36"
                      strokeDasharray={`${strokeDash} ${circumference}`}
                      strokeLinecap="butt"
                      filter="url(#glow)"
                      transform="rotate(-90 180 180)"
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                    <circle cx="180" cy="180" r={R + 24} fill="none" stroke="#ffffff04" strokeWidth="1" />
                    <circle cx="180" cy="180" r={R - 24} fill="none" stroke="#ffffff04" strokeWidth="1" />
                    {Array.from({ length: 60 }).map((_, i) => {
                      const angle = ((i * 6 - 90) * Math.PI) / 180
                      const isMajor = i % 5 === 0
                      const x1 = 180 + (R - (isMajor ? 20 : 12)) * Math.cos(angle)
                      const y1 = 180 + (R - (isMajor ? 20 : 12)) * Math.sin(angle)
                      const x2 = 180 + (R + (isMajor ? 20 : 12)) * Math.cos(angle)
                      const y2 = 180 + (R + (isMajor ? 20 : 12)) * Math.sin(angle)
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? '#ffffff0d' : '#ffffff05'} strokeWidth={isMajor ? 1 : 0.5} />
                    })}
                  </svg>

                  {/* Стрелка */}
                  <svg style={{
                    position: 'absolute', bottom: '50%', left: '50%',
                    width: '20px', height: '135px',
                    marginLeft: '-10px',
                    transformOrigin: 'bottom center',
                    transform: `rotate(${needleDeg}deg)`,
                    transition: animating ? 'transform 4s cubic-bezier(0.3, 0.9, 0.4, 1)' : 'none',
                    zIndex: 2,
                    filter: 'none',
                    overflow: 'visible',
                  }} viewBox="0 0 24 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                      <stop offset="70%" stopColor="#ffffff" stopOpacity="0.9"/>
                      <stop offset="100%" stopColor="#cccccc" stopOpacity="0.7"/>
                    </linearGradient>
                    <linearGradient id="needleEdge" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3"/>
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3"/>
                    </linearGradient>
                  </defs>
                  {/* Тело стрелки */}
                  <polygon points="12,0 17,110 12,122 7,110" fill="url(#needleGrad)" />
                  {/* Блик по центру */}
                  <polygon points="12,0 13.5,100 12,112 10.5,100" fill="url(#needleEdge)" opacity="0.6"/>
                  {/* Острие */}
                  <polygon points="12,122 8,108 16,108" fill="#fff" opacity="0.9"/>
                  {/* Основание */}
                  <ellipse cx="12" cy="106" rx="5" ry="3" fill="white" opacity="0.8"/>
                </svg>

                  {/* Центр */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'radial-gradient(circle, #0d0d1a, #0a0a14)',
                    border: `2px solid ${result === 'win' ? '#4caf50' : result === 'lose' ? '#e84b6a' : 'rgba(136,71,255,0.4)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3,
                    boxShadow: result === 'win' ? '0 0 30px rgba(76,175,80,0.5)' : result === 'lose' ? '0 0 30px rgba(232,75,106,0.5)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {result === 'win' && <p style={{ color: '#4caf50', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>WIN!</p>}
                    {result === 'lose' && <p style={{ color: '#e84b6a', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>LOSE</p>}
                    {!result && <>
                      <p style={{ color: '#e84b6a', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{chance}%</p>
                      <p style={{ color: '#444', fontSize: '11px', margin: 0 }}>шанс</p>
                    </>}
                  </div>

                  <div style={{ position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)', color: '#555', fontSize: '10px', zIndex: 6 }}>MAX 75%</div>
                </div>

                {result ? (
                  <button onClick={reset} style={{ background: 'rgba(136,71,255,0.08)', border: '1px solid #8847ff', color: '#a570ff', borderRadius: '12px', padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Ещё раз</button>
                ) : (
                  <button onClick={handleUpgrade} disabled={!mySkin || !targetSkin || spinning}
  className={(!mySkin || !targetSkin || spinning) ? '' : 'upgrade-btn'}
  style={{
    background: (!mySkin || !targetSkin || spinning) ? '#1e2a4a' : undefined,
    color: (!mySkin || !targetSkin || spinning) ? '#444' : 'white',
    border: 'none', borderRadius: '16px', padding: '16px 48px',
    fontWeight: 'bold', cursor: (!mySkin || !targetSkin || spinning) ? 'not-allowed' : 'pointer',
    fontSize: '18px', letterSpacing: '1px',
    boxShadow: (!mySkin || !targetSkin || spinning) ? 'none' : '0 0 30px rgba(232,75,106,0.6)',
    transition: 'all 0.3s',
  }}>
  {spinning ? 'Крутится...' : 'Прокачать'}
</button>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  {CHANCE_PRESETS.map(p => (
                    <button key={p.label} onClick={() => setMultiplier(p.mult)} disabled={!mySkin}
                      style={{
                        padding: '7px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px',
                        cursor: mySkin ? 'pointer' : 'not-allowed',
                        background: multiplier === p.mult ? p.color : 'rgba(255,255,255,0.05)',
                        color: multiplier === p.mult ? 'white' : '#666',
                        border: `1px solid ${multiplier === p.mult ? p.color : 'rgba(136,71,255,0.25)'}`,
                        transition: 'all 0.2s',
                        boxShadow: multiplier === p.mult ? `0 4px 15px ${p.color}66` : 'none'
                      }}>{p.label}</button>
                  ))}
                </div>
              </div>

              {/* Цель */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(22,33,62,0.9), rgba(26,26,46,0.9))',
                borderRadius: '20px', backdropFilter: 'blur(10px)',
                border: `2px solid ${result === 'win' ? '#4caf50' : targetSkin ? '#e84b6a66' : '#1e2a4a'}`,
                padding: '28px', minHeight: '240px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                animation: result === 'win' ? 'pulse-win 1s ease' : 'none',
                position: 'relative', overflow: 'visible',
              }}>
                <img src="/corner-pink.png" style={{ position: 'absolute', top: -25, left: -25, width: '100px', opacity: 0.8, pointerEvents: 'none' }} alt="" />
<img src="/corner-pink.png" style={{ position: 'absolute', top: -25, right: -25, width: '100px', opacity: 0.8, pointerEvents: 'none', transform: 'scaleX(-1)' }} alt="" />
<img src="/corner-pink.png" style={{ position: 'absolute', bottom: -25, left: -25, width: '100px', opacity: 0.8, pointerEvents: 'none', transform: 'scaleY(-1)' }} alt="" />
<img src="/corner-pink.png" style={{ position: 'absolute', bottom: -25, right: -25, width: '100px', opacity: 0.8, pointerEvents: 'none', transform: 'scale(-1)' }} alt="" />
                <p style={{ color: '#666', fontSize: '11px', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: 'bold' }}>ВЫБЕРИТЕ ПРЕДМЕТ</p>
                {targetSkin ? (
                  <>
                    <img src={proxyImage(targetSkin.image)} alt={targetSkin.name}
                      style={{ width: '150px', height: '110px', objectFit: 'contain', marginBottom: '12px', filter: 'drop-shadow(0 6px 16px rgba(233,69,96,0.5))' }} />
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>{targetSkin.name}</p>
                    <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '22px', marginBottom: '12px' }}>{targetSkin.price} ₽</p>
                    <button onClick={() => { setTargetSkin(null); setMySkin(null); setResult(null); setMultiplier(null) }}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#888', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>Сменить</button>
                  </>
                ) : (
                  <div style={{ opacity: 0.4 }}>
                    {dbItems.length > 0 && <img src={proxyImage(dbItems[Math.floor(dbItems.length / 2)].image)} style={{ width: '120px', height: '90px', objectFit: 'contain', marginBottom: '12px', filter: 'grayscale(1)' }} alt="" />}
                    <p style={{ fontSize: '14px', color: '#333' }}>Нажмите x2/x5 или выберите снизу</p>
                  </div>
                )}
              </div>
            </div>

            {/* Победный венок */}
            {result === 'win' && (
              <div style={{ textAlign: 'center', marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))', borderRadius: '20px', border: '1px solid rgba(76,175,80,0.4)', boxShadow: '0 0 40px rgba(76,175,80,0.3)' }}>
                <p style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '24px', margin: 0 }}>Поздравляем! {targetSkin?.name} добавлен в инвентарь!</p>
              </div>
            )}
            {result === 'lose' && (
              <div style={{ textAlign: 'center', marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, rgba(232,75,106,0.15), rgba(232,75,106,0.05))', borderRadius: '16px', border: '1px solid rgba(232,75,106,0.4)', boxShadow: '0 0 30px rgba(232,75,106,0.2)' }}>
                
                <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '22px', margin: 0 }}>Не повезло! Скин потерян.</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Инвентарь */}
              <div style={{ background: 'linear-gradient(135deg, rgba(22,33,62,0.9), rgba(26,26,46,0.9))', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(136,71,255,0.2)' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '16px', color: '#ddd', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                   Мой инвентарь <span style={{ background: 'rgba(136,71,255,0.2)', border: '1px solid rgba(136,71,255,0.4)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', color: '#a570ff' }}>{inventory.length}</span>
                </h2>
                {inventory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#333' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
                    <p style={{ marginBottom: '12px' }}>Инвентарь пуст</p>
                    <button onClick={() => router.push('/')} style={{ background: '#e84b6a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Открыть кейсы</button>
                  </div>
                ) : (
                  <div className="panel-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', maxHeight: '340px', overflowY: 'auto', overflowX: 'hidden', padding: '4px' }}>
                    {[...inventory].sort((a, b) => b.price - a.price).map((item: any) => (
                      <div key={item.uid} className="skin-card" onClick={() => { setMySkin(item); setResult(null); setMultiplier(null) }}
                        style={{
                          background: mySkin?.uid === item.uid ? 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))' : 'linear-gradient(135deg, #0d1117, #16213e)',
                          borderRadius: '14px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                          border: `1px solid ${mySkin?.uid === item.uid ? '#4caf50' : '#1e2a4a'}`,
                        }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
                          {item.image ? <img src={proxyImage(item.image)} alt={item.name} style={{ width: '100px', height: '70px', objectFit: 'contain' }} />
                            : <div style={{ fontSize: '28px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>}
                        </div>
                        <p style={{ color: '#bbb', fontSize: '9px', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</p>
                        <p style={{ color: '#e84b6a', fontSize: '12px', fontWeight: 'bold' }}>{item.price} ₽</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Магазин */}
              <div style={{ background: 'linear-gradient(135deg, rgba(22,33,62,0.9), rgba(26,26,46,0.9))', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(136,71,255,0.2)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 'bold', color: '#ddd', margin: 0, flexShrink: 0, letterSpacing: '0.5px' }}>Прокачать до</h2>
                  <input type="number" placeholder="От ₽" onChange={e => setMinPrice(Number(e.target.value))}
                    style={{ width: '80px', background: '#0a0a14', border: '1px solid rgba(136,71,255,0.25)', color: 'white', padding: '7px 10px', borderRadius: '10px', fontSize: '13px', outline: 'none' }} />
                  <input type="number" placeholder="До ₽" onChange={e => setMaxPrice(Number(e.target.value))}
                    style={{ width: '80px', background: '#0a0a14', border: '1px solid rgba(136,71,255,0.25)', color: 'white', padding: '7px 10px', borderRadius: '10px', fontSize: '13px', outline: 'none' }} />
                  <input placeholder="Поиск скина..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, background: '#0a0a14', border: '1px solid rgba(136,71,255,0.25)', color: 'white', padding: '7px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }} />
                </div>
                {filteredDb.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#333' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
                    <p>{dbItems.length === 0 ? 'Нет скинов — добавьте через админку' : 'Нет подходящих скинов'}</p>
                  </div>
                ) : (
                  <div className="panel-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', maxHeight: '340px', overflowY: 'auto', overflowX: 'hidden', padding: '4px' }}>
                    {filteredDb.map(skin => {
                      const ch = mySkin ? Math.min(75, Math.round((mySkin.price / skin.price) * 100)) : null
                      return (
                        <div key={skin.id} className="skin-card" onClick={() => { setTargetSkin(skin); setResult(null) }}
                          style={{
                            background: targetSkin?.id === skin.id ? 'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(233,69,96,0.05))' : 'linear-gradient(135deg, #0d1117, #16213e)',
                            borderRadius: '14px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                            border: `1px solid ${targetSkin?.id === skin.id ? '#e84b6a' : '#1e2a4a'}`,
                          }}>
                          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
                            <img src={proxyImage(skin.image)} alt={skin.name} style={{ width: '100px', height: '70px', objectFit: 'contain' }} />
                          </div>
                          <p style={{ color: '#bbb', fontSize: '9px', marginBottom: '4px', lineHeight: 1.3 }}>{skin.name.replace(/^★\s*/, '')}</p>
                          <p style={{ color: '#e84b6a', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{skin.price} ₽</p>
                          
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}