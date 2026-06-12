'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/admin', label: '🏠 Главная', exact: true },
  { href: '/admin/items', label: '🔫 Предметы' },
  { href: '/admin/cases', label: '📦 Кейсы' },
]

const ADMIN_PASSWORD = 'твой_пароль_здесь' // ← поменяй

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [auth, setAuth] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAuth(true)
  }, [])

  const handleLogin = () => {
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      setAuth(true)
    } else {
      setError('Неверный пароль')
    }
  }

  if (!auth) return (
    <div style={{
      minHeight: '100vh', background: '#080b18', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(13,17,40,0.97)', border: '1px solid #1e2a4a',
        borderRadius: 12, padding: '2rem', width: 320, textAlign: 'center'
      }}>
        <p style={{ color: '#e84b6a', fontWeight: 700, fontSize: 18, margin: '0 0 1.5rem' }}>
          🔒 Admin
        </p>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Пароль"
          style={{
            width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box',
            borderRadius: 8, border: '1px solid #1e2a4a', background: '#0d1128',
            color: '#fff', marginBottom: '0.75rem'
          }}
        />
        {error && <p style={{ color: '#eb4b4b', fontSize: 13, margin: '0 0 0.75rem' }}>{error}</p>}
        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: '0.65rem', background: '#4b69ff',
            color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14
          }}
        >
          Войти
        </button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`body { background-image: none !important; background: #080b18 !important; }`}</style>
      <div style={{ minHeight: '100vh', background: '#080b18', color: '#fff' }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(13,17,40,0.97)', borderBottom: '1px solid #1e2a4a',
          backdropFilter: 'blur(12px)', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem', height: 56,
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e84b6a', marginRight: '1rem' }}>Admin</span>
          {NAV.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                padding: '0.4rem 0.9rem', borderRadius: 8, fontSize: 14,
                fontWeight: active ? 600 : 400, color: active ? '#fff' : '#5a6a8a',
                background: active ? '#1e2a4a' : 'none', textDecoration: 'none',
                border: active ? '1px solid #2e3a5a' : '1px solid transparent',
              }}>
                {label}
              </Link>
            )
          })}
          <button
            onClick={() => { sessionStorage.removeItem('admin_auth'); setAuth(false) }}
            style={{
              marginLeft: 'auto', padding: '0.4rem 0.9rem', background: 'none',
              border: '1px solid #2e3a5a', borderRadius: 8, color: '#5a6a8a',
              cursor: 'pointer', fontSize: 13
            }}
          >
            Выйти
          </button>
        </div>
        <div>{children}</div>
      </div>
    </>
  )
}