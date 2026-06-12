import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const FALLBACK_IMAGE = 'https://community.cloudflare.steamstatic.com/public/images/skin_illustrations/econ/default_generated_item.png'

// Получить цену по marketHashName
async function fetchPrice(marketHash: string): Promise<number> {
  try {
    const res = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=730&currency=5&market_hash_name=${encodeURIComponent(marketHash)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
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

// Получить название + картинку через Steam Market Search
async function fetchNameAndImage(marketHash: string): Promise<{ name: string; image: string; rarity: string; ftPrice: number }> {
  try {
    // Используем Steam Market Search API — отдаёт JSON с данными
    const searchRes = await fetch(
      `https://steamcommunity.com/market/search/render/?appid=730&norender=1&count=1&query=${encodeURIComponent(marketHash)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const searchData = await searchRes.json()
    const item = searchData?.results?.[0]

    const image = item?.asset_description?.icon_url
      ? `https://community.cloudflare.steamstatic.com/economy/image/${item.asset_description.icon_url}/330x192`
      : FALLBACK_IMAGE

    const name = item?.name || marketHash

    // Rarity из тегов
    const tags: any[] = item?.asset_description?.tags || []
    const rarityTag = tags.find((t: any) => t.category === 'Rarity')
    const rarityInternalName = rarityTag?.internal_name || ''
    const rarityMap: Record<string, string> = {
      'Rarity_Ancient_Weapon': 'Covert',
      'Rarity_Ancient': 'Covert',
      'Rarity_Legendary_Weapon': 'Classified',
      'Rarity_Legendary': 'Classified',
      'Rarity_Mythical_Weapon': 'Restricted',
      'Rarity_Mythical': 'Restricted',
      'Rarity_Rare_Weapon': 'MilSpec',
      'Rarity_Rare': 'MilSpec',
      'Rarity_Uncommon_Weapon': 'Industrial',
      'Rarity_Uncommon': 'Industrial',
      'Rarity_Common_Weapon': 'Consumer',
      'Rarity_Common': 'Consumer',
      'Rarity_Contraband': 'Contraband',
    }
    const rarity = rarityMap[rarityInternalName] || 'MilSpec'

    // FT цена через priceoverview
    const ftHash = marketHash.replace(
      /\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/,
      '(Field-Tested)'
    )
    const priceRes = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=730&currency=5&market_hash_name=${encodeURIComponent(ftHash)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const priceData = await priceRes.json()
    const raw = priceData?.lowest_price ?? priceData?.median_price ?? '0'
    const ftPrice = typeof raw === 'string'
      ? parseFloat(raw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
      : 0

    console.log('API rarity:', rarityInternalName, '->', rarity)
    console.log('API ftPrice:', ftPrice)

    return { name, image, rarity, ftPrice }
  } catch (err) {
    console.log('fetchNameAndImage error:', err)
  }

  return { name: marketHash, image: FALLBACK_IMAGE, rarity: 'MilSpec', ftPrice: 0 }
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
  let parsedHash = decodeURIComponent(pathPart.split('?')[0])
parsedHash = parsedHash.replace(/StatTrak™\s*/g, '').trim()
parsedHash = parsedHash.replace(
  /\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/,
  '(Field-Tested)'
)

  console.log('=== PARSE START ===')
  console.log('URL:', url)
  console.log('Hash:', parsedHash)

  const [parsedPrice, info] = await Promise.all([
    fetchPrice(parsedHash),
    fetchNameAndImage(parsedHash),
  ])
  const finalPrice = info.ftPrice > 0 ? info.ftPrice : parsedPrice

  console.log('Price:', parsedPrice)
  console.log('Info:', info)

  return NextResponse.json({
    marketHash: parsedHash,
    name: info.name,
    image: info.image,
    price: finalPrice,
    steamUrl: url,
    statTrak: false,
    condition: 'FT',
    rarity: info.rarity,
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

    // Массовое обновление цен всех предметов, у которых есть marketHash
    if (mode === 'update-prices') {
      const items = await prisma.item.findMany({
        where: { marketHash: { not: null } },
      })

      const results: { id: string; name: string; oldPrice: number; newPrice: number }[] = []

      for (const item of items) {
        let hashForPrice = item.marketHash as string
hashForPrice = hashForPrice.replace(/StatTrak™\s*/g, '').trim()
hashForPrice = hashForPrice.replace(
  /\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)/,
  '(Field-Tested)'
)
const newPrice = await fetchPrice(hashForPrice)

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

        // небольшая пауза, чтобы не получить рейт-лимит от Steam
        await new Promise(r => setTimeout(r, 300))
      }

      return NextResponse.json({ updated: results.length, results })
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