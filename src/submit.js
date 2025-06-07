import { nanoid } from './utils'

export default async function handleSubmit(request, env) {
  const form = await request.formData()
  const url = form.get('url')
  const alias = form.get('alias')

  if (!url || !alias || !/^https?:\/\//.test(url)) {
    return new Response('Invalid input', { status: 400 })
  }

  const res = await fetch(url)
  if (!res.ok) {
    return new Response('Gagal fetch m3u8 asli', { status: 502 })
  }

  const originalText = await res.text()
  const lines = originalText.split('\n')
  const rewritten = []
  const segMap = {}
  const keyMap = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('#EXT-X-KEY')) {
  const uriMatch = line.match(/URI="([^"]+)"/)
  if (uriMatch) {
    const keyUrl = new URL(uriMatch[1], url).href
    const keyId = nanoid()
    keyMap[keyId] = keyUrl
    const newLine = line.replace(uriMatch[1], `/${alias}/key/${keyId}.key`)
    rewritten.push(newLine)
    continue
  }
}

        if (!line.startsWith('#') && line.trim() !== '') {
  try {
    const segUrl = new URL(line, url).href
    const segId = nanoid()
    segMap[segId] = segUrl
    rewritten.push(`/${alias}/s/${segId}.ts`)
  } catch (err) {
    // Abaikan baris yang gak valid
    rewritten.push(line)
  }
}
  }

  const mapping = JSON.stringify({
    m3u8: url,
    seg: segMap,
    key: keyMap,
    final: rewritten.join('\n'),
  })

  await env.PROXY_MAP.put(`${alias}:map`, mapping)

  return new Response(`Alias "${alias}" berhasil disimpan! Akses: /${alias}/index.m3u8`)
}