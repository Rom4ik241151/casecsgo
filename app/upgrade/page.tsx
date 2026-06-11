'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

const targetSkins = [
  { id: 1, name: 'AK-47 | Redline', price: 1200, color: '#e84b6a', rarity: 'Classified', wear: 'FT' },
  { id: 2, name: 'Desert Eagle | Blaze', price: 2000, color: '#f5a623', rarity: 'Covert', wear: 'FN' },
  { id: 3, name: 'AWP | Asiimov', price: 3500, color: '#f5a623', rarity: 'Covert', wear: 'FT' },
  { id: 4, name: 'M4A4 | Howl', price: 8000, color: '#eb4b4b', rarity: 'Contraband', wear: 'FN' },
  { id: 5, name: 'Karambit | Fade', price: 12000, color: '#e4ae39', rarity: 'Covert', wear: 'FN' },
  { id: 6, name: 'AWP | Dragon Lore', price: 25000, color: '#e4ae39', rarity: 'Contraband', wear: 'FN' },
]

export default function UpgradePage() {
  const router = useRouter()
  const { balance, inventory, removeFromInventory, addToInventory, decreaseBalance } = useStore()
  const [mySkin, setMySkin] = useState<any>(null)
  const [targetSkin, setTargetSkin] = useState<any>(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [needleDeg, setNeedleDeg] = useState(0)

  const chance = mySkin && targetSkin
    ? Math.min(Math.round((mySkin.price / targetSkin.price) * 100), 90)
    : 50

  const handleUpgrade = () => {
    if (!mySkin || !targetSkin || spinning) return
    setSpinning(true)
    setResult(null)

    const win = Math.random() * 100 < chance
    const endAngle = win
      ? Math.random() * (chance / 100 * 360 - 10)
      : (chance / 100 * 360) + Math.random() * ((1 - chance / 100) * 360 - 10) + 10
    const totalSpin = 1440 + endAngle

    setNeedleDeg(prev => prev + totalSpin)

    setTimeout(() => {
      setResult(win ? 'win' : 'lose')
      setSpinning(false)
      removeFromInventory(mySkin.uid)
      if (win) addToInventory(targetSkin, 'Апгрейдер')
    }, 3000)
  }

  const reset = () => {
    setMySkin(null)
    setTargetSkin(null)
    setResult(null)
  }

  const strokeDash = (chance / 100) * 2 * Math.PI * 54

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0a0a1a', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>CaseCSGO</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([['/', '🎁 Кейсы'], ['/upgrade', '⚡ Апгрейд'], ['/roulette', '🎰 Рулетка'], ['/contracts', '📋 Контракты']] as [string,string][]).map(([href, label]) => (
            <span key={href} onClick={() => router.push(href)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              background: href === '/upgrade' ? '#e84b6a' : 'transparent',
              color: href === '/upgrade' ? 'white' : '#888',
              border: href === '/upgrade' ? 'none' : '1px solid #1e2a4a'
            }}>{label}</span>
          ))}
        </div>
        <span style={{ color: '#e84b6a', fontWeight: 'bold' }}>{balance} руб</span>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>⚡ Апгрейдер</h1>
        <p style={{ color: '#555', marginBottom: '32px', fontSize: '14px' }}>Поставь скин из инвентаря и попробуй выиграть более ценный</p>

        {/* Главная панель */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>

          {/* Мой скин */}
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: `1px solid ${mySkin ? '#4caf50' : '#1e2a4a'}`, minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '16px' }}>ВАШ СКИН</p>
            {mySkin ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔫</div>
                <p style={{ color: mySkin.color, fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>{mySkin.name}</p>
                <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px', marginBottom: '12px' }}>{mySkin.price} руб</p>
                <button onClick={() => { setMySkin(null); setResult(null) }} style={{ background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '6px', padding: '4px 14px', cursor: 'pointer', fontSize: '12px' }}>Сменить</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.3 }}>🔫</div>
                <p style={{ color: '#444', fontSize: '13px' }}>Выберите скин снизу</p>
              </>
            )}
          </div>

          {/* Колесо */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="54" fill="none" stroke="#1e2a4a" strokeWidth="16" />
                <circle cx="80" cy="80" r="54" fill="none" stroke="#e84b6a" strokeWidth="16"
                  strokeDasharray={`${strokeDash} ${2 * Math.PI * 54}`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              {/* Стрелка */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '4px', height: '60px', marginLeft: '-2px', marginTop: '-54px',
                background: 'white', borderRadius: '2px', transformOrigin: 'bottom center',
                transform: `rotate(${needleDeg}deg)`,
                transition: spinning ? `transform 3s cubic-bezier(0.17,0.67,0.12,0.99)` : 'none'
              }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                {result === 'win' && <p style={{ color: '#4caf50', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>WIN!</p>}
                {result === 'lose' && <p style={{ color: '#e84b6a', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>LOSE</p>}
                {!result && <>
                  <p style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{chance}%</p>
                  <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>шанс</p>
                </>}
              </div>
            </div>

            {result ? (
              <button onClick={reset} style={{ background: '#16213e', border: '1px solid #e84b6a', color: '#e84b6a', borderRadius: '10px', padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                Попробовать снова
              </button>
            ) : (
              <button onClick={handleUpgrade} disabled={!mySkin || !targetSkin || spinning} style={{
                background: (!mySkin || !targetSkin || spinning) ? '#1e2a4a' : 'linear-gradient(135deg, #e84b6a, #c0392b)',
                color: (!mySkin || !targetSkin || spinning) ? '#555' : 'white',
                border: 'none', borderRadius: '10px', padding: '12px 28px',
                fontWeight: 'bold', cursor: (!mySkin || !targetSkin || spinning) ? 'not-allowed' : 'pointer',
                fontSize: '14px', transition: 'all 0.2s'
              }}>
                {spinning ? '...' : '⚡ Прокачать'}
              </button>
            )}
          </div>

          {/* Целевой скин */}
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: `1px solid ${targetSkin ? '#e84b6a' : '#1e2a4a'}`, minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '16px' }}>ЦЕЛЬ АПГРЕЙДА</p>
            {targetSkin ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔫</div>
                <p style={{ color: targetSkin.color, fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>{targetSkin.name}</p>
                <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px', marginBottom: '12px' }}>{targetSkin.price} руб</p>
                <button onClick={() => { setTargetSkin(null); setResult(null) }} style={{ background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '6px', padding: '4px 14px', cursor: 'pointer', fontSize: '12px' }}>Сменить</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.3 }}>🎯</div>
                <p style={{ color: '#444', fontSize: '13px' }}>Выберите цель снизу</p>
              </>
            )}
          </div>
        </div>

        {/* Подсказка */}
        {!result && (
          <p style={{ textAlign: 'center', color: '#555', fontSize: '13px', marginBottom: '20px' }}>
            {!mySkin ? '👇 Выберите скин из инвентаря' : !targetSkin ? '👇 Теперь выберите цель апгрейда' : `✅ Шанс выигрыша: ${chance}% — жми Прокачать`}
          </p>
        )}
        {result === 'win' && <p style={{ textAlign: 'center', color: '#4caf50', fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>🎉 Поздравляем! {targetSkin?.name} добавлен в инвентарь!</p>}
        {result === 'lose' && <p style={{ textAlign: 'center', color: '#e84b6a', fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>😔 Не повезло! Скин потерян.</p>}

        {/* Инвентарь — выбор своего скина */}
        {!mySkin && (
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#888' }}>🎒 Ваш инвентарь — выберите скин для апгрейда</h2>
            {inventory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#444' }}>
                <p style={{ marginBottom: '12px' }}>Инвентарь пуст</p>
                <button onClick={() => router.push('/')} style={{ background: '#e84b6a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Открыть кейсы</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                {inventory.map((item: any) => (
                  <div key={item.uid} onClick={() => { setMySkin(item); setResult(null) }} style={{
                    background: '#0f1021', borderRadius: '10px', padding: '12px', textAlign: 'center',
                    cursor: 'pointer', border: '1px solid #1e2a4a', transition: 'all 0.2s',
                    borderBottom: `3px solid ${item.color}`
                  }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>🔫</div>
                    <p style={{ color: item.color, fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>{item.name}</p>
                    <p style={{ color: '#e84b6a', fontSize: '12px', fontWeight: 'bold' }}>{item.price} руб</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Цели апгрейда */}
        {mySkin && !targetSkin && (
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#888' }}>🎯 Выберите цель апгрейда</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {targetSkins.filter(s => s.price > mySkin.price).map(skin => {
                const ch = Math.min(Math.round((mySkin.price / skin.price) * 100), 90)
                return (
                  <div key={skin.id} onClick={() => { setTargetSkin(skin); setResult(null) }} style={{
                    background: '#0f1021', borderRadius: '10px', padding: '12px', textAlign: 'center',
                    cursor: 'pointer', border: '1px solid #1e2a4a', transition: 'all 0.2s',
                    borderBottom: `3px solid ${skin.color}`
                  }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>🔫</div>
                    <p style={{ color: skin.color, fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>{skin.name}</p>
                    <p style={{ color: '#e84b6a', fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>{skin.price} руб</p>
                    <p style={{ color: ch > 50 ? '#4caf50' : ch > 25 ? '#f5a623' : '#e84b6a', fontSize: '11px', fontWeight: 'bold' }}>{ch}% шанс</p>
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