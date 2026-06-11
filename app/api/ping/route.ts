import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function POST(req: Request) {
  const { visitorId } = await req.json()
  
  if (visitorId) {
    await prisma.visitor.upsert({
      where: { id: visitorId },
      update: { lastSeen: new Date() },
      create: { id: visitorId }
    })
  }

  const thirtySecondsAgo = new Date(Date.now() - 30000)
  const count = await prisma.visitor.count({
    where: { lastSeen: { gte: thirtySecondsAgo } }
  })

  return NextResponse.json({ online: count })
}