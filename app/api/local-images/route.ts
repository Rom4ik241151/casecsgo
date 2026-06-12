import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'cases')
  const files = fs.readdirSync(dir).filter(f =>
    /\.(png|jpg|jpeg|webp|gif)$/i.test(f)
  )
  return NextResponse.json(files.map(f => `/cases/${f}`))
}