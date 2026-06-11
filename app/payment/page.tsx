'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

const PRESETS = [100, 250, 500, 1000, 2500, 5000]

export default function PaymentPage() {
  const router = useRouter()
  const { addBalance } = useStore()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('card')
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')

  function handlePay() {
    if (!amount || Number(amount) < 50) return
    setStep('processing')
    setTimeout(() => {
      addBalance(Number(amount))
      setStep('success')
    }, 2000)
  }

  if (step === 'processing') return (
    <main style={{ minHeight: '100vh', background: '#0f1021', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px', animation: 'spin 1s linear infinite' }}>⏳</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Обработка платежа...</h2>
        <p style={{ color: '#888' }}>Пожалуйста, подождите</p>
      </div>
    </main>
  )

  if (step === 'success') return (
    <main style={{ minHeight: '100vh', background: '#0f1021', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ textAlign: 'center', background: '#16213e', borderRadius: '20px', padding: '48px', border: '1px solid #1e2a4a', maxWidth: '400px' }}>
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#4caf50' }}>Успешно!</h2>
        <p style={{ color: '#888', marginBottom: '8px' }}>Баланс пополнен на</p>
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#e84b6a', marginBottom: '24px' }}>{Number(amount).toLocaleString()} ₽</p>
        <button onClick={() => router.push('/')} style={{
          background: '#e84b6a', color: 'white', border: 'none',
          padding: '14px 40px', borderRadius: '12px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '16px', width: '100%'
        }}>На главную</button>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white' }}>
      <nav style={{ background: '#16213e', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>OtakuCase</span>
        <span style={{ color: '#555' }}>→</span>
        <span style={{ color: '#888', fontSize: '14px' }}>Пополнение баланса</span>
      </nav>

      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#16213e', borderRadius: '20px', padding: '32px', border: '1px solid #1e2a4a' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>💳 Пополнить баланс</h1>

          {/* Быстрые суммы */}
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Выберите сумму:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {PRESETS.map(p => (
              <button key={p} onClick={() => setAmount(String(p))} style={{
                background: amount === String(p) ? '#e84b6a' : 'rgba(255,255,255,0.05)',
                color: amount === String(p) ? 'white' : '#aaa',
                border: amount === String(p) ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '15px', transition: 'all 0.2s'
              }}>{p.toLocaleString()} ₽</button>
            ))}
          </div>

          {/* Своя сумма */}
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Или введите сумму:</p>
          <input
            type="number"
            placeholder="Минимум 50 ₽"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: '100%', background: '#0f1021', border: '1px solid #1e2a4a',
              color: 'white', padding: '12px 16px', borderRadius: '10px',
              fontSize: '16px', marginBottom: '24px', boxSizing: 'border-box'
            }}
          />

          {/* Метод оплаты */}
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Способ оплаты:</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            {[
              { id: 'card', label: '💳 Карта' },
              { id: 'sbp', label: '📱 СБП' },
              { id: 'crypto', label: '🪙 Крипта' },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{
                flex: 1, background: method === m.id ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.05)',
                color: method === m.id ? '#e84b6a' : '#aaa',
                border: method === m.id ? '1px solid #e84b6a' : '1px solid rgba(255,255,255,0.1)',
                padding: '10px', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s'
              }}>{m.label}</button>
            ))}
          </div>

          {/* Бонус */}
          {Number(amount) >= 1000 && (
            <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🎁</span>
              <p style={{ color: '#4caf50', fontSize: '13px', fontWeight: 'bold' }}>+{Math.round(Number(amount) * 0.05).toLocaleString()} ₽ бонус за пополнение от 1000 ₽!</p>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={!amount || Number(amount) < 50}
            style={{
              width: '100%', background: !amount || Number(amount) < 50 ? '#333' : '#e84b6a',
              color: 'white', border: 'none', padding: '16px',
              borderRadius: '12px', cursor: !amount || Number(amount) < 50 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold', fontSize: '18px', transition: 'all 0.2s'
            }}
          >
            Оплатить {amount ? `${Number(amount).toLocaleString()} ₽` : ''}
          </button>

          <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            🔒 Тестовый режим — реальные деньги не списываются
          </p>
        </div>
      </div>
    </main>
  )
}