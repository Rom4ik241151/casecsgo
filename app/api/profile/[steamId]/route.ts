export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: Request, { params }: { params: { steamId: string } }) {
  const user = await prisma.user.findUnique({
    where: { steamId: params.steamId },
    select: { steamId: true, username: true, avatar: true }
  })

  if (!user) return NextResponse.json({ user: null, drops: [] })

  const drops = await prisma.drop.findMany({
    where: { user: { steamId: params.steamId } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ user, drops })
}