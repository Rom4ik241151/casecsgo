export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const upgrades = await prisma.upgrade.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        user: { select: { username: true, avatar: true, steamId: true } }
      }
    })
    return NextResponse.json(upgrades.map(u => ({
      id: u.id,
      type: 'upgrade',
      fromName: u.fromName,
      fromPrice: u.fromPrice,
      fromImage: u.fromImage,
      toName: u.toName,
      toPrice: u.toPrice,
      toImage: u.toImage,
      won: u.won,
      username: u.user?.username || 'Игрок',
      avatar: u.user?.avatar || null,
      steamId: u.user?.steamId || null,
      createdAt: u.createdAt,
    })))
  } catch {
    return NextResponse.json([])
  }
}