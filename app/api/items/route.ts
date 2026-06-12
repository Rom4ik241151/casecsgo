import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const FALLBACK_IMAGE = 'https://community.cloudflare.steamstatic.com/public/images/skin_illustrations/econ/default_generated_item.png'

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