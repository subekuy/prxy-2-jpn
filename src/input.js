export default function handleFormPage() {
  const html = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Submit Your M3U8 URL</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    
    </head>
    <body>
        <div class="container">
            <div class="row text-center my-5">
                <div class="col">
                    <h2>Submit M3U8 URL untuk Proxy</h2>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="card">
                        <div class="card-body">
                            <form id="proxyForm" method="POST" action="/submit">
                                <div class="mb-3">
                                    <label for="inputAlias" class="form-label">Alias (contoh: video123):</label>
                                    <input type="text" name="alias" required pattern="[a-zA-Z0-9_-]+" placeholder="ani or something" class="form-control" id="inputAlias">
                                </div>
                                <div class="mb-3">
                                    <label for="inputURL" class="form-label">URL M3U8 asli:</label>
                                    <input type="url" name="url" required placeholder="https://example.com/playlist.m3u8" class="form-control" id="inputURL">
                                </div>
                                <div class="mb-3">
                                    <label for="selectType" class="form-label">Jenis Proxy:</label>
                                    <select name="type" required class="form-select form-select" id="selectType">
                                        <option value="vod" selected>Video on Demand (VOD) (only for AES-128)</option>
                                        <option value="live">Live Streaming</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary">Submit</button>
                                </form>
                        
                            <div id="response" class="my-3"></div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div> <!-- container -->
        
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
                    responseDiv.textContent = res.ok ? text: 'Error: ' + text
            }
            catch (err) {
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