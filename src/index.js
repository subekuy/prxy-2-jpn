import handleFormPage from './input' // form html
import handleSubmit from './submit' // vod
import handleM3U8 from './m3u8'
import handleSegment from './segment'
import handleKey from './key'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const { pathname } = url

    // INPUT PAGE: GET /
    if (request.method === 'GET' && pathname === '/') {
      return handleFormPage()
    }

    // FORM SUBMIT: POST /submit
    if (request.method === 'POST' && pathname === '/submit') {
      return handleSubmit(request, env)
    }

    // FETCH M3U8: GET /alias/index.m3u8
    const m3u8Match = pathname.match(/^\/([^/]+)\/index\.m3u8$/)
    if (m3u8Match) {
      const alias = m3u8Match[1]
      return handleM3U8(request, env, alias)
    }

    // FETCH SEGMENT: GET /alias/s/seg123.ts
    const segMatch = pathname.match(/^\/([^/]+)\/s\/([a-zA-Z0-9]+\.ts)$/)
    if (segMatch) {
      const [_, alias, segId] = segMatch
      return handleSegment(env, alias, segId)
    }

    // FETCH KEY: GET /alias/key/xyz123.key
    const keyMatch = pathname.match(/^\/([^/]+)\/key\/([a-zA-Z0-9]+\.key)$/)
    if (keyMatch) {
      const [_, alias, keyId] = keyMatch
      return handleKey(env, alias, keyId)
    }

    return new Response('Not Found', { status: 404 })
  }
}