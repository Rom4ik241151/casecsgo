import { create } from 'zustand'

export const useStore = create((set, get) => ({
  balance: 1000,
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
  addBalance: (amount) =>
  set((state) => {
    const newBalance = state.balance + amount
    const steamUser = state.steamUser
    if (steamUser?.steamId) {
      fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamId: steamUser.steamId, balance: newBalance })
      })
    }
    return { balance: newBalance, totalEarned: state.totalEarned + amount }
  }),

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
    set((state) => ({
      inventory: [
        {
          ...item,
          caseName,
          uid: Date.now() + Math.random()
        },
        ...state.inventory
      ]
    })),

  removeFromInventory: (uid) =>
    set((state) => ({
      inventory: state.inventory.filter(i => i.uid !== uid)
    })),

  sellItem: (item) =>
  set((state) => {
    const newBalance = state.balance + item.price
    const steamUser = state.steamUser
    if (steamUser?.steamId) {
      fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamId: steamUser.steamId, balance: newBalance })
      })
    }
    return { balance: newBalance, totalEarned: state.totalEarned + item.price }
  }),

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