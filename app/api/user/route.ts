export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function POST(req: NextRequest) {
  const { steamId, username, avatar } = await req.json()
  const user = await prisma.user.upsert({
    where: { steamId },
    update: { username, avatar, lastSeen: new Date() },
create: { steamId, username, avatar, lastSeen: new Date() }
  })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const { steamId, balance, tradeUrl } = await req.json()
  const data: any = {}
  if (balance !== undefined) data.balance = balance
  if (tradeUrl !== undefined) data.tradeUrl = tradeUrl

  const user = await prisma.user.update({
    where: { steamId },
    data
  })
  return NextResponse.json(user)
}

export async function GET() {
  return NextResponse.json({ online: 1 })
}