export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const drops = await prisma.drop.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
    include: { user: { select: { username: true, avatar: true, steamId: true } } }
  })

  return NextResponse.json(drops.map(d => ({
  id: d.id,
  type: 'drop',
  name: d.name,
  price: d.price,
  color: d.color,
  caseName: d.caseName,
  image: d.image || null,
  username: d.user?.username || 'Игрок',
  avatar: d.user?.avatar || null,
  steamId: d.user?.steamId || null,
  createdAt: d.createdAt,
})), {
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  }
})
}