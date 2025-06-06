import { nanoid } from './utils'

export default async function handleM3U8(request, env, alias) {
  const originalUrl = await env.PROXY_KE2.get(`${alias}:m3u8`)
  if (!originalUrl) {
    return new Response('Alias not found', { status: 404 })
  }

  const res = await fetch(originalUrl)
  if (!res.ok) {
    return new Response('Failed to fetch m3u8', { status: 502 })
  }

  const originalText = await res.text()
  const lines = originalText.split('\n')
  const rewritten = []
  let segCounter = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // AES-128 Key Line
    if (line.startsWith('#EXT-X-KEY')) {
      const uriMatch = line.match(/URI="([^"]+)"/)
      if (uriMatch) {
        const keyUrl = uriMatch[1]
        const keyId = nanoid()
        await env.PROXY_KE2.put(`${alias}:key:${keyId}`, keyUrl)

        const newLine = line.replace(uriMatch[1], `/${alias}/key/${keyId}.key`)
        rewritten.push(newLine)
        continue
      }
    }

    // Segment (.ts) URL
    if (!line.startsWith('#') && line.trim() !== '') {
      const segUrl = new URL(line, originalUrl).href // handle relative path
      const segId = nanoid()
      await env.PROXY_KE2.put(`${alias}:seg:${segId}`, segUrl)
      rewritten.push(`/${alias}/s/${segId}.ts`)
      segCounter++
    } else {
      rewritten.push(line)
    }
  }

  return new Response(rewritten.join('\n'), {
    headers: {
      'Content-Type': 'application/vnd.apple.mpegurl'
    }
  })
}