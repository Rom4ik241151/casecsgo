export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/inventory?steamId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const steamId = searchParams.get('steamId')
  if (!steamId) return NextResponse.json([])

  const user = await prisma.user.findUnique({ where: { steamId } })
  if (!user) return NextResponse.json([])

  const items = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(items)
}

// POST { steamId, item: { name, image, price, color }, caseName }
export async function POST(req: NextRequest) {
  try {
    const { steamId, item, caseName } = await req.json()

    if (!steamId || !item) {
      return NextResponse.json({ error: 'steamId и item обязательны' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { steamId } })
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const created = await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        name: item.name,
        image: item.image || '',
        rarity: item.rarity || '',
        price: Math.round(item.price),
        color: item.color || '#888',
        caseName: caseName || item.caseName || '',
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Ошибка POST /api/inventory:', error)
    return NextResponse.json({ error: 'Ошибка добавления в инвентарь' }, { status: 500 })
  }
}

// DELETE { id, sell?: boolean, steamId?: string }
// sell=true -> удаляет предмет и начисляет баланс владельцу
export async function DELETE(req: NextRequest) {
  try {
    const { id, sell, steamId } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'id обязателен' }, { status: 400 })
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ error: 'Предмет не найден' }, { status: 404 })
    }

    await prisma.inventoryItem.delete({ where: { id } })

    if (sell && steamId) {
      const user = await prisma.user.update({
        where: { steamId },
        data: {
          balance: { increment: item.price },
          totalWon: { increment: item.price },
        },
      })
      return NextResponse.json({ ok: true, balance: user.balance })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Ошибка DELETE /api/inventory:', error)
    return NextResponse.json({ error: 'Ошибка удаления из инвентаря' }, { status: 500 })
  }
}