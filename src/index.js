export default {
  async fetch(request) {
    const url = new URL(request.url);

    const srcUrl = url.searchParams.get('url');
    const base = url.searchParams.get('base');
    const seg = url.searchParams.get('seg');

    // Handle request untuk segmen .ts
    if (base && seg) {
      const tsUrl = decodeURIComponent(base) + decodeURIComponent(seg);
      return fetch(tsUrl, {
        headers: {
          'Referer': decodeURIComponent(base), // lebih aman dikirim
        }
      });
    }

    // Handle request untuk file .m3u8
    if (srcUrl) {
      const res = await fetch(srcUrl);
      if (!res.ok) return new Response("Failed to fetch m3u8", { status: 502 });

      const baseURL = srcUrl.split('/').slice(0, -1).join('/') + '/';
      const text = await res.text();

      const proxied = text.split('\n').map(line => {
        line = line.trim();
        if (line === '' || line.startsWith('#')) return line;

        try {
          const parsed = new URL(line);
          // Jika baris adalah URL absolut
          const segPath = parsed.pathname.split('/').pop() + (parsed.search || '');
          const basePath = parsed.href.slice(0, parsed.href.lastIndexOf('/') + 1);
          return `${url.origin}/proxy?base=${encodeURIComponent(basePath)}&seg=${encodeURIComponent(segPath)}`;
        } catch {
          // Jika baris relatif
          return `${url.origin}/proxy?base=${encodeURIComponent(baseURL)}&seg=${encodeURIComponent(line)}`;
        }
      }).join('\n');

      return new Response(proxied, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
        },
      });
    }

    return new Response("Usage: /proxy?url=...", { status: 400 });
  }
}