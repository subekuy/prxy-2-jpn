export default async function handleSegment(env, alias, segFile) {
  const segId = segFile.replace(/\.ts$/, '')
  const url = await env.PROXY_KE2.get(`${alias}:seg:${segId}`)

  if (!url) {
    return new Response('Segment not found', { status: 404 })
  }

  const res = await fetch(url)
  if (!res.ok) {
    return new Response('Failed to fetch segment', { status: 502 })
  }

  const headers = new Headers(res.headers)
  headers.set('Content-Type', 'video/MP2T') // MIME type TS

  return new Response(res.body, {
    status: res.status,
    headers
  })
}