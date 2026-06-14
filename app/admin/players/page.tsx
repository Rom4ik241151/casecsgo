'use client'

import { useEffect, useState } from 'react'

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'balance' | 'username'>('balance')
  const [copied, setCopied] = useState('')
  const [luckValues, setLuckValues] = useState<Record<string, number>>({})
  const [luckSaved, setLuckSaved] = useState<Record<string, boolean>>({})

  

  const saveLuck = async (steamId: string, value: number) => {
    await fetch('/api/admin/players/luck', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steamId, luckModifier: value }),
    })
    setLuckSaved(prev => ({ ...prev, [steamId]: true }))
    setTimeout(() => setLuckSaved(prev => ({ ...prev, [steamId]: false })), 1500)
  }

  const fetchPlayers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/players')
    const text = await res.text()
    const data = text ? JSON.parse(text) : []
    if (Array.isArray(data)) {
      setPlayers(data)
      const init: Record<string, number> = {}
      data.forEach((p: any) => { init[p.steamId] = p.luckModifier ?? 1.0 })
      setLuckValues(init)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPlayers() }, [])

  const addBalance = async (steamId: string) => {
    const amount = Number(amounts[steamId])
    if (!amount) return
    const res = await fetch('/api/admin/players', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steamId, amount })
    })
    const data = await res.json()
    if (data.ok) {
      setMsg({ ...msg, [steamId]: `+${amount} ₽ добавлено` })
      setAmounts({ ...amounts, [steamId]: '' })
      fetchPlayers()
      setTimeout(() => setMsg(prev => ({ ...prev, [steamId]: '' })), 3000)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  const filtered = players
    .filter(p => {
      const q = search.toLowerCase().trim()
      if (!q) return true
      return (
        (p.username || '').toLowerCase().includes(q) ||
        (p.steamId || '').includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'balance') return b.balance - a.balance
      return (a.username || '').localeCompare(b.username || '')
    })

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>👥 Игроки ({filtered.length}/{players.length})</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Поиск по имени или SteamID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 280px', padding: '10px 14px', background: '#0d1128', border: '1px solid #1e2a4a', color: '#fff', borderRadius: 8, fontSize: 13 }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'balance' | 'username')}
          style={{ padding: '10px 14px', background: '#0d1128', border: '1px solid #1e2a4a', color: '#fff', borderRadius: 8, fontSize: 13 }}
        >
          <option value="balance">Сортировка: по балансу</option>
          <option value="username">Сортировка: по имени</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#555' }}>Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#555' }}>Ничего не найдено</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(player => (
            <div key={player.id} style={{ background: '#0d1128', border: '1px solid #1e2a4a', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {player.avatar && <img src={player.avatar} width={40} height={40} style={{ borderRadius: '50%', border: '2px solid #1e2a4a', flexShrink: 0 }} />}

              <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.username || 'Игрок'}</p>
                <div
                  onClick={() => copyToClipboard(player.steamId, `steam-${player.id}`)}
                  title="Скопировать SteamID"
                  style={{ fontSize: 11, color: '#444', margin: '2px 0 0', fontFamily: 'monospace', cursor: 'pointer' }}
                >
                  {copied === `steam-${player.id}` ? '✓ скопировано' : player.steamId}
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: 90 }}>
                <p style={{ color: '#e84b6a', fontWeight: 700, fontSize: 16, margin: 0 }}>{player.balance.toLocaleString()} ₽</p>
                <p style={{ color: '#444', fontSize: 11, margin: 0 }}>баланс</p>
              </div>

              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                {player.tradeUrl ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a
                      href={player.tradeUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#a570ff', fontSize: 12, textDecoration: 'underline', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160, display: 'inline-block' }}
                    >
                      trade-ссылка
                    </a>
                    <button
                      onClick={() => copyToClipboard(player.tradeUrl, `trade-${player.id}`)}
                      style={{ padding: '3px 8px', background: '#1e2a4a', color: '#aaa', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}
                    >
                      {copied === `trade-${player.id}` ? '✓' : 'копир.'}
                    </button>
                  </div>
                ) : (
                  <p style={{ color: '#444', fontSize: 12, margin: 0 }}>trade не указана</p>
                )}
              </div>
              <div style={{ minWidth: 180 }}>
                <p style={{ color: '#666', fontSize: 11, margin: '0 0 4px' }}>
                  Шанс x{(luckValues[player.steamId] ?? 1.0).toFixed(2)}
                  {luckSaved[player.steamId] && <span style={{ color: '#4caf50', marginLeft: 6 }}>✓</span>}
                </p>
                <input
                  type="range"
                  min={0.3}
                  max={2.5}
                  step={0.05}
                  value={luckValues[player.steamId] ?? 1.0}
                  onChange={e => setLuckValues(prev => ({ ...prev, [player.steamId]: parseFloat(e.target.value) }))}
                  onMouseUp={e => saveLuck(player.steamId, parseFloat((e.target as HTMLInputElement).value))}
                  onTouchEnd={e => saveLuck(player.steamId, parseFloat((e.target as HTMLInputElement).value))}
                  style={{ width: '100%' }}
                />
                <button
                  onClick={() => saveLuck(player.steamId, luckValues[player.steamId] ?? 1.0)}
                  style={{ marginTop: 4, padding: '2px 10px', background: '#1e2a4a', color: '#aaa', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, width: '100%' }}
                >
                  {luckSaved[player.steamId] ? '✓ Сохранено' : 'Сохранить'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Сумма"
                  value={amounts[player.steamId] || ''}
                  onChange={e => setAmounts({ ...amounts, [player.steamId]: e.target.value })}
                  style={{ width: 90, padding: '6px 10px', background: '#080b18', border: '1px solid #1e2a4a', color: '#fff', borderRadius: 8, fontSize: 13 }}
                />
                <button onClick={() => addBalance(player.steamId)} style={{ padding: '7px 14px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>+ Баланс</button>
                {msg[player.steamId] && <span style={{ color: '#4caf50', fontSize: 12 }}>{msg[player.steamId]}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}