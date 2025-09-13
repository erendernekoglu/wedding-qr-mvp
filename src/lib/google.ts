const TOKEN_URL = 'https://oauth2.googleapis.com/token'

export async function getAccessToken() {
  const {
    GOOGLE_CLIENT_ID: client_id,
    GOOGLE_CLIENT_SECRET: client_secret,
    GOOGLE_REFRESH_TOKEN: refresh_token
  } = process.env

  if (!client_id || !client_secret || !refresh_token) {
    throw new Error('Google OAuth env eksik')
  }

  const body = new URLSearchParams({
    client_id,
    client_secret,
    refresh_token,
    grant_type: 'refresh_token'
  })

  const resp = await fetch(TOKEN_URL, { method: 'POST', body })
  if (!resp.ok) throw new Error('Access token alınamadı')
  const json = await resp.json() as { access_token: string, expires_in: number }
  return json.access_token
}
