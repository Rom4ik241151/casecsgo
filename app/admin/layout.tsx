'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: '🏠 Главная', exact: true },
  { href: '/admin/items', label: '🔫 Предметы' },
  { href: '/admin/cases', label: '📦 Кейсы' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        body {
          background-image: none !important;
          background: #080b18 !important;
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#080b18', color: '#fff' }}>
        {/* Сайдбар / топбар */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(13,17,40,0.97)',
          borderBottom: '1px solid #1e2a4a',
          backdropFilter: 'blur(12px)',
          padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          height: 56,
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e84b6a', marginRight: '1rem' }}>
            Admin
          </span>
          {NAV.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : '#5a6a8a',
                  background: active ? '#1e2a4a' : 'none',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  border: active ? '1px solid #2e3a5a' : '1px solid transparent',
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Контент */}
        <div>{children}</div>
      </div>
    </>
  )
}