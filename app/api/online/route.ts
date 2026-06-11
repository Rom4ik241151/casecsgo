import { NextRequest } from 'next/server'

const clients = new Set<ReadableStreamDefaultController>()

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)
      controller.enqueue(new TextEncoder().encode(`data: ${clients.size}\n\n`))
      broadcast()
      req.signal.addEventListener('abort', () => {
        clients.delete(controller)
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
  for (const client of clients) {
    try { client.enqueue(data) } catch { clients.delete(client) }
  }
}