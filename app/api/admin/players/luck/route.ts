export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('LUCK PATCH received:', body)
    const { steamId, luckModifier } = body
    if (!steamId || typeof luckModifier !== 'number') {
      console.log('LUCK PATCH bad request:', { steamId, luckModifier })
      return NextResponse.json({ error: 'bad request' }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { steamId },
      data: { luckModifier },
    })
    console.log('LUCK PATCH success:', user.steamId, user.luckModifier)
    return NextResponse.json({ ok: true, luckModifier: user.luckModifier })
  } catch (e) {
    console.error('LUCK PATCH error:', e)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}