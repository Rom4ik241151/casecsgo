import { create } from 'zustand'

export const useStore = create((set, get) => ({
  balance: 0,
steamUser: null,
setSteamUser: (user) => set({ steamUser: user }),

  level: 1,
  experience: 0,
  casesOpened: 0,

  drops: [],
  inventory: [],

  // ====== NEW (Этап 1) ======
  lastDailyBonus: null,
  dailyStreak: 0,
  totalEarned: 0,
  totalSpent: 0,
  caseOfTheDay: null,

  // ====== BALANCE ======
  addBalance: (amount) => {
  const state = get()
  const newBalance = state.balance + amount
  set({ balance: newBalance })
  if (state.steamUser?.steamId) {
    fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steamId: state.steamUser.steamId, balance: newBalance })
    }).catch(() => {})
  }
},

  // ====== DROPS ======
  addDrop: (item, caseName) =>
    set((state) => ({
      drops: [
        {
          ...item,
          caseName,
          time: new Date().toLocaleTimeString()
        },
        ...state.drops
      ].slice(0, 20),
    })),

  // ====== INVENTORY ======
  addToInventory: (item, caseName) =>
    set((state) => {
      const uid = Date.now() + Math.random()
      const steamUser = state.steamUser
      if (steamUser?.steamId) {
        fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ steamId: steamUser.steamId, item, caseName })
        })
          .then(r => r.json())
          .then(created => {
            if (created?.id) {
              set((s) => ({
                inventory: s.inventory.map(i => i.uid === uid ? { ...i, dbId: created.id } : i)
              }))
            }
          })
          .catch(() => {})
      }
      return {
        inventory: [
          { ...item, caseName, uid },
          ...state.inventory
        ]
      }
    }),

  removeFromInventory: (uid) =>
    set((state) => {
      const item = state.inventory.find(i => i.uid === uid)
      if (item?.dbId) {
        fetch('/api/inventory', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.dbId })
        }).catch(() => {})
      }
      return {
        inventory: state.inventory.filter(i => i.uid !== uid)
      }
    }),

  setBalance: (balance) => set({ balance }),

  sellItem: (item) => {
  const state = get()
  const newBalance = state.balance + item.price
  set({ balance: newBalance, totalEarned: state.totalEarned + item.price })
  if (state.steamUser?.steamId) {
    fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steamId: state.steamUser.steamId, balance: newBalance })
    }).catch(() => {})
  }
},
        

  // ====== EXPERIENCE / LEVEL ======
  addExperience: () =>
    set((state) => {
      const newExp = state.experience + 1

      if (newExp >= state.level * 10) {
        return {
          experience: 0,
          level: state.level + 1
        }
      }

      return {
        experience: newExp
      }
    }),

  // ====== CASES ======
  openCase: () =>
    set((state) => ({
      casesOpened: state.casesOpened + 1
    })),

  // ====== 🔥 DAILY BONUS (НОВОЕ) ======
  claimDailyBonus: () => {
    const state = get()
    const now = Date.now()

    const ONE_DAY = 24 * 60 * 60 * 1000

    if (state.lastDailyBonus && now - state.lastDailyBonus < ONE_DAY) {
      return false // уже получал
    }

    const streak =
      state.lastDailyBonus && now - state.lastDailyBonus < ONE_DAY * 2
        ? state.dailyStreak + 1
        : 1

    const reward = 100 + streak * 20

    set({
      balance: state.balance + reward,
      totalEarned: state.totalEarned + reward,
      lastDailyBonus: now,
      dailyStreak: streak
    })

    return reward
  },

  // ====== 🎁 CASE OF THE DAY (НОВОЕ) ======
  setCaseOfTheDay: (caseData) =>
    set(() => ({
      caseOfTheDay: caseData
    })),

  // helper
  getStats: () => {
    const state = get()

    return {
      balance: state.balance,
      level: state.level,
      experience: state.experience,
      casesOpened: state.casesOpened,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      inventorySize: state.inventory.length,
      dropsCount: state.drops.length,
      dailyStreak: state.dailyStreak
    }
  }
}))