import type { Metadata } from 'next'
import './globals.css'

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
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}