import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function POST(req: NextRequest) {
  const { name, price, color, caseName, steamId } = await req.json()
  
  let userId = null
  if (steamId) {
    const user = await prisma.user.findUnique({ where: { steamId } })
    if (user) userId = user.id
  }

  await prisma.drop.create({
    data: { name, price, color, caseName, userId: userId || 'anonymous' }
  })

  const total = await prisma.drop.count()
  return NextResponse.json({ total })
}

export async function GET() {
  const total = await prisma.drop.count()
  return NextResponse.json({ total })
}