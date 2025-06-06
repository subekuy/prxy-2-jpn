export default async function handleKey(env, alias, keyFile) {
  const keyId = keyFile.replace(/\.key$/, '')
  const url = await env.PROXY_KE2.get(`${alias}:key:${keyId}`)

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