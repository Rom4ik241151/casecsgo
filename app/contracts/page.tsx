'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

const REWARD_SKINS = [
  { id: 1, name: 'AK-47 | Redline', price: 1200, color: '#e84b6a', rarity: 'Classified' },
  { id: 2, name: 'AWP | Asiimov', price: 3500, color: '#f5a623', rarity: 'Covert' },
  { id: 3, name: 'M4A4 | Howl', price: 8000, color: '#eb4b4b', rarity: 'Contraband' },
  { id: 4, name: 'Karambit | Fade', price: 12000, color: '#e4ae39', rarity: 'Covert' },
  { id: 5, name: 'AWP | Dragon Lore', price: 25000, color: '#e4ae39', rarity: 'Contraband' },
  { id: 6, name: 'Desert Eagle | Blaze', price: 2000, color: '#f5a623', rarity: 'Covert' },
]

export default function ContractsPage() {
  const router = useRouter()
  const { balance, inventory, removeFromInventory, addToInventory } = useStore()
  const [selected, setSelected] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [done, setDone] = useState(false)

  const MAX = 10
  const avgPrice = selected.length > 0
    ? Math.round(selected.reduce((s, i) => s + i.price, 0) / selected.length)
    : 0

  const toggle = (item: any) => {
    if (done) return
    if (selected.find(s => s.uid === item.uid)) {
      setSelected(prev => prev.filter(s => s.uid !== item.uid))
    } else {
      if (selected.length >= MAX) return
      setSelected(prev => [...prev, item])
    }
  }

  const execute = () => {
    if (selected.length !== MAX || done) return

    const eligible = REWARD_SKINS.filter(s => s.price > avgPrice)
    const pool = eligible.length > 0 ? eligible : REWARD_SKINS
    const reward = pool[Math.floor(Math.random() * pool.length)]

    selected.forEach(item => removeFromInventory(item.uid))
    addToInventory(reward, 'Контракт')
    setResult(reward)
    setDone(true)
    setSelected([])
  }

  const reset = () => {
    setResult(null)
    setDone(false)
    setSelected([])
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0a0a1a', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>CaseCSGO</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([['/', '🎁 Кейсы'], ['/upgrade', '⚡ Апгрейд'], ['/roulette', '🎰 Рулетка'], ['/contracts', '📋 Контракты']] as [string, string][]).map(([href, label]) => (
            <span key={href} onClick={() => router.push(href)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              background: href === '/contracts' ? '#4b9de8' : 'transparent',
              color: href === '/contracts' ? 'white' : '#888',
              border: href === '/contracts' ? 'none' : '1px solid #1e2a4a'
            }}>{label}</span>
          ))}
        </div>
        <span style={{ color: '#e84b6a', fontWeight: 'bold' }}>{balance} руб</span>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>📋 Контракты</h1>
        <p style={{ color: '#555', marginBottom: '32px', fontSize: '14px' }}>Выбери 10 скинов из инвентаря и получи один более редкий</p>

        {/* Результат */}
        {result && (
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '32px', border: `2px solid ${result.color}`, marginBottom: '24px', textAlign: 'center' }}>
            <p style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '20px', marginBottom: '16px' }}>🎉 Контракт выполнен!</p>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔫</div>
            <p style={{ color: result.color, fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{result.name}</p>
            <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '22px', marginBottom: '20px' }}>{result.price} руб</p>
            <p style={{ color: '#555', fontSize: '13px', marginBottom: '20px' }}>Скин добавлен в инвентарь</p>
            <button onClick={reset} style={{ background: '#4b9de8', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              Новый контракт
            </button>
          </div>
        )}

        {/* Панель выбранных */}
        {!done && (
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>
                Выбрано: <span style={{ color: selected.length === MAX ? '#4caf50' : '#e84b6a' }}>{selected.length}</span> / {MAX}
              </h2>
              {avgPrice > 0 && (
                <span style={{ color: '#888', fontSize: '13px' }}>Средняя цена: <span style={{ color: '#f5a623', fontWeight: 'bold' }}>{avgPrice} руб</span></span>
              )}
            </div>

            {/* Слоты */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {Array.from({ length: MAX }).map((_, i) => {
                const item = selected[i]
                return (
                  <div key={i} onClick={() => item && toggle(item)} style={{
                    height: '70px', borderRadius: '8px', border: `1px solid ${item ? item.color : '#1e2a4a'}`,
                    background: item ? '#0f1021' : '#0f1021', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', cursor: item ? 'pointer' : 'default',
                    borderBottom: item ? `3px solid ${item.color}` : '1px solid #1e2a4a'
                  }}>
                    {item ? (
                      <>
                        <span style={{ fontSize: '20px' }}>🔫</span>
                        <span style={{ fontSize: '9px', color: item.color, fontWeight: 'bold', textAlign: 'center', padding: '0 2px' }}>{item.price}р</span>
                      </>
                    ) : (
                      <span style={{ color: '#333', fontSize: '20px' }}>+</span>
                    )}
                  </div>
                )
              })}
            </div>

            <button onClick={execute} disabled={selected.length !== MAX} style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              background: selected.length === MAX ? 'linear-gradient(135deg, #4b9de8, #1a6fb5)' : '#1e2a4a',
              color: selected.length === MAX ? 'white' : '#555',
              fontWeight: 'bold', fontSize: '16px', cursor: selected.length === MAX ? 'pointer' : 'not-allowed'
            }}>
              {selected.length === MAX ? '📋 Выполнить контракт' : `Выберите ещё ${MAX - selected.length} скинов`}
            </button>
          </div>
        )}

        {/* Инвентарь */}
        {!done && (
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#888' }}>🎒 Ваш инвентарь</h2>
            {inventory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎒</div>
                <p style={{ marginBottom: '12px' }}>Инвентарь пуст</p>
                <button onClick={() => router.push('/')} style={{ background: '#e84b6a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Открыть кейсы
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                {inventory.map((item: any) => {
                  const isSelected = !!selected.find(s => s.uid === item.uid)
                  const isFull = selected.length >= MAX && !isSelected
                  return (
                    <div key={item.uid} onClick={() => !isFull && toggle(item)} style={{
                      background: isSelected ? '#1a2a1a' : '#0f1021', borderRadius: '10px', padding: '12px',
                      textAlign: 'center', cursor: isFull ? 'not-allowed' : 'pointer',
                      border: `1px solid ${isSelected ? '#4caf50' : '#1e2a4a'}`,
                      borderBottom: `3px solid ${isSelected ? '#4caf50' : item.color}`,
                      opacity: isFull ? 0.4 : 1, transition: 'all 0.15s'
                    }}>
                      <div style={{ fontSize: '28px', marginBottom: '6px' }}>🔫</div>
                      <p style={{ color: isSelected ? '#4caf50' : item.color, fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>{item.name}</p>
                      <p style={{ color: '#e84b6a', fontSize: '12px', fontWeight: 'bold' }}>{item.price} руб</p>
                      {isSelected && <p style={{ color: '#4caf50', fontSize: '10px', marginTop: '4px' }}>✓ Выбран</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}