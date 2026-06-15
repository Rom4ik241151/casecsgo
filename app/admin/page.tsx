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
  const WEAPONS = [
  'Все', 'AK-47', 'M4A4', 'M4A1-S', 'AWP', 'Desert Eagle', 'USP-S', 'Glock-18',
  'P250', 'Five-SeveN', 'Tec-9', 'CZ75-Auto', 'P2000', 'Dual Berettas', 'R8 Revolver',
  'MP7', 'MP9', 'MAC-10', 'PP-Bizon', 'P90', 'UMP-45', 'MP5-SD', 'FAMAS', 'Galil AR',
  'AUG', 'SG 553', 'G3SG1', 'SCAR-20', 'SSG 08', 'Nova', 'MAG-7', 'Sawed-Off',
  'XM1014', 'M249', 'Negev', 'Нож',
]
const [selectedWeapon, setSelectedWeapon] = useState('Все')
const [rarityLoading, setRarityLoading] = useState(false)
const [rarityResult, setRarityResult] = useState('')

const updateRarities = async () => {
  setRarityLoading(true)
  setRarityResult('')
  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'update-rarities', weapon: selectedWeapon, batchSize: 9999 }),
    })
    const data = await res.json()
    setRarityResult(`✅ Обновлено: ${data.updated}`)
  } catch {
    setRarityResult('❌ Ошибка')
  } finally {
    setRarityLoading(false)
  }
}

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
      const parseRes = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'parse', url }),
      })
      const parsed = await parseRes.json()
      if (!parseRes.ok) { setError(parsed.error || 'Ошибка парсинга'); return }

      const saveRes = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'save',
          url: parsed.steamUrl,
          name: parsed.name,
          image: parsed.image,
          price: parsed.price,
          marketHash: parsed.marketHash,
          rarity: parsed.rarity,
          statTrak: false,
          condition: 'FT',
        }),
      })
      const saved = await saveRes.json()
      if (!saveRes.ok) { setError(saved.error || 'Ошибка сохранения'); return }

      setSuccess(`Добавлен: ${saved.name} — ${saved.price} ₽`)
      setUrl('')
      fetchItems()
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
      <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #333', borderRadius: 8 }}>
  <h2 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Обновить редкости по оружию</h2>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
    {WEAPONS.map(w => (
      <button key={w} onClick={() => setSelectedWeapon(w)} style={{
        padding: '0.25rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer',
        background: selectedWeapon === w ? '#4b69ff' : '#222',
        color: '#fff', border: '1px solid #444', borderRadius: 6,
      }}>{w}</button>
    ))}
  </div>
  <button onClick={updateRarities} disabled={rarityLoading} style={{
    padding: '0.5rem 1.25rem', cursor: 'pointer', background: '#e94560',
    color: '#fff', border: 'none', borderRadius: 6,
  }}>
    {rarityLoading ? 'Обновляю...' : `Обновить: ${selectedWeapon}`}
  </button>
  {rarityResult && <p style={{ marginTop: '0.5rem', color: 'green' }}>{rarityResult}</p>}
</div>

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