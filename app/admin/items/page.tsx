'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Item {
  id: string
  name: string
  image: string
  price: number
  rarity?: string
  steamUrl?: string
  marketHash?: string
}

type Mode = 'list' | 'create' | 'edit'

const proxyImage = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`

const RARITIES = [
  { label: 'Consumer (серый)', value: 'Consumer', color: '#b0b0b0' },
  { label: 'Industrial (голубой)', value: 'Industrial', color: '#5e98d9' },
  { label: 'Mil-Spec (синий)', value: 'Mil-Spec', color: '#4b69ff' },
  { label: 'Restricted (фиолетовый)', value: 'Restricted', color: '#8847ff' },
  { label: 'Classified (розовый)', value: 'Classified', color: '#d32ce6' },
  { label: 'Covert (красный)', value: 'Covert', color: '#eb4b4b' },
  { label: 'Contraband (золотой)', value: 'Contraband', color: '#e4ae39' },
]

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [mode, setMode] = useState<Mode>('list')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Шаг 1 — Steam URL
  const [steamUrl, setSteamUrl] = useState('')
  const [parseLoading, setParseLoading] = useState(false)
  const [parseError, setParseError] = useState('')

  // Шаг 2 — поля предмета
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [rarity, setRarity] = useState('Mil-Spec')
  const [marketHash, setMarketHash] = useState('')
  const [step, setStep] = useState<1 | 2>(1)

  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchItems = async () => {
    const res = await fetch('/api/items')
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
  }

  useEffect(() => { fetchItems() }, [])

  const resetForm = () => {
    setSteamUrl('')
    setName('')
    setPrice(0)
    setImageUrl('')
    setRarity('Mil-Spec')
    setMarketHash('')
    setStep(1)
    setParseError('')
    setSaveError('')
    setSaveSuccess('')
    setEditingId(null)
  }

  const handleParseUrl = async () => {
    if (!steamUrl.trim()) {
      setParseError('Вставьте ссылку на предмет в Steam Маркете')
      return
    }
    setParseLoading(true)
    setParseError('')
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'parse', url: steamUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setParseError(data.error || 'Не удалось распознать ссылку')
        return
      }
      setName(data.name || '')
      setPrice(data.price || 0)
      setMarketHash(data.marketHash || '')
      setStep(2)
    } catch {
      setParseError('Ошибка сети')
    } finally {
      setParseLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { setSaveError('Укажите название'); return }
    if (!imageUrl.trim()) { setSaveError('Вставьте ссылку на картинку'); return }
    setSaveLoading(true)
    setSaveError('')
    setSaveSuccess('')
    try {
      let res: Response
      if (editingId) {
        res = await fetch(`/api/items/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, image: imageUrl, price, rarity }),
        })
      } else {
        res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'save', url: steamUrl, name, image: imageUrl, price, marketHash, rarity }),
        })
      }
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error || 'Ошибка сохранения')
        return
      }
      setSaveSuccess(editingId ? 'Предмет обновлён!' : 'Предмет добавлен!')
      fetchItems()
      setTimeout(() => { resetForm(); setMode('list') }, 1000)
    } catch {
      setSaveError('Ошибка сети')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setName(item.name)
    setPrice(item.price)
    setImageUrl(item.image)
    setRarity(item.rarity || 'Mil-Spec')
    setSteamUrl(item.steamUrl || '')
    setMarketHash(item.marketHash || '')
    setStep(2)
    setMode('edit')
    setSaveError('')
    setSaveSuccess('')
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    fetchItems()
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const rarityColor = (r?: string) =>
    RARITIES.find(x => x.value === r)?.color ?? '#888'

  // ── ФОРМА ──
  if (mode === 'create' || mode === 'edit') {
    return (
      <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto', color: 'var(--color-text-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { resetForm(); setMode('list') }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 14, padding: 0 }}
          >
            ← Назад
          </button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>
            {mode === 'edit' ? 'Редактировать предмет' : 'Новый предмет'}
          </h1>
        </div>

        {/* Индикатор шагов (только при создании) */}
        {mode === 'create' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: step >= s ? '#4b69ff' : 'var(--color-border-tertiary)'
              }} />
            ))}
          </div>
        )}

        {/* ШАГ 1 — Steam URL */}
        {mode === 'create' && step === 1 && (
          <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: 16, fontWeight: 500 }}>Шаг 1 — Ссылка со Steam Маркета</h2>
            <p style={{ margin: '0 0 1rem', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Открой предмет на steamcommunity.com/market и скопируй ссылку
            </p>
            <input
              type="text"
              value={steamUrl}
              onChange={e => setSteamUrl(e.target.value)}
              placeholder="https://steamcommunity.com/market/listings/730/..."
              style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}
            />
            {parseError && <p style={{ color: '#eb4b4b', fontSize: 13, margin: '0.5rem 0 0' }}>{parseError}</p>}
            <button
              onClick={handleParseUrl}
              disabled={parseLoading}
              style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#4b69ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
            >
              {parseLoading ? 'Загружаю...' : 'Получить данные →'}
            </button>
          </div>
        )}

        {/* ШАГ 2 — Конструктор */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Превью */}
            <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{
                width: 160, height: 120, borderRadius: 8, background: 'var(--color-background-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
                borderBottom: `3px solid ${rarityColor(rarity)}`
              }}>
                {imageUrl ? (
                  <Image
                    src={proxyImage(imageUrl)}
                    alt={name}
                    width={160}
                    height={120}
                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                    unoptimized
                  />
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: 8 }}>
                    Картинка появится здесь
                  </span>
                )}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>{name || 'Название предмета'}</p>
                <p style={{ margin: '0.25rem 0', fontSize: 13, color: rarityColor(rarity) }}>{rarity}</p>
                <p style={{ margin: '0.25rem 0', fontSize: 18, fontWeight: 500 }}>{price} ₽</p>
              </div>
            </div>

            {/* Поля */}
            <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                {mode === 'edit' ? 'Редактировать данные' : 'Шаг 2 — Данные предмета'}
              </h2>

              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Название</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  Ссылка на картинку
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://community.cloudflare.steamstatic.com/economy/image/..."
                  style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}
                />
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
                  На странице предмета в Steam: правая кнопка на картинке → «Копировать адрес изображения»
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Цена (₽)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Редкость</label>
                  <select
                    value={rarity}
                    onChange={e => setRarity(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}
                  >
                    {RARITIES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {saveError && <p style={{ color: '#eb4b4b', fontSize: 13, margin: 0 }}>{saveError}</p>}
              {saveSuccess && <p style={{ color: '#4caf50', fontSize: 13, margin: 0 }}>{saveSuccess}</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  style={{ padding: '0.65rem 1.5rem', background: '#4b69ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
                >
                  {saveLoading ? 'Сохраняю...' : editingId ? 'Сохранить изменения' : 'Добавить предмет'}
                </button>
                {mode === 'create' && (
                  <button
                    onClick={() => setStep(1)}
                    style={{ padding: '0.65rem 1rem', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)' }}
                  >
                    ← Назад
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── СПИСОК ──
  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', color: 'var(--color-text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>Предметы ({items.length})</h1>
        <button
          onClick={() => { resetForm(); setMode('create') }}
          style={{ padding: '0.6rem 1.25rem', background: '#4b69ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
        >
          + Добавить предмет
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Поиск по названию..."
        style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}
      />

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-tertiary)' }}>
          {items.length === 0 ? 'Предметов пока нет. Добавь первый!' : 'Ничего не найдено'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {filtered.map(item => (
          <div
            key={item.id}
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 12,
              overflow: 'hidden',
              borderBottom: `3px solid ${rarityColor(item.rarity)}`,
            }}
          >
            <div style={{ background: 'var(--color-background-secondary)', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
              <Image
                src={proxyImage(item.image)}
                alt={item.name}
                width={160}
                height={110}
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                unoptimized
              />
            </div>
            <div style={{ padding: '0.75rem' }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.name}
              </p>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: rarityColor(item.rarity) }}>{item.rarity}</p>
              <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 500 }}>{item.price} ₽</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleEdit(item)}
                  style={{ flex: 1, padding: '0.4rem', fontSize: 12, background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  ✏️ Изменить
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  style={{ padding: '0.4rem 0.6rem', fontSize: 12, background: 'none', border: '0.5px solid #eb4b4b44', borderRadius: 6, cursor: 'pointer', color: '#eb4b4b' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Подтверждение удаления */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--color-background-primary)', borderRadius: 12, padding: '2rem', maxWidth: 320, width: '90%', textAlign: 'center' }}>
            <p style={{ margin: '0 0 1.5rem', fontSize: 15 }}>Удалить этот предмет? Он также удалится из всех кейсов.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '0.6rem 1.25rem', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, cursor: 'pointer', background: 'none', color: 'var(--color-text-primary)', fontSize: 14 }}>
                Отмена
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: '0.6rem 1.25rem', background: '#eb4b4b', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 14 }}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}