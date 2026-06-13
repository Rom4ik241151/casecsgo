import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const c = await prisma.case.findUnique({
      where: { id: params.id },
      include: { items: { include: { item: true } } },
    })
    if (!c) return NextResponse.json({ error: 'Не найден' }, { status: 404 })
    return NextResponse.json(c)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { name, description, price, image, items } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Название и цена обязательны' }, { status: 400 })
    }

    // Удаляем старые предметы
    await prisma.caseItem.deleteMany({ where: { caseId: params.id } })

    // Обновляем кейс и добавляем новые предметы
    const updated = await prisma.case.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        price: Number(price),
        image: image || null,
        items: {
          create: (items ?? []).map((ci: { itemId: string; dropRate: number }) => ({
            itemId: ci.itemId,
            dropRate: Number(ci.dropRate) || 1,
          })),
        },
      },
      include: { items: { include: { item: true } } },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.caseItem.deleteMany({ where: { caseId: params.id } })
    await prisma.case.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}