export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

const rateLimitMap = new Map<string, { count: number, lastReset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 минута
  const maxRequests = 20 // максимум 20 открытий в минуту

  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

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