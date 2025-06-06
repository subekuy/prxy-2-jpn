import { nanoid } from './utils'

export default async function handleM3U8(request, env, alias) {
  try {
    const originalUrl = await env.PROXY_KE2.get(`${alias}:m3u8`)
    if (!originalUrl) {
      return new Response(`Alias not found: ${alias}`, { status: 404 })
    }

    const res = await fetch(originalUrl)
    if (!res.ok) {
      return new Response(`Failed to fetch original m3u8 (${res.status}): ${originalUrl}`, { status: 502 })
    }

    const originalText = await res.text()
    const lines = originalText.split('\n')
    const rewritten = []
    let segCounter = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

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

      if (!line.startsWith('#') && line.trim() !== '') {
        const segUrl = new URL(line, originalUrl).href
        const segId = nanoid()
        await env.PROXY_KE2.put(`${alias}:seg:${segId}`, segUrl)
        rewritten.push(`/${alias}/s/${segId}.ts`)
        segCounter++
      } else {
        rewritten.push(line)
      }
    }

    return new Response(rewritten.join('\n'), {
      headers: { 'Content-Type': 'application/vnd.apple.mpegurl' }
    })
  } catch (err) {
    return new Response('Error in m3u8 handler:\n' + err.stack, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}