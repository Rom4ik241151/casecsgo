import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const FALLBACK_IMAGE = 'https://community.cloudflare.steamstatic.com/public/images/skin_illustrations/econ/default_generated_item.png'

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
    const { mode, url, name, image, price, marketHash } = body

    if (mode === 'parse') {
      if (!url) return NextResponse.json({ error: 'Укажите ссылку' }, { status: 400 })

      const urlObj = new URL(url)
      const pathPart = urlObj.pathname.split('/listings/730/')[1] || urlObj.pathname.split('/').pop() || ''
      const parsedHash = decodeURIComponent(pathPart.split('?')[0])

      let parsedPrice = 0

      try {
        const priceRes = await fetch(
          `https://steamcommunity.com/market/priceoverview/?appid=730&currency=5&market_hash_name=${encodeURIComponent(parsedHash)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        const contentType = priceRes.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const priceData = await priceRes.json()
          const raw = priceData?.lowest_price ?? priceData?.median_price ?? '0'
          if (typeof raw === 'string') {
            parsedPrice = parseFloat(raw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
          }
        }
      } catch (err) {
        console.log('Цена не получена:', err)
      }

      return NextResponse.json({
        marketHash: parsedHash,
        name: parsedHash,
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
        },
      })

      return NextResponse.json(item)
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