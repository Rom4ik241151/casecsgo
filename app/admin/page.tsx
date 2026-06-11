'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

const ADMIN_PASSWORD = 'admin123'

export default function AdminPage() {
  const router = useRouter()
  const { balance, addBalance, decreaseBalance } = useStore()
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [activeTab, setActiveTab] = useState('balance')

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') setAuth(true)
  }, [])

  function login() {
    if (password === ADMIN_PASSWORD) {
      setAuth(true)
      localStorage.setItem('admin_auth', 'true')
    } else {
      setError('Неверный пароль')
    }
  }

  function logout() {
    setAuth(false)
    localStorage.removeItem('admin_auth')
  }

  if (!auth) return (
    <main style={{ minHeight: '100vh', background: '#0f1021', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#16213e', borderRadius: '16px', padding: '40px', width: '360px', border: '1px solid #1e2a4a' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>🔐 Админ-панель</h1>
        <p style={{ color: '#555', textAlign: 'center', marginBottom: '24px', fontSize: '13px' }}>OtakuCase</p>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', background: '#0f1021', border: '1px solid #1e2a4a', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: '#e84b6a', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
        <button onClick={login} style={{ width: '100%', background: '#e84b6a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
          Войти
        </button>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white' }}>
      <nav style={{ background: '#16213e', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '18px' }}>🔐 Админ-панель</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: '13px' }}>Баланс: <span style={{ color: '#e84b6a', fontWeight: 'bold' }}>{balance} ₽</span></span>
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '1px solid #1e2a4a', color: '#888', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>На сайт</button>
          <button onClick={logout} style={{ background: '#e84b6a', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Выйти</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Табы */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[['balance', '💰 Баланс'], ['stats', '📊 Статистика']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              background: activeTab === id ? '#e84b6a' : '#16213e',
              color: 'white', border: '1px solid #1e2a4a',
              padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
            }}>{label}</button>
          ))}
        </div>

        {activeTab === 'balance' && (
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>💰 Управление балансом</h2>
            <p style={{ color: '#888', marginBottom: '16px' }}>Текущий баланс: <span style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px' }}>{balance} ₽</span></p>
            
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Быстрое пополнение:</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[100, 500, 1000, 5000, 10000].map(amount => (
                <button key={amount} onClick={() => addBalance(amount)} style={{
                  background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)',
                  color: '#4caf50', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                }}>+{amount} ₽</button>
              ))}
            </div>

            <p style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Списать:</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[100, 500, 1000].map(amount => (
                <button key={amount} onClick={() => decreaseBalance(amount)} style={{
                  background: 'rgba(232,75,106,0.15)', border: '1px solid rgba(232,75,106,0.3)',
                  color: '#e84b6a', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                }}>-{amount} ₽</button>
              ))}
            </div>

            <p style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Произвольная сумма:</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                placeholder="Сумма"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                style={{ background: '#0f1021', border: '1px solid #1e2a4a', color: 'white', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', width: '160px' }}
              />
              <button onClick={() => { addBalance(Number(customAmount)); setCustomAmount('') }} style={{
                background: '#4caf50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}>Пополнить</button>
              <button onClick={() => { decreaseBalance(Number(customAmount)); setCustomAmount('') }} style={{
                background: '#e84b6a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}>Списать</button>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>📊 Статистика сайта</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Текущий баланс', value: `${balance} ₽`, color: '#e84b6a' },
                { label: 'Статус', value: 'Онлайн', color: '#4caf50' },
                { label: 'Версия', value: 'v1.0.0', color: '#8847ff' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#0f1021', borderRadius: '12px', padding: '16px', border: '1px solid #1e2a4a' }}>
                  <p style={{ color: '#555', fontSize: '12px', marginBottom: '6px' }}>{stat.label}</p>
                  <p style={{ color: stat.color, fontWeight: 'bold', fontSize: '18px' }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}