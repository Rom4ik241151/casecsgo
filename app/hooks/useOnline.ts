import { useEffect, useState } from 'react'

export function useOnline() {
  const [online, setOnline] = useState(0)

  useEffect(() => {
    const tabId = Math.random().toString(36).slice(2)
    
    const ping = () => {
      fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: tabId })
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