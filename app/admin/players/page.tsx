'use client'

import { useEffect, useState } from 'react'

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<Record<string, string>>({})

  const fetchPlayers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/players')
    const data = await res.json()
    if (Array.isArray(data)) setPlayers(data)
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

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>👥 Игроки ({players.length})</h1>

      {loading ? (
        <p style={{ color: '#555' }}>Загрузка...</p>
      ) : players.length === 0 ? (
        <p style={{ color: '#555' }}>Нет игроков</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {players.map(player => (
            <div key={player.id} style={{ background: '#0d1128', border: '1px solid #1e2a4a', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {player.avatar && <img src={player.avatar} width={44} height={44} style={{ borderRadius: '50%', border: '2px solid #1e2a4a', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: '#fff' }}>{player.username || 'Игрок'}</p>
                <p style={{ fontSize: 11, color: '#444', margin: '2px 0 0', fontFamily: 'monospace' }}>{player.steamId}</p>
              </div>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <p style={{ color: '#e84b6a', fontWeight: 700, fontSize: 18, margin: 0 }}>{player.balance.toLocaleString()} ₽</p>
                <p style={{ color: '#444', fontSize: 11, margin: 0 }}>баланс</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Сумма"
                  value={amounts[player.steamId] || ''}
                  onChange={e => setAmounts({ ...amounts, [player.steamId]: e.target.value })}
                  style={{ width: 100, padding: '6px 10px', background: '#080b18', border: '1px solid #1e2a4a', color: '#fff', borderRadius: 8, fontSize: 13 }}
                />
                <button onClick={() => addBalance(player.steamId)} style={{ padding: '7px 16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Баланс</button>
                {msg[player.steamId] && <span style={{ color: '#4caf50', fontSize: 12 }}>{msg[player.steamId]}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}