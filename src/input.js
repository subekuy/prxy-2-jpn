export default function handleFormPage() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Submit M3U8 Proxy</title>
</head>
<body>
  <h2>Submit M3U8 URL untuk Proxy</h2>
  <form id="proxyForm" method="POST" action="/submit">
    <label>
      Alias (contoh: video123):
      <input type="text" name="alias" required pattern="[a-zA-Z0-9_-]+" />
    </label>
    <br /><br />
    <label>
      URL M3U8 asli:
      <input type="url" name="url" required placeholder="https://example.com/playlist.m3u8" />
    </label>
    <br /><br />
    <button type="submit">Submit</button>
  </form>

  <div id="response"></div>

  <script>
    const form = document.getElementById('proxyForm')
    const responseDiv = document.getElementById('response')

    form.addEventListener('submit', async e => {
      e.preventDefault()
      responseDiv.textContent = 'Mengirim...'

      const formData = new FormData(form)
      try {
        const res = await fetch('/submit', {
          method: 'POST',
          body: formData
        })
        const text = await res.text()
        responseDiv.textContent = res.ok ? text : 'Error: ' + text
      } catch (err) {
        responseDiv.textContent = 'Fetch error: ' + err.message
      }
    })
  </script>
</body>
</html>
  `.trim()

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  })
}