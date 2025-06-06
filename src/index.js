export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const srcUrl = url.searchParams.get('url');
    const base = url.searchParams.get('base');
    const seg = url.searchParams.get('seg');

    if (base && seg) {
      const tsUrl = base + seg;
      return fetch(tsUrl, {
        headers: {
          'Referer': base,
        }
      });
    }

    if (srcUrl) {
      const res = await fetch(srcUrl);
      if (!res.ok) return new Response("Failed to fetch m3u8", { status: 500 });

      const baseURL = srcUrl.split('/').slice(0, -1).join('/') + '/';
      const text = await res.text();

      const proxied = text.split('\n').map(line => {
        line = line.trim();
        if (line === '' || line.startsWith('#')) return line;
        const fullLine = line.startsWith('http') ? line : baseURL + line;
        return `${url.origin}/proxy?base=${encodeURIComponent(baseURL)}&seg=${encodeURIComponent(line)}`;
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