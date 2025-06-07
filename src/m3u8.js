import { nanoid } from './utils'

export default async function handleM3U8(request, env, alias) {
  const raw = await env.PROXY_MAP.get(`${alias}:map`)
  if (!raw) return new Response('Alias not found', { status: 404 })

  const data = JSON.parse(raw)

  if (data.live) {
    // LIVE MODE: Fetch ulang m3u8
    const res = await fetch(data.m3u8)
    if (!res.ok) return new Response('Gagal fetch m3u8 live', { status: 502 })

    const originalText = await res.text()
    const lines = originalText.split('\n')
    const rewritten = []
    const segMap = {}

    for (let line of lines) {
      if (!line.startsWith('#') && line.trim() !== '') {
        try {
          const segUrl = new URL(line, data.m3u8).href
          const segId = nanoid()
          segMap[segId] = segUrl
          rewritten.push(`/${alias}/s/${segId}.ts`)
          // kamu bisa optionally simpan ke KV jika ingin reuse
          await env.PROXY_MAP.put(`${alias}:seg:${segId}`, segUrl, { expirationTtl: 300 })
        } catch {
          rewritten.push(line)
        }
      } else {
        rewritten.push(line)
      }
    }

    return new Response(rewritten.join('\n'), {
      headers: { 'Content-Type': 'application/vnd.apple.mpegurl' }
    })
  }

  // VOD mode
  return new Response(data.final, {
    headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Range, Content-Type, Accept',
        'Access-Control-Expose-Headers': 'Content-Length',
        'Accept-Ranges': 'bytes'
        
        }
  })
}