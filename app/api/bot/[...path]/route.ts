// Server-side proxy to the FastAPI /bot/* endpoints. Keeps the API origin private
// and avoids CORS. The Groq key lives only on the backend.
const ALLOWED = new Set(['chat', 'locate', 'packages', 'tip'])

async function proxy(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  if (path.length !== 1 || !ALLOWED.has(path[0]))
    return Response.json({ detail: 'not found' }, { status: 404 })
  const base = (process.env.SPHEREX_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
  const url = `${base}/bot/${path[0]}${new URL(request.url).search}`
  const isPost = request.method === 'POST'
  try {
    const body = isPost ? await request.text() : undefined
    if (body && body.length > 8_000)
      return Response.json({ detail: 'message too long' }, { status: 413 })
    const upstream = await fetch(url, {
      method: request.method,
      headers: isPost ? { 'Content-Type': 'application/json' } : undefined,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(45_000),
    })
    return new Response(await upstream.text(), {
      status: upstream.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return Response.json({ detail: 'guide unavailable' }, { status: 502 })
  }
}
export { proxy as GET, proxy as POST }
