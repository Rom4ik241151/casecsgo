import { useEffect, useState } from 'react'

// Уникальный ID только для этой вкладки
const TAB_ID = Math.random().toString(36).slice(2)

export function useOnline() {
  const [online, setOnline] = useState(0)

  useEffect(() => {
    const ping = () => {
      fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: TAB_ID })
      })
        .then(r => r.json())
        .then(data => setOnline(data.online))
        .catch(() => {})
    }

    ping()
    const interval = setInterval(ping, 10000)
    return () => clearInterval(interval)
  }, [])

  return online
}