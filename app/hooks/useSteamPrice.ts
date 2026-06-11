'use client'

import { useState, useEffect } from 'react'

const priceCache: Record<string, { price: number | null, time: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

export function useSteamPrice(itemName: string) {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!itemName) return

    const cached = priceCache[itemName]
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      setPrice(cached.price)
      setLoading(false)
      return
    }

    fetch(`/api/steam-price?name=${encodeURIComponent(itemName)}`)
      .then(res => res.json())
      .then(data => {
        const p = data.price ?? null
        priceCache[itemName] = { price: p, time: Date.now() }
        setPrice(p)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [itemName])

  return { price, loading }
}