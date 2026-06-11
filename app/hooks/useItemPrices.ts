'use client'

import { useState, useEffect } from 'react'

const globalCache: Record<string, number | null> = {}
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000

export function useItemPrices(names: string[]) {
  const [prices, setPrices] = useState<Record<string, number | null>>({})
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!names.length) return

    const now = Date.now()
    const uncached = names.filter(n => !(n in globalCache) || now - cacheTime > CACHE_TTL)

    if (uncached.length === 0) {
      const result: Record<string, number | null> = {}
      names.forEach(n => { result[n] = globalCache[n] })
      setPrices(result)
      setLoading(false)
      return
    }

    // Грузим пачками по 20
    const chunks: string[][] = []
    for (let i = 0; i < uncached.length; i += 20) {
      chunks.push(uncached.slice(i, i + 20))
    }

    let loaded = 0
    const fetchChunk = async (chunk: string[]) => {
      try {
        const res = await fetch('/api/steam-prices-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: chunk })
        })
        const data = await res.json()
        if (data.prices) {
          Object.assign(globalCache, data.prices)
          cacheTime = Date.now()
        }
      } catch {}
      loaded++
      setProgress(Math.round((loaded / chunks.length) * 100))
    }

    setLoading(true)
    Promise.all(chunks.map(fetchChunk)).then(() => {
      const result: Record<string, number | null> = {}
      names.forEach(n => { result[n] = globalCache[n] ?? null })
      setPrices(result)
      setLoading(false)
    })
  }, [names.join(',')])

  return { prices, loading, progress }
}