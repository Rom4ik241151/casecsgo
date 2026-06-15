import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const FALLBACK_IMAGE = 'https://community.cloudflare.steamstatic.com/public/images/skin_illustrations/econ/default_generated_item.png'

async function fetchPrice(marketHash: string): Promise<number> {
  try {
    const res = await fetch(
  `https://steamcommunity.com/market/search/render/?query=${encodeURIComponent(marketHash)}&appid=730&search_descriptions=0&count=1&start=0&format=json`,
  { 
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.9',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://steamcommunity.com/market/',
    }, 
    cache: 'no-store' 
  }
)
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
      console.log('data results[0]:', JSON.stringify(data?.results?.[0])?.slice(0, 300))
      const raw = data?.lowest_price ?? data?.median_price ?? '0'
      if (typeof raw === 'string') {
        return parseFloat(raw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
      }
    }
  } catch (err) {
    console.log('Цена не получена:', err)
  }
  return 0
}

async function fetchNameAndImage(marketHash: string): Promise<{ name: string; image: string }> {
  try {
    const renderRes = await fetch(
      `https://steamcommunity.com/market/listings/730/${marketHash}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html',
        },
        cache: 'no-store',
      }
    )
    const html = await renderRes.text()

    const nameMatch = 
      html.match(/"market_hash_name":"([^"]+)"/) ||
      html.match(/class="market_listing_item_name"[^>]*>([^<]+)</) ||
      html.match(/<title>([^<]+) - Steam/)
    const name = nameMatch?.[1]?.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(' — торговая площадка сообщества Steam', '').trim() || marketHash

    const imageMatch = html.match(/economy\/image\/([^'"\/]+)/)
    const image = imageMatch
      ? `https://community.cloudflare.steamstatic.com/economy/image/${imageMatch[1]}/330x192`
      : FALLBACK_IMAGE

    return { name, image }
  } catch (err) {
    console.log('fetchNameAndImage error:', err)
  }

  return { name: marketHash, image: FALLBACK_IMAGE }
}
const RARITY_MAP: Record<string, { value: string; color: string }> = {
  'Consumer Grade':    { value: 'Consumer',   color: '#b0b0b0' },
  'Industrial Grade':  { value: 'Industrial', color: '#5e98d9' },
  'Mil-Spec Grade':    { value: 'Mil-Spec',   color: '#4b69ff' },
  'Restricted':        { value: 'Restricted', color: '#8847ff' },
  'Classified':        { value: 'Classified', color: '#d32ce6' },
  'Covert':            { value: 'Covert',     color: '#eb4b4b' },
  'Contraband':        { value: 'Contraband', color: '#e4ae39' },
}

async function fetchRarity(marketHash: string): Promise<{ rarity: string; color: string }> {
  try {
    const res = await fetch(
      `https://steamcommunity.com/market/search/render/?query=${encodeURIComponent(marketHash)}&appid=730&search_descriptions=0&count=1&start=0&format=json`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://steamcommunity.com/market/',
        },
        cache: 'no-store',
      }
    )
    const data = await res.json()
    const tags = data?.results?.[0]?.asset_description?.tags as { category: string; localized_tag_name: string }[] | undefined
    const rarityTag = tags?.find(t => t.category === 'Rarity')
    if (rarityTag) {
      const mapped = RARITY_MAP[rarityTag.localized_tag_name]
      if (mapped) return mapped
    }
  } catch (err) {
    console.log('fetchRarity error:', err)
  }
  // fallback по цене если API не ответил
  return { rarity: 'Mil-Spec', color: '#4b69ff' }
}


export async function GET() {
  try {
    const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items.map(item => ({
      ...item,
      image: item.image || FALLBACK_IMAGE,
    })))
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, url, name, image, price, marketHash, rarity, statTrak, condition } = body

    if (mode === 'parse') {
      if (!url) return NextResponse.json({ error: 'Укажите ссылку' }, { status: 400 })

      const urlObj = new URL(url)
      const pathPart = urlObj.pathname.split('/listings/730/')[1] || urlObj.pathname.split('/').pop() || ''
      const parsedHash = decodeURIComponent(pathPart.split('?')[0])

      const [parsedPrice, info] = await Promise.all([
        fetchPrice(parsedHash),
        fetchNameAndImage(parsedHash),
      ])

      return NextResponse.json({
        marketHash: parsedHash,
        name: info.name,
        image: info.image,
        price: parsedPrice,
        steamUrl: url,
      })
    }

    if (mode === 'save') {
      if (!name || !image) {
        return NextResponse.json({ error: 'Укажите название и картинку' }, { status: 400 })
      }

      const item = await prisma.item.create({
        data: {
          name,
          image,
          price: price ?? 0,
          marketHash: marketHash || null,
          steamUrl: url || null,
          rarity: rarity || 'Common',
          statTrak: statTrak ?? false,
          condition: condition || 'FT',
        },
      })

      return NextResponse.json(item)
    }

    if (mode === 'update-prices') {
      const items = await prisma.item.findMany({
        where: { marketHash: { not: null } },
      })

      const results: { id: string; name: string; oldPrice: number; newPrice: number }[] = []

      for (const item of items) {
        const newPrice = await fetchPrice(item.marketHash as string)

        if (newPrice > 0 && newPrice !== item.price) {
          await prisma.item.update({
            where: { id: item.id },
            data: { price: newPrice },
          })
        }

        results.push({
          id: item.id,
          name: item.name,
          oldPrice: item.price,
          newPrice: newPrice > 0 ? newPrice : item.price,
        })

        await new Promise(r => setTimeout(r, 1))
      }

      return NextResponse.json({ updated: results.length, results })
    }
    if (mode === 'update-rarities') {
  const { offset = 0, batchSize = 1302, weapon } = body

  const total = await prisma.item.count({ 
  where: {
  marketHash: { not: null },
  ...(weapon && weapon !== 'Все' ? { name: { contains: weapon } } : {}),
}
})

const items = await prisma.item.findMany({
  where: {
  marketHash: { not: null },
  ...(weapon && weapon !== 'Все' ? { name: { contains: weapon } } : {}),
},
    skip: offset,
    take: batchSize,
    orderBy: { createdAt: 'asc' },
  })

  let updated = 0

  for (const item of items) {
    const result = await fetchRarity(item.marketHash as string)
    console.log('result для', item.name.slice(0, 30), ':', JSON.stringify(result))
    if (result) {
      await prisma.item.update({
        where: { id: item.id },
        data: { rarity: result.rarity, color: result.color },
      })
      updated++
    }
    
  }

  return NextResponse.json({
    updated,
    processed: offset + items.length,
    total,
    done: offset + items.length >= total,
  })
}

    return NextResponse.json({ error: 'Неизвестный режим' }, { status: 400 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Предмет уже существует' }, { status: 409 })
    }
    console.error(e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}