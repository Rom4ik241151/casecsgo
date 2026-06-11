import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function GET(req: NextRequest) {
  const steamId = req.nextUrl.searchParams.get('steamId')
  if (!steamId) return NextResponse.json({ error: 'no steamId' }, { status: 400 })

  let user = await prisma.user.findUnique({ where: { steamId }, include: { inventory: true, drops: true } })
  return NextResponse.json(user)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { steamId, username, avatar } = body

  let user = await prisma.user.upsert({
    where: { steamId },
    update: { username, avatar },
    create: { steamId, username, avatar, balance: 1000 },
    include: { inventory: true, drops: true }
  })

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { steamId, balance, inventoryItem, drop } = body

  if (balance !== undefined) {
    await prisma.user.update({ where: { steamId }, data: { balance } })
  }

  if (inventoryItem) {
    await prisma.inventoryItem.create({ data: { ...inventoryItem, userId: (await prisma.user.findUnique({ where: { steamId } }))!.id } })
  }

  if (drop) {
    await prisma.drop.create({ data: { ...drop, userId: (await prisma.user.findUnique({ where: { steamId } }))!.id } })
  }

  return NextResponse.json({ ok: true })
}