import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from './components/SessionProvider'
import AuthProvider from './components/AuthProvider'

export const metadata: Metadata = {
  title: 'OtakuCase',
  description: 'Открывай кейсы и выигрывай скины CS:GO',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body suppressHydrationWarning>
        <SessionProvider>
          <AuthProvider />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}