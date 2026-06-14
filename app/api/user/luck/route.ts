export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const steamUserCookie = req.cookies.get('steam_user')?.value
    if (!steamUserCookie) {
      return NextResponse.json({ luckModifier: 1.0 })
    }
    const steamUser = JSON.parse(decodeURIComponent(steamUserCookie))
    const steamId = steamUser?.steamId
    if (!steamId) return NextResponse.json({ luckModifier: 1.0 })

    const user = await prisma.user.findUnique({ where: { steamId } })
    return NextResponse.json({ luckModifier: user?.luckModifier ?? 1.0 })
  } catch (e) {
    return NextResponse.json({ luckModifier: 1.0 })
  }
}