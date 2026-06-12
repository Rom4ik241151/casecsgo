import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cases — список всех кейсов с предметами
export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      include: { items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(cases)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/cases — создать новый кейс
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, price, image, items } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Название и цена обязательны' }, { status: 400 })
    }

    const newCase = await prisma.case.create({
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

    return NextResponse.json(newCase)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}