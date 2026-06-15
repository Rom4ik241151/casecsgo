import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const item = await prisma.item.update({
      where: { id: params.id },
      data: {
        name: body.name,
        image: body.image,
        price: body.price,
        rarity: body.rarity,
        condition: body.condition,
        statTrak: body.statTrak,
        color: ({
          'Consumer':   '#b0b0b0',
          'Industrial': '#5e98d9',
          'Mil-Spec':   '#4b69ff',
          'Restricted': '#8847ff',
          'Classified': '#d32ce6',
          'Covert':     '#eb4b4b',
          'Contraband': '#e4ae39',
        } as Record<string, string>)[body.rarity] ?? '#888888',
      },
    })
    return NextResponse.json(item)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.caseItem.deleteMany({ where: { itemId: params.id } })
    await prisma.item.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}