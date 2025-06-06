export default async function handleM3U8(request, env, alias) {
  const raw = await env.PROXY_MAP.get(`${alias}:map`)
  if (!raw) return new Response('Alias not found', { status: 404 })

  const data = JSON.parse(raw)
  return new Response(data.final, {
    headers: { 'Content-Type': 'application/vnd.apple.mpegurl' }
  })
}