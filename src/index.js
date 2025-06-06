export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    // ==========================
    // 1. FORM INPUT
    // ==========================
    if (request.method === "GET" && path === "/") {
      return new Response(`
        <!doctype html><html><head><title>Proxy Generator</title></head><body>
        <h2>Generate Video Proxy</h2>
        <form method="POST">
  <label>Video URL:<br><input name="video" required style="width:100%"></label><br><br>
  <label>Audio URL:<br><input name="audio" required style="width:100%"></label><br><br>
  <label>Kategori/Label:<br><input name="alias" required style="width:100%"></label><br><br>
  <label>Filename (optional):<br><input name="filename" style="width:100%"></label><br><br>
  <button type="submit">Generate Proxy</button>
</form>
        </body></html>
      `, {
        headers: { "Content-Type": "text/html" }
      })
    }

    // ==========================
    // 2. FORM SUBMIT → SIMPAN
    // ==========================
    if (request.method === "POST" && path === "/") {
      const formData = await request.formData()
      const videoUrl = formData.get("video")?.trim()
const audioUrl = formData.get("audio")?.trim()
      const filename = formData.get("filename")?.trim() || null
      const aliasRaw = formData.get("alias")?.trim() || ""
      const alias = aliasRaw // toUpperCase()

      if (!videoUrl?.startsWith("http") || !audioUrl?.startsWith("http")) {
  return new Response("Invalid video or audio URL", { status: 400 })
}

      if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
        return new Response("Invalid alias", { status: 400 })
      }

      const id = Math.random().toString(36).slice(2, 8)
      await env.PROXY_KE2.put(`proxy:${alias}:${id}`, JSON.stringify({ video: videoUrl, audio: audioUrl, filename }))

      const shortlink = `${url.origin}/${alias}/${id}`
      return new Response(`Shortlink created: <a href="${shortlink}">${shortlink}</a>`, {
        headers: { "Content-Type": "text/html" }
      })
    }

    // ==========================
    // 3. PROXY /ALIAS/ID/...
    // ==========================
    const match = path.match(/^\/([a-zA-Z0-9_-]+)\/([a-z0-9_-]+)(\/.*)?$/)
    if (match) {
      const alias = match[1] // toUpperCase()
      const id = match[2]
      const relPath = match[3]?.slice(1) || ""

      const entry = await env.PROXY_KE2.get(`proxy:${alias}:${id}`, "json")
      if (!entry || !entry.video) return new Response("Not found", { status: 404 })

const base = new URL(entry.video)
      const targetUrl = relPath ? new URL(relPath, base) : base

      const rangeHeader = request.headers.get("Range")
      const originResp = await fetch(targetUrl.href, {
        headers: rangeHeader ? { "Range": rangeHeader } : {}
      })

      const contentType = originResp.headers.get("Content-Type") || ""

      // Kalau .m3u8 → parse & rewrite
if (relPath.toLowerCase() === "index.m3u8") {
  // playlist master gabungan
  const { video, audio } = entry
  const master = `#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Audio",DEFAULT=YES,AUTOSELECT=YES,URI="/${alias}/${id}/audio.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=3000000,AUDIO="audio"
/${alias}/${id}/video.m3u8`

  return new Response(master, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*"
    }
  })
}
      // ambil playlist video/audio → rewrite segmennya
if (targetUrl.pathname.endsWith(".m3u8")) {
  const text = await originResp.text()

  const rewritten = text.replace(/^(?!#)([^\s?#]+)(.*)$/gm, (_, segment, extra) => {
    return `/${alias}/${id}/${segment}${extra}`
  })

  return new Response(rewritten, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*"
    }
  })
}

      // Kalau .ts atau file lain → stream langsung
      const headers = new Headers(originResp.headers)
      headers.set("Access-Control-Allow-Origin", "*")
      headers.set("Accept-Ranges", "bytes")

      if (originResp.ok && entry.filename) {
        headers.set("Content-Disposition", `inline; filename="${entry.filename}"`)
      }

      return new Response(originResp.body, {
        status: originResp.status,
        headers
      })
    }

    // ==========================
    // 404 fallback
    // ==========================
    return new Response("Not found", { status: 404 })
  }
}

