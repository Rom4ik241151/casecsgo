import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const players = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(players)
}

export async function PATCH(req: NextRequest) {
  const { steamId, amount } = await req.json()
  const user = await prisma.user.findUnique({ where: { steamId } })
  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 })

  await prisma.user.update({
    where: { steamId },
    data: { balance: user.balance + amount }
  })

  return NextResponse.json({ ok: true })
}