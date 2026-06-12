'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PRESETS = [100, 250, 500, 1000, 2500, 5000]
const SBP_PHONE = '89885087355'
const SBP_BANK = 'Сбербанк'

export default function PaymentPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'form' | 'pending'>('form')
  const [copied, setCopied] = useState(false)

  function handlePay() {
    if (!amount || Number(amount) < 50) return
    setStep('pending')
  }

  function copyPhone() {
    navigator.clipboard.writeText(SBP_PHONE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === 'pending') return (
    <main style={{ minHeight: '100vh', background: '#0f1021', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ background: '#16213e', borderRadius: '20px', padding: '40px', border: '1px solid #1e2a4a', maxWidth: '440px', width: '90%', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📱</div>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Переведите {Number(amount).toLocaleString()} ₽</h2>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>через СБП на номер</p>

        <div style={{ background: '#0f1021', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #1e2a4a' }}>
          <p style={{ color: '#555', fontSize: '12px', marginBottom: '6px' }}>Номер телефона ({SBP_BANK})</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '12px', color: 'white' }}>{SBP_PHONE}</p>
          <button onClick={copyPhone} style={{
            background: copied ? '#4caf50' : 'rgba(233,69,96,0.15)',
            color: copied ? 'white' : '#e84b6a',
            border: `1px solid ${copied ? '#4caf50' : 'rgba(233,69,96,0.3)'}`,
            padding: '8px 24px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s'
          }}>
            {copied ? '✓ Скопировано' : 'Скопировать номер'}
          </button>
        </div>

        <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '10px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ color: '#f5a623', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>⚠️ Инструкция</p>
          <p style={{ color: '#aaa', fontSize: '12px', lineHeight: '1.6' }}>
            1. Откройте приложение Сбербанк<br/>
            2. Переведите <b style={{ color: 'white' }}>{Number(amount).toLocaleString()} ₽</b> на номер выше<br/>
            3. В комментарии укажите свой никнейм<br/>
            4. После перевода нажмите кнопку ниже
          </p>
        </div>

        <button onClick={() => router.push('/profile')} style={{
          width: '100%', background: '#e84b6a', color: 'white', border: 'none',
          padding: '14px', borderRadius: '12px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '16px', marginBottom: '12px'
        }}>
          Я оплатил — вернуться в профиль
        </button>
        <button onClick={() => setStep('form')} style={{
          width: '100%', background: 'none', color: '#555', border: '1px solid #1e2a4a',
          padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px'
        }}>
          ← Назад
        </button>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white' }}>
      <nav style={{ background: '#16213e', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>CaseCSGO</span>
        <span style={{ color: '#555' }}>→</span>
        <span style={{ color: '#888', fontSize: '14px' }}>Пополнение баланса</span>
      </nav>

      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#16213e', borderRadius: '20px', padding: '32px', border: '1px solid #1e2a4a' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>💳 Пополнить баланс</h1>

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

          <div style={{ background: 'rgba(75,105,255,0.1)', border: '1px solid rgba(75,105,255,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '28px' }}>📱</span>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>СБП — Сбербанк</p>
              <p style={{ color: '#888', fontSize: '12px' }}>Перевод через СБП на номер {SBP_PHONE}</p>
            </div>
          </div>

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
              width: '100%',
              background: !amount || Number(amount) < 50 ? '#333' : 'linear-gradient(135deg, #e84b6a, #8847ff)',
              color: 'white', border: 'none', padding: '16px',
              borderRadius: '12px', cursor: !amount || Number(amount) < 50 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold', fontSize: '18px', transition: 'all 0.2s'
            }}
          >
            Перейти к оплате {amount ? `${Number(amount).toLocaleString()} ₽` : ''}
          </button>
        </div>
      </div>
    </main>
  )
}