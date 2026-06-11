import { NextRequest } from 'next/server'

const clients = new Map<string, ReadableStreamDefaultController>()

export async function GET(req: NextRequest) {
  const id = Math.random().toString(36).slice(2)
  const stream = new ReadableStream({
    start(controller) {
      clients.set(id, controller)
      controller.enqueue(new TextEncoder().encode(`data: ${clients.size}\n\n`))
      broadcast()
      req.signal.addEventListener('abort', () => {
        clients.delete(id)
        broadcast()
        try { controller.close() } catch {}
      })
    }
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

function broadcast() {
  const data = new TextEncoder().encode(`data: ${clients.size}\n\n`)
  clients.forEach((client, id) => {
    try { client.enqueue(data) } catch { clients.delete(id) }
  })
}