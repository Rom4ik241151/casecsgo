'use client'
import { useRouter } from 'next/navigation'
import { useStore } from '../store'

export default function Inventory() {
  const router = useRouter()
  const { inventory, sellItem, removeFromInventory } = useStore()

  function sell(item) {
    sellItem(item)
    removeFromInventory(item.uid)
  }

  function sellAll() {
    inventory.forEach(item => sellItem(item))
    inventory.forEach(item => removeFromInventory(item.uid))
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1a1a2e' }}>
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>CaseCSGO</div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '40px' }}>
        <button onClick={() => router.push('/')} style={{
          background: 'transparent', border: '1px solid #444',
          color: '#888', padding: '8px 16px', borderRadius: '6px',
          cursor: 'pointer', marginBottom: '30px'
        }}>← Назад</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px' }}>Инвентарь ({inventory.length})</h1>
          {inventory.length > 0 && (
            <button onClick={sellAll} style={{
              background: '#533483', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>Продать всё</button>
          )}
        </div>

        {inventory.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px', color: '#555' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎒</div>
            <p style={{ fontSize: '20px' }}>Инвентарь пуст</p>
            <p style={{ color: '#444', marginTop: '10px' }}>Открывай кейсы и оставляй скины!</p>
            <button onClick={() => router.push('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>
              Открыть кейсы
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
            {inventory.map((item) => (
              <div key={item.uid} style={{
                background: '#16213e', borderRadius: '10px',
                padding: '15px', textAlign: 'center',
                borderBottom: `3px solid ${item.color}`
              }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔫</div>
                <p style={{ fontSize: '12px', color: item.color, fontWeight: 'bold', marginBottom: '4px' }}>{item.name}</p>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{item.rarity}</p>
                <p style={{ fontSize: '14px', color: '#e94560', fontWeight: 'bold', marginBottom: '12px' }}>{item.price} руб</p>
                <button onClick={() => sell(item)} style={{
                  background: '#e94560', color: 'white', border: 'none',
                  padding: '8px 0', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 'bold', width: '100%', fontSize: '13px'
                }}>Продать</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}