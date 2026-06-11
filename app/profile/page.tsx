'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '../store'

export default function ProfilePage() {
  const router = useRouter()
  const { balance, inventory, drops, sellItem, removeFromInventory, level, experience, casesOpened, totalEarned, totalSpent, dailyStreak, addBalance } = useStore()

  function sell(item: any) {
    sellItem(item)
    removeFromInventory(item.uid)
  }

  function sellAll() {
    inventory.forEach((item: any) => sellItem(item))
inventory.forEach((item: any) => removeFromInventory(item.uid))
  }

  const inventoryValue = inventory.reduce((sum: number, i: any) => sum + i.price, 0)

  return (
    <main style={{ minHeight: '100vh', background: '#0f1021', color: 'white', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: '#0a0a1a', borderBottom: '1px solid #1e2a4a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => router.push('/')} style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>CaseCSGO</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([['/', '🎁 Кейсы'], ['/upgrade', '⚡ Апгрейд'], ['/roulette', '🎰 Рулетка'], ['/contracts', '📋 Контракты']] as [string, string][]).map(([href, label]) => (
            <span key={href} onClick={() => router.push(href)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              background: 'transparent', color: '#888', border: '1px solid #1e2a4a'
            }}>{label}</span>
          ))}
        </div>
        <span style={{ color: '#e84b6a', fontWeight: 'bold' }}>{balance} руб</span>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Шапка профиля */}
        <div style={{ background: '#16213e', borderRadius: '16px', padding: '28px', marginBottom: '24px', border: '1px solid #1e2a4a', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #e84b6a, #8847ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Игрок</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ background: '#e84b6a', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Уровень {level}</span>
              {dailyStreak > 0 && <span style={{ background: '#f5a623', color: '#000', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>🔥 Стрик {dailyStreak} дней</span>}
            </div>
            {/* Прогресс бар опыта */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '6px', background: '#0f1021', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(experience / (level * 10)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #e84b6a, #8847ff)', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
              <span style={{ color: '#888', fontSize: '12px', whiteSpace: 'nowrap' }}>{experience} / {level * 10} XP</span>
            </div>
          </div>
        </div>
        {/* Пополнение баланса */}
<div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #1e2a4a' }}>
  <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>💳 Пополнить баланс</h2>
  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
    {[100, 250, 500, 1000, 2500, 5000].map(amount => (
      <button key={amount} onClick={() => addBalance(amount)} style={{
        background: 'rgba(233,69,96,0.1)',
        border: '1px solid rgba(233,69,96,0.3)',
        color: '#e84b6a', padding: '10px 20px',
        borderRadius: '8px', cursor: 'pointer',
        fontWeight: 'bold', fontSize: '14px',
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#e84b6a'
        e.currentTarget.style.color = 'white'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(233,69,96,0.1)'
        e.currentTarget.style.color = '#e84b6a'
      }}
      >+{amount} ₽</button>
    ))}
  </div>
  <p style={{ color: '#555', fontSize: '12px', marginBottom: '16px' }}>* Тестовый режим — баланс пополняется мгновенно</p>
<button onClick={() => router.push('/payment')} style={{
  background: '#e84b6a', color: 'white', border: 'none',
  padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
  fontWeight: 'bold', fontSize: '14px'
}}>
  💳 Пополнить через платёжку
</button>
</div>

        {/* Статистика */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Баланс', value: `${balance} руб`, color: '#e84b6a' },
            { label: 'Кейсов открыто', value: casesOpened, color: '#4b9de8' },
            { label: 'Заработано', value: `${totalEarned} руб`, color: '#4caf50' },
            { label: 'Потрачено', value: `${totalSpent} руб`, color: '#f5a623' },
            { label: 'Скинов в инвентаре', value: inventory.length, color: '#8847ff' },
            { label: 'Стоимость инвентаря', value: `${inventoryValue} руб`, color: '#e4ae39' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#16213e', borderRadius: '12px', padding: '16px', border: '1px solid #1e2a4a' }}>
              <p style={{ color: '#555', fontSize: '12px', marginBottom: '6px' }}>{stat.label}</p>
              <p style={{ color: stat.color, fontWeight: 'bold', fontSize: '18px' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Инвентарь */}
        <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>🎒 Инвентарь ({inventory.length})</h2>
            {inventory.length > 0 && (
              <button onClick={sellAll} style={{ background: '#e84b6a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                Продать всё ({inventoryValue} руб)
              </button>
            )}
          </div>
          {inventory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎒</div>
              <p>Инвентарь пуст — открывай кейсы!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {inventory.map((item: any) => (
                <div key={item.uid} style={{ background: '#0f1021', borderRadius: '10px', padding: '14px', textAlign: 'center', borderBottom: `3px solid ${item.color}` }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔫</div>
                  <p style={{ color: item.color, fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{item.name}</p>
                  <p style={{ color: '#555', fontSize: '11px', marginBottom: '4px' }}>{item.caseName}</p>
                  <p style={{ color: '#e84b6a', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>{item.price} руб</p>
                  <button onClick={() => sell(item)} style={{ background: '#e84b6a', color: 'white', border: 'none', padding: '6px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '12px' }}>
                    Продать
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* История дропов */}
        <div style={{ background: '#16213e', borderRadius: '16px', padding: '24px', border: '1px solid #1e2a4a' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>📜 История дропов ({drops.length})</h2>
          {drops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📜</div>
              <p>История пуста — открывай кейсы!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {drops.map((drop: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f1021', borderRadius: '8px', padding: '12px 16px', borderLeft: `3px solid ${drop.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🔫</span>
                    <div>
                      <p style={{ color: drop.color, fontWeight: 'bold', fontSize: '13px' }}>{drop.name}</p>
                      <p style={{ color: '#555', fontSize: '11px' }}>{drop.caseName} • {drop.time}</p>
                    </div>
                  </div>
                  <span style={{ color: '#e84b6a', fontWeight: 'bold' }}>{drop.price} руб</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}