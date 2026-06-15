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
  statTrak?: boolean
  condition?: string
}

type Mode = 'list' | 'create' | 'edit' | 'bulk' | 'rarity'

const proxyImage = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`

const RARITIES = [
  { label: 'Ширпотреб',    value: 'Consumer',   color: '#b0b0b0' },
  { label: 'Промышленное', value: 'Industrial',  color: '#5e98d9' },
  { label: 'Армейское',    value: 'Mil-Spec',    color: '#4b69ff' },
  { label: 'Запрещённое',  value: 'Restricted',  color: '#8847ff' },
  { label: 'Засекреченное',value: 'Classified',  color: '#d32ce6' },
  { label: 'Тайное',       value: 'Covert',      color: '#eb4b4b' },
  { label: 'Контрабанда',  value: 'Contraband',  color: '#e4ae39' },
]
const CONDITIONS = [
  { label: 'Прямо с завода',           value: 'FN' },
  { label: 'Немного поношенное',        value: 'MW' },
  { label: 'После полевых испытаний',   value: 'FT' },
  { label: 'Поношенное',               value: 'WW' },
  { label: 'Закалённое в боях',         value: 'BS' },
]
const WEAPON_TYPES = [
  'Все', 'AK-47', 'M4A4', 'M4A1-S', 'AWP', 'Desert Eagle', 'USP-S', 'Glock-18',
  'P250', 'Five-SeveN', 'Tec-9', 'CZ75-Auto', 'P2000', 'Dual Berettas', 'R8 Revolver',
  'MP7', 'MP9', 'MAC-10', 'PP-Bizon', 'P90', 'UMP-45', 'MP5-SD',
  'FAMAS', 'Galil AR', 'AUG', 'SG 553',
  'G3SG1', 'SCAR-20', 'SSG 08',
  'Nova', 'MAG-7', 'Sawed-Off', 'XM1014',
  'M249', 'Negev', 'Нож',
]
export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [mode, setMode] = useState<Mode>('list')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [steamUrl, setSteamUrl] = useState('')
  const [parseLoading, setParseLoading] = useState(false)
  const [parseError, setParseError] = useState('')

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [rarity, setRarity] = useState('Mil-Spec')
  const [statTrak, setStatTrak] = useState(false)
  const [condition, setCondition] = useState('FT')
  const [marketHash, setMarketHash] = useState('')
  const [step, setStep] = useState<1 | 2>(1)

  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [updatingPrices, setUpdatingPrices] = useState(false)
  const [updateResult, setUpdateResult] = useState('')
  const [updatingRarities, setUpdatingRarities] = useState(false)
  const [rarityResult, setRarityResult] = useState('')

  // Bulk
  const [bulkUrls, setBulkUrls] = useState('')
  const [bulkProgress, setBulkProgress] = useState<{ url: string; status: 'pending' | 'ok' | 'error'; name?: string }[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [weaponFilter, setWeaponFilter] = useState('Все')
  const [rarityWeapon, setRarityWeapon] = useState('Все')

  const fetchItems = async () => {
    const res = await fetch('/api/items')
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
  }

  useEffect(() => { fetchItems() }, [])

  const resetForm = () => {
    setCondition('FT')
    setStatTrak(false)
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
      setImageUrl(data.image || '')
      setMarketHash(data.marketHash || '')
      setRarity(data.rarity || 'Mil-Spec')
      setCondition(data.condition || 'FT')
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
          body: JSON.stringify({ name, image: imageUrl, price, rarity, statTrak, condition }),
        })
      } else {
        res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'save', url: steamUrl, name, image: imageUrl, price, marketHash, rarity, statTrak, condition }),
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
    setCondition(item.condition || 'FT')
    setStatTrak(item.statTrak || false)
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

  const handleUpdatePrices = async () => {
    setUpdatingPrices(true)
    setUpdateResult('')
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'update-prices' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setUpdateResult(data.error || 'Ошибка обновления')
        return
      }
      setUpdateResult(`Обновлено: ${data.updated} предметов`)
      fetchItems()
    } catch {
      setUpdateResult('Ошибка сети')
    } finally {
      setUpdatingPrices(false)
    }
  }
  const handleUpdateRarities = async (weapon: string) => {
  const count = weapon === 'Все'
    ? items.length
    : items.filter(i => i.name.includes(weapon)).length
  if (!confirm(`Обновить редкости ${count} предметов?`)) return
  setUpdatingRarities(true)
  setRarityResult('Запускаю...')

  const BATCH = 50
  let offset = 0
  let totalUpdated = 0
  let total = count

  try {
    while (true) {
      setRarityResult(`⏳ Обработано ${Math.min(offset + BATCH, total)}/${total}`)
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'update-rarities', offset, batchSize: BATCH, weapon }),
      })
      const data = await res.json()
      if (!res.ok) { setRarityResult('Ошибка сервера'); break }
      totalUpdated += data.updated
      total = data.total
      if (data.done) {
        setRarityResult(`✓ Готово! Обновлено: ${totalUpdated}/${total}`)
        fetchItems()
        break
      }
      offset += BATCH
      await new Promise(r => setTimeout(r, 2000))
    }
  } catch {
    setRarityResult('Ошибка сети')
  } finally {
    setUpdatingRarities(false)
  }
}

  const handleBulkAdd = async () => {
    const urls = bulkUrls.split(/[\n\s]+/).map(u => u.trim()).filter(u => u.startsWith('http'))
    if (!urls.length) return
    setBulkLoading(true)
    setBulkProgress(urls.map(url => ({ url, status: 'pending' })))

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      try {
        const parseRes = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'parse', url }),
        })
        const parsed = await parseRes.json()
        if (!parseRes.ok) throw new Error(parsed.error)

        const saveRes = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'save',
            url,
            name: parsed.name,
            image: parsed.image,
            price: parsed.price,
            marketHash: parsed.marketHash,
            rarity: parsed.rarity || 'Mil-Spec',
            statTrak: false,
            condition: 'FT',
          }),
        })
        const saved = await saveRes.json()
        if (!saveRes.ok) throw new Error(saved.error)

        setBulkProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'ok', name: parsed.name } : p))
      } catch (e: any) {
        setBulkProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error', name: e.message } : p))
      }
      await new Promise(r => setTimeout(r, 500))
    }

    setBulkLoading(false)
    fetchItems()
  }

  const filtered = items.filter(i => {
  const matchSearch = i.name.toLowerCase().includes(search.toLowerCase())
  const matchWeapon = weaponFilter === 'Все' || i.name.includes(weaponFilter)
  return matchSearch && matchWeapon
})

  const rarityColor = (r?: string) =>
    RARITIES.find(x => x.value === r)?.color ?? '#888'
if (mode === 'rarity') {
  const rarityFilteredCount = rarityWeapon === 'Все'
    ? items.length
    : items.filter(i => i.name.includes(rarityWeapon)).length

  return (
    <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto', color: 'var(--color-text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => { setMode('list'); setRarityResult('') }}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 14, padding: 0 }}>
          ← Назад
        </button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>Обновить редкости</h1>
      </div>

      <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '1.5rem' }}>
        <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
          Выбери категорию:
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {WEAPON_TYPES.map(w => (
            <button key={w} onClick={() => setRarityWeapon(w)} style={{
              padding: '0.3rem 0.75rem', fontSize: 12, borderRadius: 20, cursor: 'pointer',
              border: rarityWeapon === w ? '1px solid #4b69ff' : '0.5px solid var(--color-border-tertiary)',
              background: rarityWeapon === w ? 'rgba(75,105,255,0.15)' : 'none',
              color: rarityWeapon === w ? '#4b69ff' : 'var(--color-text-secondary)',
            }}>{w}</button>
          ))}
        </div>

        <div style={{
          background: 'var(--color-background-secondary)', borderRadius: 8,
          padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 13,
          color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-tertiary)'
        }}>
          Найдено предметов: <strong style={{ color: 'var(--color-text-primary)' }}>{rarityFilteredCount}</strong>
        </div>

        <button
          onClick={() => handleUpdateRarities(rarityWeapon)}
          disabled={updatingRarities || rarityFilteredCount === 0}
          style={{
            padding: '0.65rem 1.5rem', background: '#4b69ff', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            opacity: updatingRarities || rarityFilteredCount === 0 ? 0.6 : 1
          }}
        >
          {updatingRarities ? 'Обновляю...' : `🎨 Обновить редкости (${rarityFilteredCount})`}
        </button>

        {rarityResult && (
          <p style={{
            marginTop: '1rem', fontSize: 13, margin: '1rem 0 0',
            color: rarityResult.startsWith('✓') ? '#4caf50' : rarityResult.startsWith('Ошибка') ? '#eb4b4b' : 'var(--color-text-secondary)'
          }}>{rarityResult}</p>
        )}
      </div>
    </div>
  )
}
  // ── BULK ──
  if (mode === 'bulk') {
    const done = bulkProgress.filter(p => p.status !== 'pending').length
    const total = bulkProgress.length
    return (
      <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto', color: 'var(--color-text-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { setMode('list'); setBulkUrls(''); setBulkProgress([]) }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 14, padding: 0 }}
          >
            ← Назад
          </button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>Массовое добавление</h1>
        </div>

        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
            Вставь ссылки — каждая на новой строке
          </label>
          <textarea
  value={bulkUrls}
  onChange={e => setBulkUrls(e.target.value)}
  disabled={bulkLoading}
  onPaste={e => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const urls = text.split(/[\s\n]+/).filter(u => u.startsWith('http'))
    setBulkUrls(prev => (prev ? prev + '\n' : '') + urls.join('\n') + '\n')
  }}
  placeholder={'https://steamcommunity.com/market/listings/730/...\nhttps://steamcommunity.com/market/listings/730/...'}
            style={{ width: '100%', height: 180, padding: '0.6rem', fontSize: 13, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', resize: 'vertical' }}
          />
          <button
            onClick={handleBulkAdd}
            disabled={bulkLoading || !bulkUrls.trim()}
            style={{ marginTop: '1rem', padding: '0.65rem 1.5rem', background: '#4b69ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, opacity: bulkLoading || !bulkUrls.trim() ? 0.6 : 1 }}
          >
            {bulkLoading ? `Добавляю... (${done}/${total})` : 'Добавить все'}
          </button>
        </div>

        {bulkProgress.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bulkProgress.map((p, i) => (
              <div key={i} style={{
                background: 'var(--color-background-primary)',
                border: `0.5px solid ${p.status === 'ok' ? '#4caf5044' : p.status === 'error' ? '#eb4b4b44' : 'var(--color-border-tertiary)'}`,
                borderRadius: 8, padding: '0.6rem 1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {p.status === 'ok' ? p.name : p.url}
                </span>
                <span style={{ fontSize: 12, flexShrink: 0, color: p.status === 'ok' ? '#4caf50' : p.status === 'error' ? '#eb4b4b' : 'var(--color-text-tertiary)' }}>
                  {p.status === 'ok' ? '✓ Добавлен' : p.status === 'error' ? `✗ ${p.name || 'Ошибка'}` : '⏳'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

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

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{
                width: 160, height: 120, borderRadius: 8, background: 'var(--color-background-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
                borderBottom: `3px solid ${rarityColor(rarity)}`
              }}>
                {imageUrl ? (
                  <Image src={proxyImage(imageUrl)} alt={name} width={160} height={120} style={{ objectFit: 'contain', width: '100%', height: '100%' }} unoptimized />
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: 8 }}>Картинка появится здесь</span>
                )}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>
                  {statTrak && <span style={{ color: '#e4ae39' }}>StatTrak™ </span>}
                  {name || 'Название предмета'}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: 13, color: rarityColor(rarity) }}>
                  {RARITIES.find(x => x.value === rarity)?.label || rarity}
                </p>
                <p style={{ margin: '0.1rem 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {CONDITIONS.find(c => c.value === condition)?.label || ''}
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                {mode === 'edit' ? 'Редактировать данные' : 'Шаг 2 — Данные предмета'}
              </h2>

              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Название</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Ссылка на картинку</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://community.cloudflare.steamstatic.com/economy/image/..."
                  style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }} />
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
                  Картинка уже подтянута автоматически — менять нужно только если она неверная
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Цена (₽)</label>
                  <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Редкость</label>
                  <select value={rarity} onChange={e => setRarity(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}>
                    {RARITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Состояние</label>
                  <select value={condition} onChange={e => setCondition(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>StatTrak™</label>
                  <button onClick={() => setStatTrak(v => !v)} style={{
                    padding: '0.6rem 1rem', borderRadius: 8, fontSize: 14, cursor: 'pointer',
                    border: statTrak ? '1px solid #e4ae39' : '0.5px solid var(--color-border-tertiary)',
                    background: statTrak ? 'rgba(228,174,57,0.15)' : 'var(--color-background-secondary)',
                    color: statTrak ? '#e4ae39' : 'var(--color-text-secondary)',
                    fontWeight: statTrak ? 600 : 400, whiteSpace: 'nowrap',
                  }}>
                    {statTrak ? '✓ StatTrak™' : 'StatTrak™'}
                  </button>
                </div>
              </div>

              {saveError && <p style={{ color: '#eb4b4b', fontSize: 13, margin: 0 }}>{saveError}</p>}
              {saveSuccess && <p style={{ color: '#4caf50', fontSize: 13, margin: 0 }}>{saveSuccess}</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleSave} disabled={saveLoading}
                  style={{ padding: '0.65rem 1.5rem', background: '#4b69ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                  {saveLoading ? 'Сохраняю...' : editingId ? 'Сохранить изменения' : 'Добавить предмет'}
                </button>
                {mode === 'create' && (
                  <button onClick={() => setStep(1)}
                    style={{ padding: '0.65rem 1rem', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)' }}>
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {updateResult && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{updateResult}</span>
          )}
          {rarityResult && (
  <span style={{
    fontSize: 12,
    color: rarityResult.startsWith('✓') ? '#4caf50' : rarityResult.startsWith('Ошибка') ? '#eb4b4b' : 'var(--color-text-secondary)',
    background: 'var(--color-background-secondary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 8, padding: '0.4rem 0.75rem',
  }}>{rarityResult}</span>
)}
          <button onClick={() => { setRarityWeapon('Все'); setRarityResult(''); setMode('rarity') }} disabled={updatingRarities}
  style={{ padding: '0.6rem 1.25rem', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)' }}>
  🎨 Обновить редкости
</button>
            
          <button onClick={handleUpdatePrices} disabled={updatingPrices}
            style={{ padding: '0.6rem 1.25rem', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)' }}>
            {updatingPrices ? 'Обновляю цены...' : '💱 Обновить цены'}
          </button>
          <button onClick={() => setDeleteConfirm('ALL')}
            style={{ padding: '0.6rem 1.25rem', background: 'none', border: '0.5px solid #eb4b4b44', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#eb4b4b' }}>
            🗑️ Удалить все
          </button>
          <button onClick={() => { setBulkUrls(''); setBulkProgress([]); setMode('bulk') }}
            style={{ padding: '0.6rem 1.25rem', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-secondary)' }}>
            📋 Массовое добавление
          </button>
          <button onClick={() => { resetForm(); setMode('create') }}
            style={{ padding: '0.6rem 1.25rem', background: '#4b69ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            + Добавить предмет
          </button>
        </div>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Поиск по названию..."
        style={{ width: '100%', padding: '0.6rem', fontSize: 14, boxSizing: 'border-box', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
  {WEAPON_TYPES.map(w => (
    <button key={w} onClick={() => setWeaponFilter(w)} style={{
      padding: '0.3rem 0.75rem', fontSize: 12, borderRadius: 20, cursor: 'pointer',
      border: weaponFilter === w ? '1px solid #4b69ff' : '0.5px solid var(--color-border-tertiary)',
      background: weaponFilter === w ? 'rgba(75,105,255,0.15)' : 'none',
      color: weaponFilter === w ? '#4b69ff' : 'var(--color-text-secondary)',
    }}>
      {w}
    </button>
  ))}
</div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-tertiary)' }}>
          {items.length === 0 ? 'Предметов пока нет. Добавь первый!' : 'Ничего не найдено'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {filtered.map(item => (
          <div key={item.id} style={{
            background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12, overflow: 'hidden', borderBottom: `3px solid ${rarityColor(item.rarity)}`,
          }}>
            <div style={{ background: 'var(--color-background-secondary)', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
              <Image src={proxyImage(item.image)} alt={item.name} width={160} height={110} style={{ objectFit: 'contain', width: '100%', height: '100%' }} unoptimized />
            </div>
            <div style={{ padding: '0.75rem' }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.name}
              </p>
              <p style={{ margin: '0 0 2px', fontSize: 12, color: rarityColor(item.rarity) }}>
                {item.statTrak && <span style={{ color: '#e4ae39' }}>StatTrak™ </span>}
                {RARITIES.find(x => x.value === item.rarity)?.label || item.rarity}
              </p>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                {CONDITIONS.find(c => c.value === item.condition)?.label || ''}
              </p>
              <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 500 }}>{item.price} ₽</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleEdit(item)}
                  style={{ flex: 1, padding: '0.4rem', fontSize: 12, background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  ✏️ Изменить
                </button>
                <button onClick={() => setDeleteConfirm(item.id)}
                  style={{ padding: '0.4rem 0.6rem', fontSize: 12, background: 'none', border: '0.5px solid #eb4b4b44', borderRadius: 6, cursor: 'pointer', color: '#eb4b4b' }}>
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--color-background-primary)', borderRadius: 12, padding: '2rem', maxWidth: 320, width: '90%', textAlign: 'center' }}>
            <p style={{ margin: '0 0 1.5rem', fontSize: 15 }}>
              {deleteConfirm === 'ALL'
                ? `Удалить все ${items.length} предметов? Они также удалятся из всех кейсов.`
                : 'Удалить этот предмет? Он также удалится из всех кейсов.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '0.6rem 1.25rem', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, cursor: 'pointer', background: 'none', color: 'var(--color-text-primary)', fontSize: 14 }}>
                Отмена
              </button>
              <button onClick={async () => {
                if (deleteConfirm === 'ALL') {
                  for (const i of items) {
  await fetch(`/api/items/${i.id}`, { method: 'DELETE' })
}
                  setDeleteConfirm(null)
                  fetchItems()
                } else {
                  handleDelete(deleteConfirm)
                }
              }} style={{ padding: '0.6rem 1.25rem', background: '#eb4b4b', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 14 }}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}