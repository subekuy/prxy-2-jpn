import { nanoid } from './utils'

export default async function handleSubmitLive(form, env) {
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (!line.startsWith('#') && line.trim() !== '') {
      try {
        const segUrl = new URL(line, url).href
        const segId = nanoid()
        segMap[segId] = segUrl
        rewritten.push(`/${alias}/s/${segId}.ts`)
      } catch (err) {
        rewritten.push(line)
      }
    } else {
      rewritten.push(line)
    }
  }

  const mapping = JSON.stringify({
    m3u8: url,
    seg: segMap,
    key: {}, // live biasanya gak pakai key, tapi disiapkan
    final: rewritten.join('\n'),
    live: true
  })

  await env.PROXY_MAP.put(`${alias}:map`, mapping)

  return new Response(`Live alias "${alias}" berhasil disimpan! Akses: /${alias}/index.m3u8`)
}