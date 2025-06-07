import handleSubmitVod from './submitVod'
import handleSubmitLive from './submitLive'

export default async function handleSubmit(request, env) {
  const form = await request.formData()
  const type = form.get('type') || 'vod'

  // lempar ulang ke handler sesuai tipe
  if (type === 'live') {
    return handleSubmitLive(form, env)
  } else {
    return handleSubmitVod(form, env)
  }
}