export default async function handleSegment(env, alias, segFile) {
  const segId = segFile.replace(/\.ts$/, '')

  // Ambil seluruh mapping
  const mapJson = await env.PROXY_MAP.get(`${alias}:map`)
  if (!mapJson) {
    return new Response('Mapping not found', { status: 404 })
  }

  let map
  try {
    map = JSON.parse(mapJson)
  } catch (e) {
    return new Response('Invalid map format', { status: 500 })
  }

  const url = map.seg?.[segId]
  if (!url) {
    return new Response('Segment not found', { status: 404 })
  }

  const res = await fetch(url)
  if (!res.ok) {
    return new Response('Failed to fetch segment', { status: 502 })
  }

  const headers = new Headers(res.headers)
    headers.set('Content-Type', 'video/mp2t')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Accept-Ranges', 'bytes')
  return new Response(res.body, {
    status: res.status,
    headers
  })
}