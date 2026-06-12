'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Item {
  id: string
  name: string
  image: string
  price: number
  steamUrl: string
}

const proxyImage = (url: string) =>
  `/api/image-proxy?url=${encodeURIComponent(url)}`

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([])
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchItems = async () => {
    const res = await fetch('/api/items')
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleAdd = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ошибка')
      } else {
        setSuccess(`Добавлен: ${data.name}`)
        setUrl('')
        fetchItems()
      }
    } catch {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Админ панель</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Ссылка Steam Market..."
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          {loading ? 'Загрузка...' : 'Добавить'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem'
      }}>
        {items.map(item => (
          <div key={item.id} style={{
            border: '1px solid #333',
            borderRadius: 8,
            padding: '0.5rem',
            textAlign: 'center'
          }}>
            <Image
              src={proxyImage(item.image)}
              alt={item.name}
              width={150}
              height={120}
              style={{ objectFit: 'contain', width: '100%' }}
              unoptimized
            />
            <p style={{ fontSize: '0.8rem', margin: '0.3rem 0' }}>{item.name}</p>
            <p style={{ fontWeight: 'bold' }}>{item.price} ₽</p>
          </div>
        ))}
      </div>
    </div>
  )
}