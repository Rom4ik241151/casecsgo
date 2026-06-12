import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'Укажите ссылку Steam' }, { status: 400 })
    }

    // Делаем простой предмет — пока без реального парсинга Steam
    const name = url.split('/').pop() || 'Предмет'
    const image =
      'https://community.cloudflare.steamstatic.com/public/images/skin_illustrations/econ/default_generated_item.png'
    const price = 0

    const item = await prisma.item.create({
      data: { name, image, price, marketHash: url },
    })

    return NextResponse.json({ ok: true, item })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка импорта' }, { status: 500 })
  }
}