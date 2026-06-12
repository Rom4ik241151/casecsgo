'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

const proxyImage = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`

const CHANCE_PRESETS = [
  { label: 'x2', mult: 2, color: '#4caf50' },
  { label: 'x3', mult: 3, color: '#8bc34a' },
  { label: 'x5', mult: 5, color: '#f5a623' },
  { label: 'x10', mult: 10, color: '#e84b6a' },
]

export default function UpgradePage() {
  const router = useRouter()
  const { balance, inventory, removeFromInventory, addToInventory } = useStore()
  const [mySkin, setMySkin] = useState<any>(null)
  const [targetSkin, setTargetSkin] = useState<any>(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [needleDeg, setNeedleDeg] = useState(270)
  const [dbItems, setDbItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [multiplier, setMultiplier] = useState<number | null>(null)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(999999)

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setDbItems(data)
    })
  }, [])

  useEffect(() => {
    if (!mySkin || !multiplier) return
    const targetPrice = mySkin.price * multiplier
    const suitable = dbItems
      .filter(i => i.price >= targetPrice * 0.8 && i.price <= targetPrice * 1.3)
      .sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice))
    if (suitable.length > 0) setTargetSkin(suitable[0])
  }, [multiplier, mySkin, dbItems])

  const chance = mySkin && targetSkin
    ? Math.min(75, Math.round((mySkin.price / targetSkin.price) * 100))
    : 0

  const R = 120
  const circumference = 2 * Math.PI * R
  const strokeDash = (chance / 100) * circumference

  const chanceColor = chance > 60 ? '#4caf50' : chance > 35 ? '#f5a623' : '#e84b6a'

  const handleUpgrade = () => {
    if (!mySkin || !targetSkin || spinning) return
    setSpinning(true)
    setResult(null)

    const win = Math.random() * 100 < chance
    const winZone = chance / 100 * 360
    const endAngle = win
      ? Math.random() * winZone
      : winZone + Math.random() * (360 - winZone)
    const totalSpin = 1800 + endAngle
    

    setNeedleDeg(prev => prev + totalSpin)

    setTimeout(() => {
      setResult(win ? 'win' : 'lose')
      setSpinning(false)
      removeFromInventory(mySkin.uid)
      if (win) addToInventory({ ...targetSkin, color: '#e84b6a' }, 'Апгрейдер')
    }, 4000)
  }

  const reset = () => {
    setMySkin(null)
    setTargetSkin(null)
    setResult(null)
    setMultiplier(null)
  }

  const filteredDb = dbItems.filter(item => {
    if (mySkin && item.price < mySkin.price * 1.5) return false
    if (minPrice > 0 && item.price < minPrice) return false
    if (maxPrice < 999999 && item.price > maxPrice) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a14', color: 'white' }}>
      <style>{`
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        body { background: #0a0a14; }
        .upgrade-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(232,75,106,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(76,175,80,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(139,68,255,0.06) 0%, transparent 50%);
        }
        @keyframes pulse-win { 0%{box-shadow:0 0 0 0 rgba(76,175,80,0);border-color:#1e2a4a} 50%{box-shadow:0 0 60px 20px rgba(76,175,80,0.6);border-color:#4caf50} 100%{box-shadow:0 0 0 0 rgba(76,175,80,0);border-color:#1e2a4a} }
        @keyframes pulse-lose { 0%{box-shadow:0 0 0 0 rgba(232,75,106,0);border-color:#1e2a4a} 50%{box-shadow:0 0 60px 20px rgba(232,75,106,0.6);border-color:#e84b6a} 100%{box-shadow:0 0 0 0 rgba(232,75,106,0);border-color:#1e2a4a} }
        @keyframes win-flash { 0%,100%{background:linear-gradient(135deg,#16213e,#1a1a2e)} 50%{background:linear-gradient(135deg,rgba(76,175,80,0.15),#1a1a2e)} }
        @keyframes lose-flash { 0%,100%{background:linear-gradient(135deg,#16213e,#1a1a2e)} 50%{background:linear-gradient(135deg,rgba(232,75,106,0.15),#1a1a2e)} }
        @keyframes spin-glow { 0%{filter:drop-shadow(0 0 8px #e84b6a)} 50%{filter:drop-shadow(0 0 20px #e84b6a)} 100%{filter:drop-shadow(0 0 8px #e84b6a)} }
        .skin-card:hover { transform: translateY(-3px); border-color: #e84b6a44 !important; }
      `}</style>

      <nav style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '22px', cursor: 'pointer' }}>OtakuCase</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([['/', '🎁 Кейсы'], ['/upgrade', '⚡ Апгрейд'], ['/roulette', '🎰 Рулетка'], ['/contracts', '📋 Контракты']] as [string, string][]).map(([href, label]) => (
            <span key={href} onClick={() => router.push(href)} style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', background: href === '/upgrade' ? '#e84b6a' : 'transparent', color: href === '/upgrade' ? 'white' : '#888', border: href === '/upgrade' ? 'none' : '1px solid #1e2a4a', transition: 'all 0.2s' }}>{label}</span>
          ))}
        </div>
        <span style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '16px' }}>{balance.toLocaleString()} ₽</span>
      </nav>

      <div className="upgrade-bg" />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 20px', position: 'relative', zIndex: 1 }}>

        {/* Верхняя панель */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px 1fr', gap: '20px', alignItems: 'start', marginBottom: '28px' }}>

          {/* Мой скин */}
          <div style={{
            background: 'linear-gradient(135deg, #16213e, #1a1a2e)',
            borderRadius: '20px',
            border: `2px solid ${mySkin ? '#4caf5066' : '#1e2a4a'}`,
            padding: '28px', minHeight: '240px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            animation: result === 'lose' ? 'pulse-lose 1s ease' : result === 'win' ? '' : 'none',
            transition: 'border-color 0.3s'
          }}>
            <p style={{ color: '#555', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px', fontWeight: 'bold' }}>ВАШ ПРЕДМЕТ</p>
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
                {dbItems.length > 0 && <img src={proxyImage(dbItems[0].image)} style={{ width: '120px', height: '90px', objectFit: 'contain', marginBottom: '12px', filter: 'grayscale(1)' }} />}
                <p style={{ fontSize: '14px', color: '#333' }}>Выберите предмет снизу</p>
              </div>
            )}
          </div>

          {/* Центр */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>

            

            {/* Большое колесо */}
            <div style={{ position: 'relative', width: '320px', height: '320px' }}>
              {/* Фоновый градиент */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, #1a1a2e 60%, transparent 100%)', zIndex: 0 }} />

              <svg width="320" height="320" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
                <defs>
                  <linearGradient id="chanceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={chanceColor} />
                    <stop offset="100%" stopColor={chanceColor + '88'} />
                  </linearGradient>
                  <linearGradient id="loseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e84b6a" />
                    <stop offset="100%" stopColor="#e84b6a88" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {/* Внешнее кольцо фон */}
                <circle cx="160" cy="160" r={R} fill="none" stroke="#0d1117" strokeWidth="32" />
                {/* Зона проигрыша */}
                <circle cx="160" cy="160" r={R} fill="none" stroke="#e84b6a33" strokeWidth="32"
                  strokeDasharray={`${((100 - chance) / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-strokeDash}
                />
                {/* Зона выигрыша */}
                <circle cx="160" cy="160" r={R} fill="none" stroke="url(#chanceGrad)" strokeWidth="32"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  strokeLinecap="butt"
                  filter="url(#glow)"
                  style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
                />
                {/* Внешний декор */}
                <circle cx="160" cy="160" r={R + 20} fill="none" stroke="#ffffff08" strokeWidth="1" />
                <circle cx="160" cy="160" r={R - 20} fill="none" stroke="#ffffff08" strokeWidth="1" />
                {/* Засечки */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const angle = (i * 6 * Math.PI) / 180
                  const isMajor = i % 5 === 0
                  const x1 = 160 + (R - (isMajor ? 18 : 10)) * Math.cos(angle)
                  const y1 = 160 + (R - (isMajor ? 18 : 10)) * Math.sin(angle)
                  const x2 = 160 + (R + (isMajor ? 18 : 10)) * Math.cos(angle)
                  const y2 = 160 + (R + (isMajor ? 18 : 10)) * Math.sin(angle)
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? '#ffffff22' : '#ffffff0a'} strokeWidth={isMajor ? 2 : 1} />
                })}
              </svg>

              {/* Стрелка */}
              <div style={{
                position: 'absolute', bottom: '50%', left: '50%',
                width: '4px', height: '110px',
                marginLeft: '-2px',
                background: 'linear-gradient(to top, white, rgba(255,255,255,0.3))',
                borderRadius: '4px 4px 0 0',
                transformOrigin: 'bottom center',
                transform: `rotate(${needleDeg}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.12,0.8,0.15,1)' : 'none',
                zIndex: 2,
                filter: 'drop-shadow(0 0 4px white)'
              }} />

              {/* Центральный круг */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '110px', height: '110px', borderRadius: '50%', background: '#0a0a14', border: '2px solid #1e2a4a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                {result === 'win' && <p style={{ color: '#4caf50', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>WIN!</p>}
                {result === 'lose' && <p style={{ color: '#e84b6a', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>LOSE</p>}
                {!result && <>
                  <p style={{ color: chanceColor, fontSize: '20px', fontWeight: 'bold', margin: 0, transition: 'color 0.3s' }}>{chance}%</p>
                  <p style={{ color: '#444', fontSize: '10px', margin: 0 }}>шанс</p>
                </>}
              </div>

              {/* Метка 0% и 75% */}
              <div style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', color: '#333', fontSize: '10px', zIndex: 4 }}>MAX 75%</div>
            </div>

            {/* Кнопка */}
            {result ? (
              <button onClick={reset} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #e84b6a', color: '#e84b6a', borderRadius: '12px', padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Ещё раз</button>
            ) : (
              <button onClick={handleUpgrade} disabled={!mySkin || !targetSkin || spinning}
                style={{
                  background: (!mySkin || !targetSkin || spinning) ? '#1e2a4a' : `linear-gradient(135deg, #e84b6a, #c0392b)`,
                  color: (!mySkin || !targetSkin || spinning) ? '#444' : 'white',
                  border: 'none', borderRadius: '12px', padding: '14px 36px',
                  fontWeight: 'bold', cursor: (!mySkin || !targetSkin || spinning) ? 'not-allowed' : 'pointer',
                  fontSize: '16px', transition: 'all 0.2s',
                  boxShadow: (!mySkin || !targetSkin || spinning) ? 'none' : '0 6px 25px rgba(233,69,96,0.5)',
                  animation: spinning ? 'spin-glow 1s infinite' : 'none'
                }}>
                {spinning ? '⏳ Крутится...' : '⚡ Прокачать'}
              </button>
            )}
            {/* Пресеты */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {CHANCE_PRESETS.map(p => (
                <button key={p.label} onClick={() => setMultiplier(p.mult)} disabled={!mySkin}
                  style={{
                    padding: '7px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px',
                    cursor: mySkin ? 'pointer' : 'not-allowed',
                    background: multiplier === p.mult ? p.color : 'rgba(255,255,255,0.05)',
                    color: multiplier === p.mult ? 'white' : '#666',
                    border: `1px solid ${multiplier === p.mult ? p.color : '#1e2a4a'}`,
                    transition: 'all 0.2s',
                    boxShadow: multiplier === p.mult ? `0 4px 15px ${p.color}66` : 'none'
                  }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Цель */}
          <div style={{
            background: 'linear-gradient(135deg, #16213e, #1a1a2e)',
            borderRadius: '20px',
            border: `2px solid ${targetSkin ? '#e84b6a66' : '#1e2a4a'}`,
            padding: '28px', minHeight: '240px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            animation: result === 'win' ? 'pulse-win 1s ease' : 'none',
            transition: 'border-color 0.3s'
          }}>
            <p style={{ color: '#555', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px', fontWeight: 'bold' }}>ВЫБЕРИТЕ ПРЕДМЕТ</p>
            {targetSkin ? (
              <>
                <img src={proxyImage(targetSkin.image)} alt={targetSkin.name}
                  style={{ width: '150px', height: '110px', objectFit: 'contain', marginBottom: '12px', filter: 'drop-shadow(0 6px 16px rgba(233,69,96,0.5))' }} />
                <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>{targetSkin.name}</p>
                <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '22px', marginBottom: '12px' }}>{targetSkin.price} ₽</p>
                <button onClick={() => { setTargetSkin(null); setResult(null); setMultiplier(null) }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#888', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>Сменить</button>
              </>
            ) : (
              <div style={{ opacity: 0.4 }}>
                {dbItems.length > 0 && <img src={proxyImage(dbItems[Math.floor(dbItems.length / 2)].image)} style={{ width: '120px', height: '90px', objectFit: 'contain', marginBottom: '12px', filter: 'grayscale(1)' }} />}
                <p style={{ fontSize: '14px', color: '#333' }}>Нажмите x2/x5 или выберите снизу</p>
              </div>
            )}
          </div>
        </div>

        {/* Результат */}
        {result === 'win' && (
          <div style={{ textAlign: 'center', marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))', borderRadius: '16px', border: '1px solid rgba(76,175,80,0.4)', boxShadow: '0 0 30px rgba(76,175,80,0.2)' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🎉</p>
            <p style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '22px', margin: 0 }}>Поздравляем! {targetSkin?.name} добавлен в инвентарь!</p>
          </div>
        )}
        {result === 'lose' && (
          <div style={{ textAlign: 'center', marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, rgba(232,75,106,0.15), rgba(232,75,106,0.05))', borderRadius: '16px', border: '1px solid rgba(232,75,106,0.4)', boxShadow: '0 0 30px rgba(232,75,106,0.2)' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>😔</p>
            <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '22px', margin: 0 }}>Не повезло! Скин потерян.</p>
          </div>
        )}
        {/* Нижняя панель */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Инвентарь */}
          <div style={{ background: 'linear-gradient(135deg, #16213e, #1a1a2e)', borderRadius: '20px', padding: '20px', border: '1px solid #1e2a4a' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', color: '#888', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎒 Мой инвентарь <span style={{ background: '#1e2a4a', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{inventory.length}</span>
            </h2>
            {inventory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#333' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎒</div>
                <p style={{ marginBottom: '12px' }}>Инвентарь пуст</p>
                <button onClick={() => router.push('/')} style={{ background: '#e84b6a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Открыть кейсы</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                {inventory.map((item: any) => (
                 <div key={item.uid} className="skin-card" onClick={() => { setMySkin(item); setResult(null); setMultiplier(null) }}
                    style={{
                      background: mySkin?.uid === item.uid
                        ? 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))'
                        : 'linear-gradient(135deg, #0d1117, #16213e)',
                      borderRadius: '14px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                      border: `1px solid ${mySkin?.uid === item.uid ? '#4caf50' : '#1e2a4a'}`,
                      transition: 'all 0.2s',
                      boxShadow: mySkin?.uid === item.uid ? '0 0 20px rgba(76,175,80,0.3)' : 'none'
                    }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
                      {item.image
                        ? <img src={proxyImage(item.image)} alt={item.name} style={{ width: '100px', height: '70px', objectFit: 'contain' }} />
                        : <div style={{ fontSize: '28px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔫</div>}
                    </div>
                    <p style={{ color: '#bbb', fontSize: '9px', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ color: '#e84b6a', fontSize: '12px', fontWeight: 'bold' }}>{item.price} ₽</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Магазин */}
          <div style={{ background: 'linear-gradient(135deg, #16213e, #1a1a2e)', borderRadius: '20px', padding: '20px', border: '1px solid #1e2a4a' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#888', margin: 0, flexShrink: 0 }}>🎯 Прокачать до</h2>
              <input type="number" placeholder="От ₽" onChange={e => setMinPrice(Number(e.target.value))}
                style={{ width: '80px', background: '#0a0a14', border: '1px solid #1e2a4a', color: 'white', padding: '7px 10px', borderRadius: '10px', fontSize: '13px', outline: 'none' }} />
              <input type="number" placeholder="До ₽" onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '80px', background: '#0a0a14', border: '1px solid #1e2a4a', color: 'white', padding: '7px 10px', borderRadius: '10px', fontSize: '13px', outline: 'none' }} />
              <input placeholder="Поиск скина..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: '#0a0a14', border: '1px solid #1e2a4a', color: 'white', padding: '7px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }} />
            </div>
            {filteredDb.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#333' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
                <p>{dbItems.length === 0 ? 'Нет скинов — добавьте через админку' : 'Нет подходящих скинов'}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                {filteredDb.map(skin => {
                  const ch = mySkin ? Math.min(75, Math.round((mySkin.price / skin.price) * 100)) : null
                  return (
                    <div key={skin.id} className="skin-card" onClick={() => { setTargetSkin(skin); setResult(null) }}
                      style={{
                        background: targetSkin?.id === skin.id
                          ? 'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(233,69,96,0.05))'
                          : 'linear-gradient(135deg, #0d1117, #16213e)',
                        borderRadius: '14px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                        border: `1px solid ${targetSkin?.id === skin.id ? '#e84b6a' : '#1e2a4a'}`,
                        transition: 'all 0.2s',
                        boxShadow: targetSkin?.id === skin.id ? '0 0 20px rgba(233,69,96,0.3)' : 'none'
                      }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
                        <img src={proxyImage(skin.image)} alt={skin.name} style={{ width: '100px', height: '70px', objectFit: 'contain' }} />
                      </div>
                      <p style={{ color: '#bbb', fontSize: '9px', marginBottom: '4px', lineHeight: 1.3 }}>{skin.name}</p>
                      <p style={{ color: '#e84b6a', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{skin.price} ₽</p>
                      {ch !== null && (
                        <div style={{ background: ch > 50 ? 'rgba(76,175,80,0.15)' : ch > 25 ? 'rgba(245,166,35,0.15)' : 'rgba(232,75,106,0.15)', borderRadius: '6px', padding: '2px 6px' }}>
                          <p style={{ color: ch > 50 ? '#4caf50' : ch > 25 ? '#f5a623' : '#e84b6a', fontSize: '11px', fontWeight: 'bold', margin: 0 }}>{ch}%</p>
                        </div>
                      )}
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