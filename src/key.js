export default async function handleKey(env, alias, keyFile) {
  const keyId = keyFile.replace(/\.key$/, '')

  // Ambil mapping utama
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

  const url = map.key?.[keyId]
  if (!url) {
    return new Response('Key not found', { status: 404 })
  }

  const res = await fetch(url)
  if (!res.ok) {
    return new Response('Failed to fetch key', { status: 502 })
  }

  const headers = new Headers(res.headers)
  headers.set('Content-Type', 'application/octet-stream')

  return new Response(res.body, {
    status: res.status,
    headers
  })
}