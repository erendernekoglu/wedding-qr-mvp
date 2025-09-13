const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id'

async function driveFetch(path: string, init: RequestInit, accessToken: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...(init.headers || {})
  }
  return fetch(`${DRIVE_API}${path}`, { ...init, headers })
}

export async function ensureAlbumFolder(accessToken: string, rootFolderId: string, code: string) {
  // var mı diye ara
  const q = encodeURIComponent(`name = 'album_${code}' and '${rootFolderId}' in parents and trashed = false`)
  const r = await driveFetch(`/files?q=${q}&fields=files(id,name)`, { method: 'GET' }, accessToken)
  if (!r.ok) throw new Error('Drive list hatası')
  const { files } = await r.json() as { files: Array<{id: string, name: string}> }
  if (files?.[0]) return files[0].id

  // yoksa oluştur
  const meta = { name: `album_${code}`, mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId] }
  const create = await driveFetch(`/files?fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meta)
  }, accessToken)
  if (!create.ok) throw new Error('Drive klasör oluşturulamadı')
  const { id } = await create.json() as { id: string }
  return id
}

export async function startResumable(accessToken: string, opts: {
  name: string,
  size: number,
  mimeType: string,
  parentFolderId: string
}) {
  const meta = {
    name: opts.name,
    parents: [opts.parentFolderId]
  }
  const resp = await fetch(UPLOAD_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': opts.mimeType,
      'X-Upload-Content-Length': String(opts.size)
    },
    body: JSON.stringify(meta)
  })
  if (!resp.ok) {
    const t = await resp.text()
    throw new Error(`Resumable init başarısız: ${t}`)
  }
  const uploadUrl = resp.headers.get('location')
  if (!uploadUrl) throw new Error('Upload URL gelmedi')
  return uploadUrl
}
