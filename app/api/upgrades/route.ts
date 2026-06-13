import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Пробуем получить сессию
    const session = await getServerSession(authOptions)
    
    // Ищем юзера по steamId или берём первого
    let userId: string | null = null
    
    if (session?.user) {
      const steamId = (session.user as any).steamId
      if (steamId) {
        const user = await prisma.user.findUnique({ where: { steamId } })
        if (user) userId = user.id
      }
    }
    
    // Если нет юзера — берём первого из БД
    if (!userId) {
      const firstUser = await prisma.user.findFirst()
      if (firstUser) userId = firstUser.id
    }
    
    if (!userId) return NextResponse.json({ error: 'Нет юзера' }, { status: 400 })

    const upgrade = await prisma.upgrade.create({
      data: {
        userId,
        fromName: body.fromName,
        fromPrice: body.fromPrice,
        fromImage: body.fromImage,
        toName: body.toName,
        toPrice: body.toPrice,
        toImage: body.toImage,
        won: body.won,
      }
    })
    return NextResponse.json(upgrade)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}