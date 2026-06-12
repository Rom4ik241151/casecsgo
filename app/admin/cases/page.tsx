'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Item {
  id: string
  name: string
  image: string
  price: number
  rarity?: string
  color?: string
}

interface CaseItem {
  id: string
  itemId: string
  dropRate: number
  item: Item
}

interface Case {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  items: CaseItem[]
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

const rarityColor = (r?: string) => RARITIES.find(x => x.value === r)?.color ?? '#888'

export default function AdminCasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [allItems, setAllItems] = useState<Item[]>([])
  const [mode, setMode] = useState<Mode>('list')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Поля кейса
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [imageUrl, setImageUrl] = useState('')

  // Предметы в кейсе (локально)
  const [selectedItems, setSelectedItems] = useState<{ itemId: string; dropRate: number }[]>([])

  const [itemSearch, setItemSearch] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchCases = async () => {
    const res = await fetch('/api/cases')
    const data = await res.json()
    setCases(Array.isArray(data) ? data : [])
  }

  const fetchItems = async () => {
    const res = await fetch('/api/items')
    const data = await res.json()
    setAllItems(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    fetchCases()
    fetchItems()
  }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice(0)
    setImageUrl('')
    setSelectedItems([])
    setItemSearch('')
    setSaveError('')
    setSaveSuccess('')
    setEditingId(null)
  }

