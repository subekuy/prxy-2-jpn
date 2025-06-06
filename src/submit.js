export default async function handleSubmit(request, env) {
  const form = await request.formData()
  const url = form.get('url')
  const alias = form.get('alias')

  if (!url || !alias || !/^https?:\/\//.test(url)) {
    return new Response('Invalid input', { status: 400 })
  }

  // Simpan ke KV
  await env.PROXY_KE2.put(`${alias}:m3u8`, url)

  return new Response(`Alias "${alias}" berhasil disimpan! Akses: /${alias}/index.m3u8`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}