export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const steamId = searchParams.get('steamId')
  if (!steamId) return NextResponse.json(null)

  const user = await prisma.user.findUnique({ where: { steamId } })
  if (!user) return NextResponse.json(null)

  const [casesOpened, upgradesCount] = await Promise.all([
    prisma.drop.count({ where: { userId: user.id } }),
    prisma.upgrade.count({ where: { userId: user.id } }),
  ])

  return NextResponse.json({
    casesOpened,
    upgradesCount,
    totalWon: user.totalWon,
    tradeUrl: user.tradeUrl || '',
  })
}