  const handleEdit = (c: Case) => {
    setEditingId(c.id)
    setName(c.name)
    setDescription(c.description || '')
    setPrice(c.price)
    setImageUrl(c.image || '')
    setSelectedItems(c.items.map(ci => ({ itemId: ci.itemId, dropRate: ci.dropRate })))
    setSaveError('')
    setSaveSuccess('')
    setMode('edit')
  }

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const exists = prev.find(x => x.itemId === itemId)
      if (exists) return prev.filter(x => x.itemId !== itemId)
      return [...prev, { itemId, dropRate: 10 }]
    })
  }

  const updateDropRate = (itemId: string, rate: number) => {
    setSelectedItems(prev =>
      prev.map(x => x.itemId === itemId ? { ...x, dropRate: rate } : x)
    )
  }

  const handleSave = async () => {
    if (!name.trim()) { setSaveError('Укажите название кейса'); return }
    if (price <= 0) { setSaveError('Укажите цену'); return }
    setSaveLoading(true)
    setSaveError('')
    setSaveSuccess('')
    try {
      const body = { name, description, price, image: imageUrl, items: selectedItems }
      let res: Response
      if (editingId) {
        res = await fetch(`/api/cases/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error || 'Ошибка сохранения'); return }
      setSaveSuccess(editingId ? 'Кейс обновлён!' : 'Кейс создан!')
      fetchCases()
      setTimeout(() => { resetForm(); setMode('list') }, 1000)
    } catch {
      setSaveError('Ошибка сети')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/cases/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    fetchCases()
  }

  const filteredItems = allItems.filter(i =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase())
  )

  const totalDropRate = selectedItems.reduce((s, x) => s + x.dropRate, 0)

  // ── ФОРМА ──
  if (mode === 'create' || mode === 'edit') {
    return (
      <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', color: 'var(--color-text-primary)' }}>

        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { resetForm(); setMode('list') }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 14, padding: 0 }}
          >
            ← Назад
          </button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>
            {mode === 'edit' ? 'Редактировать кейс' : 'Новый кейс'}
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Превью */}
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12, padding: '1.5rem',
            display: 'flex', gap: '1.5rem', alignItems: 'center'
          }}>
            <div style={{
              width: 120, height: 120, borderRadius: 8,
              background: 'var(--color-background-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
              border: '0.5px solid var(--color-border-tertiary)'
            }}>
              {imageUrl ? (
                <Image
                  src={proxyImage(imageUrl)}
                  alt={name}
                  width={120}
                  height={120}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  unoptimized
                />
              ) : (
                <span style={{ fontSize: 40 }}>📦</span>
              )}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{name || 'Название кейса'}</p>
              {description && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>{description}</p>}
              <p style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, color: '#e94560' }}>{price || 0} ₽</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Предметов: {selectedItems.length}
              </p>
            </div>
          </div>

          {/* Основные поля */}
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12, padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Данные кейса</h2>

            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Название</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Лунная Сакура"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Описание (необязательно)</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Редкие скины ночного города..."
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Цена открытия (₽)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Ссылка на картинку кейса</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Выбор предметов */}
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12, padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                Предметы в кейсе ({selectedItems.length})
              </h2>
              {selectedItems.length > 0 && (
                <span style={{
                  fontSize: 12, color: totalDropRate === 100 ? '#4caf50' : '#e4ae39',
                  background: totalDropRate === 100 ? '#4caf5018' : '#e4ae3918',
                  padding: '4px 10px', borderRadius: 20,
                  border: `0.5px solid ${totalDropRate === 100 ? '#4caf5044' : '#e4ae3944'}`
                }}>
                  Сумма шансов: {totalDropRate.toFixed(1)}%
                </span>
              )}
            </div>

            {/* Выбранные предметы */}
            {selectedItems.length > 0 && (
              <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedItems.map(si => {
                  const item = allItems.find(i => i.id === si.itemId)
                  if (!item) return null
                  const color = item.color || rarityColor(item.rarity)
                  return (
                    <div key={si.itemId} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: 'var(--color-background-secondary)',
                      border: `0.5px solid ${color}44`,
                      borderRadius: 8, padding: '0.6rem 0.75rem',
                    }}>
                      <div style={{
                        width: 44, height: 34,
                        background: `rgba(0,0,0,0.3)`,
                        borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                        border: `1px solid ${color}55`,
                      }}>
                        <Image
                          src={proxyImage(item.image)}
                          alt={item.name}
                          width={44}
                          height={34}
                          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                          unoptimized
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color }}>{item.rarity} · {item.price} ₽</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Шанс %</label>
                        <input
                          type="number"
                          value={si.dropRate}
                          min={0.1}
                          max={100}
                          step={0.1}
                          onChange={e => updateDropRate(si.itemId, parseFloat(e.target.value) || 0)}
                          style={{
                            width: 64, padding: '4px 8px', fontSize: 13,
                            borderRadius: 6, border: '0.5px solid var(--color-border-tertiary)',
                            background: 'var(--color-background-primary)',
                            color: 'var(--color-text-primary)', textAlign: 'center'
                          }}
                        />
                        <button
                          onClick={() => toggleItem(si.itemId)}
                          style={{
                            background: 'none', border: '0.5px solid #eb4b4b44',
                            color: '#eb4b4b', borderRadius: 6, cursor: 'pointer',
                            padding: '4px 8px', fontSize: 13
                          }}
                        >✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Поиск по всем предметам */}
            <p style={{ margin: '0 0 0.5rem', fontSize: 13, color: 'var(--color-text-secondary)' }}>Добавить предметы из базы:</p>
            <input
              type="text"
              value={itemSearch}
              onChange={e => setItemSearch(e.target.value)}
              placeholder="Поиск по названию..."
              style={{ ...inputStyle, marginBottom: '0.75rem' }}
            />

            {allItems.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '1rem' }}>
                Предметов нет. Сначала добавь предметы в разделе «Предметы».
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '0.6rem',
                maxHeight: 340,
                overflowY: 'auto',
                paddingRight: 4
              }}>
                {filteredItems.map(item => {
                  const selected = !!selectedItems.find(x => x.itemId === item.id)
                  const color = item.color || rarityColor(item.rarity)
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      style={{
                        background: selected
                          ? `linear-gradient(135deg, rgba(75,105,255,0.15), rgba(75,105,255,0.05))`
                          : 'var(--color-background-secondary)',
                        border: selected
                          ? '1px solid #4b69ff88'
                          : `1px solid ${color}33`,
                        borderRadius: 10,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      }}
                    >
                      {selected && (
                        <div style={{
                          position: 'absolute', top: 6, right: 6,
                          background: '#4b69ff', color: '#fff',
                          borderRadius: '50%', width: 18, height: 18,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, zIndex: 2
                        }}>✓</div>
                      )}
                      <div style={{
                        background: 'rgba(0,0,0,0.25)',
                        height: 80,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 8,
                        borderBottom: `2px solid ${color}66`,
                      }}>
                        <Image
                          src={proxyImage(item.image)}
                          alt={item.name}
                          width={100}
                          height={72}
                          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                          unoptimized
                        />
                      </div>
                      <div style={{ padding: '0.5rem 0.6rem' }}>
                        <p style={{
                          margin: '0 0 2px', fontSize: 11, fontWeight: 600,
                          lineHeight: 1.3, color: 'var(--color-text-primary)',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color }}>{item.rarity}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#e94560' }}>{item.price} ₽</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Кнопки */}
          {saveError && <p style={{ color: '#eb4b4b', fontSize: 13, margin: 0 }}>{saveError}</p>}
          {saveSuccess && <p style={{ color: '#4caf50', fontSize: 13, margin: 0 }}>{saveSuccess}</p>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              style={{
                padding: '0.65rem 1.5rem', background: '#4b69ff',
                color: '#fff', border: 'none', borderRadius: 8,
                cursor: 'pointer', fontSize: 14
              }}
            >
              {saveLoading ? 'Сохраняю...' : editingId ? 'Сохранить изменения' : 'Создать кейс'}
            </button>
            <button
              onClick={() => { resetForm(); setMode('list') }}
              style={{
                padding: '0.65rem 1rem', background: 'none',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 8, cursor: 'pointer', fontSize: 14,
                color: 'var(--color-text-secondary)'
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── СПИСОК КЕЙСОВ ──
  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', color: 'var(--color-text-primary)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'
      }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>Кейсы ({cases.length})</h1>
        <button
          onClick={() => { resetForm(); setMode('create') }}
          style={{
            padding: '0.6rem 1.25rem', background: '#4b69ff',
            color: '#fff', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontSize: 14
          }}
        >
          + Создать кейс
        </button>
      </div>

      {cases.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-tertiary)' }}>
          Кейсов пока нет. Создай первый!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {cases.map(c => (
          <div
            key={c.id}
            style={{
              background: 'var(--color-background-primary)',
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div style={{
              background: 'var(--color-background-secondary)',
              height: 130,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 12,
              borderBottom: '1px solid var(--color-border-tertiary)',
            }}>
              {c.image ? (
                <Image
                  src={proxyImage(c.image)}
                  alt={c.name}
                  width={120}
                  height={110}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  unoptimized
                />
              ) : (
                <span style={{ fontSize: 52 }}>📦</span>
              )}
            </div>
            <div style={{ padding: '0.85rem' }}>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>{c.name}</p>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#e94560', fontWeight: 600 }}>{c.price} ₽</p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Предметов: {c.items?.length ?? 0}
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleEdit(c)}
                  style={{
                    flex: 1, padding: '0.4rem', fontSize: 12,
                    background: 'none',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 6, cursor: 'pointer',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  ✏️ Изменить
                </button>
                <button
                  onClick={() => setDeleteConfirm(c.id)}
                  style={{
                    padding: '0.4rem 0.6rem', fontSize: 12,
                    background: 'none',
                    border: '0.5px solid #eb4b4b44',
                    borderRadius: 6, cursor: 'pointer', color: '#eb4b4b'
                  }}
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
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: 'var(--color-background-primary)',
            borderRadius: 12, padding: '2rem', maxWidth: 320, width: '90%', textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 1.5rem', fontSize: 15 }}>Удалить этот кейс?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '0.6rem 1.25rem',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 8, cursor: 'pointer',
                  background: 'none', color: 'var(--color-text-primary)', fontSize: 14
                }}
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  padding: '0.6rem 1.25rem', background: '#eb4b4b',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  color: '#fff', fontSize: 14
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem',
  fontSize: 14,
  boxSizing: 'border-box',
  borderRadius: 8,
  border: '0.5px solid var(--color-border-tertiary)',
  background: 'var(--color-background-secondary)',
  color: 'var(--color-text-primary)',
}