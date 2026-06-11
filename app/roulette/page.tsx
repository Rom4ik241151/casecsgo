'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

const SKINS = [
  { id: 1, name: 'Glock | Fire Serpent', price: 200, color: '#4b9de8', rarity: 'Restricted' },
  { id: 2, name: 'USP-S | Orion', price: 400, color: '#8847ff', rarity: 'Classified' },
  { id: 3, name: 'AK-47 | Redline', price: 800, color: '#e84b6a', rarity: 'Classified' },
  { id: 4, name: 'Desert Eagle | Blaze', price: 1500, color: '#f5a623', rarity: 'Covert' },
  { id: 5, name: 'AWP | Asiimov', price: 3000, color: '#f5a623', rarity: 'Covert' },
  { id: 6, name: 'M4A4 | Howl', price: 7000, color: '#eb4b4b', rarity: 'Contraband' },
  { id: 7, name: 'Karambit | Fade', price: 12000, color: '#e4ae39', rarity: 'Covert' },
]

const TICKET_PRICES = [50, 100, 250, 500]

const BET_COLORS = [
  { key: 'red', label: 'Красное', color: '#e84b6a', mult: 2 },
  { key: 'black', label: 'Чёрное', color: '#333', mult: 2 },
  { key: 'green', label: 'Зелёное', color: '#4caf50', mult: 14 },
]

const WHEEL = [
  'green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
  'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red',
  'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
  'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
]

export default function RoulettePage() {
  const router = useRouter()
  const { balance, decreaseBalance, addBalance } = useStore()
  const [betColor, setBetColor] = useState<string | null>(null)
  const [betAmount, setBetAmount] = useState(50)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [won, setWon] = useState<number | null>(null)
  const [offset, setOffset] = useState(0)
  const [history, setHistory] = useState<string[]>([])

  const ITEM_W = 80
  const VISIBLE = 9
  const CENTER = Math.floor(VISIBLE / 2)

  const spin = () => {
    if (!betColor || spinning || balance < betAmount) return
    decreaseBalance(betAmount)
    setSpinning(true)
    setResult(null)
    setWon(null)

    const resultIdx = Math.floor(Math.random() * WHEEL.length)
    const resultColor = WHEEL[resultIdx]
    const totalItems = WHEEL.length * 10
    const landIdx = totalItems - WHEEL.length + resultIdx
    const newOffset = -(landIdx - CENTER) * ITEM_W + Math.random() * 20 - 10

    setOffset(newOffset)

    setTimeout(() => {
      setResult(resultColor)
      setHistory(prev => [resultColor, ...prev].slice(0, 12))
      const betInfo = BET_COLORS.find(b => b.key === betColor)
      if (resultColor === betColor && betInfo) {
        const winAmount = betAmount * betInfo.mult
        addBalance(winAmount)
        setWon(winAmount)
      } else {
        setWon(0)
      }
      setSpinning(false)
    }, 4000)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0a0a1a', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>CaseCSGO</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([['/', '🎁 Кейсы'], ['/upgrade', '⚡ Апгрейд'], ['/roulette', '🎰 Рулетка'], ['/contracts', '📋 Контракты']] as [string, string][]).map(([href, label]) => (
            <span key={href} onClick={() => router.push(href)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              background: href === '/roulette' ? '#8847ff' : 'transparent',
              color: href === '/roulette' ? 'white' : '#888',
              border: href === '/roulette' ? 'none' : '1px solid #1e2a4a'
            }}>{label}</span>
          ))}
        </div>
        <span style={{ color: '#e84b6a', fontWeight: 'bold' }}>{balance} руб</span>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>🎰 Рулетка</h1>
        <p style={{ color: '#555', marginBottom: '32px', fontSize: '14px' }}>Поставь на цвет и испытай удачу</p>

        {/* История */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {history.map((c, i) => (
            <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c === 'red' ? '#e84b6a' : c === 'black' ? '#444' : '#4caf50', border: '2px solid #1e2a4a' }} />
          ))}
          {history.length === 0 && <span style={{ color: '#444', fontSize: '13px' }}>История появится после первого спина</span>}
        </div>

        {/* Лента */}
        <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          {/* Указатель */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '3px', height: '100%', background: 'white', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ overflow: 'hidden', width: `${VISIBLE * ITEM_W}px`, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              transform: `translateX(${offset}px)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none',
              willChange: 'transform',
            }}>
              {Array.from({ length: 10 }).flatMap(() => WHEEL).map((color, i) => (
                <div key={i} style={{
                  width: `${ITEM_W}px`, height: '80px', flexShrink: 0,
                  background: color === 'red' ? '#e84b6a' : color === 'black' ? '#2a2a3a' : '#4caf50',
                  border: '2px solid #0f1021', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {color === 'green' ? '0' : color === 'red' ? '🔴' : '⚫'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Результат */}
        {won !== null && (
          <div style={{ textAlign: 'center', marginBottom: '24px', padding: '16px', borderRadius: '12px', background: won > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(232,75,106,0.1)', border: `1px solid ${won > 0 ? '#4caf50' : '#e84b6a'}` }}>
            {won > 0
              ? <p style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '20px' }}>🎉 Выигрыш: +{won} руб!</p>
              : <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px' }}>😔 Не повезло! Ставка проиграна.</p>
            }
          </div>
        )}

        {/* Ставка */}
        <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a', marginBottom: '16px' }}>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px', fontWeight: 'bold' }}>СУММА СТАВКИ</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {TICKET_PRICES.map(p => (
              <button key={p} onClick={() => setBetAmount(p)} style={{
                padding: '8px 20px', borderRadius: '8px', border: `1px solid ${betAmount === p ? '#e84b6a' : '#1e2a4a'}`,
                background: betAmount === p ? 'rgba(232,75,106,0.2)' : '#0f1021',
                color: betAmount === p ? '#e84b6a' : '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
              }}>{p} руб</button>
            ))}
            <input type="number" value={betAmount} onChange={e => setBetAmount(Math.max(1, Number(e.target.value)))}
              style={{ width: '100px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e2a4a', background: '#0f1021', color: 'white', fontSize: '14px' }} />
          </div>

          <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px', fontWeight: 'bold' }}>ВЫБЕРИТЕ ЦВЕТ</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {BET_COLORS.map(b => (
              <button key={b.key} onClick={() => setBetColor(b.key)} style={{
                padding: '16px', borderRadius: '10px', border: `2px solid ${betColor === b.key ? b.color : '#1e2a4a'}`,
                background: betColor === b.key ? `${b.color}22` : '#0f1021',
                color: betColor === b.key ? b.color : '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px'
              }}>
                {b.label}
                <span style={{ display: 'block', fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>x{b.mult}</span>
              </button>
            ))}
          </div>

          <button onClick={spin} disabled={!betColor || spinning || balance < betAmount} style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            background: (!betColor || spinning || balance < betAmount) ? '#1e2a4a' : 'linear-gradient(135deg, #e84b6a, #c0392b)',
            color: (!betColor || spinning || balance < betAmount) ? '#555' : 'white',
            fontWeight: 'bold', fontSize: '16px', cursor: (!betColor || spinning || balance < betAmount) ? 'not-allowed' : 'pointer'
          }}>
            {spinning ? 'Крутится...' : `🎰 Крутить (${betAmount} руб)`}
          </button>
        </div>
      </div>
    </main>
  )
}