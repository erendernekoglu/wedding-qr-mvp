import { NextRequest } from 'next/server'
import { getAccessToken } from '@/lib/google'
import { createErrorResponse } from '@/lib/error-handler'
import { kvDb } from '@/lib/kv-db'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'

async function driveFetch(path: string, init: RequestInit, accessToken: string) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    ...(init.headers || {})
  }
  return fetch(`${DRIVE_API}${path}`, { ...init, headers })
}

export async function GET(req: NextRequest, { params }: { params: { eventCode: string } }) {
  try {
    const eventCode = params.eventCode

    // Etkinliği bul
    const event = await kvDb.event.findUnique({ code: eventCode })
    
    if (!event) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Event not found'
        }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Google Drive'dan fotoğrafları çek
    const accessToken = await getAccessToken()
    const rootId = process.env.DRIVE_ROOT_FOLDER_ID!
    
    // Etkinlik klasörünü bul
    const eventFolderQuery = encodeURIComponent(`name = 'album_${eventCode}' and '${rootId}' in parents and trashed = false`)
    const eventFolderResponse = await driveFetch(`/files?q=${eventFolderQuery}&fields=files(id,name)`, { method: 'GET' }, accessToken)
    
    if (!eventFolderResponse.ok) {
      throw new Error('Drive event folder not found')
    }
    
    const { files: eventFolders } = await eventFolderResponse.json() as { files: Array<{id: string, name: string}> }
    
    if (!eventFolders?.[0]) {
      return new Response(
        JSON.stringify({
          success: true,
          data: []
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    const eventFolderId = eventFolders[0].id
    const photos: any[] = []

    // Her masa klasöründen fotoğrafları çek
    const tableNames = event.tableNames || Array.from({ length: event.tableCount || 5 }, (_, i) => `Masa ${i + 1}`)
    
    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i]
      
      // Masa klasörünü bul
      const tableFolderQuery = encodeURIComponent(`name = '${tableName}' and '${eventFolderId}' in parents and trashed = false`)
      const tableFolderResponse = await driveFetch(`/files?q=${tableFolderQuery}&fields=files(id,name)`, { method: 'GET' }, accessToken)
      
      if (!tableFolderResponse.ok) continue
      
      const { files: tableFolders } = await tableFolderResponse.json() as { files: Array<{id: string, name: string}> }
      
      if (!tableFolders?.[0]) continue
      
      const tableFolderId = tableFolders[0].id
      
      // Masa klasöründeki fotoğrafları çek
      const photosQuery = encodeURIComponent(`'${tableFolderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`)
      const photosResponse = await driveFetch(`/files?q=${photosQuery}&fields=files(id,name,mimeType,size,createdTime,webContentLink,thumbnailLink)`, { method: 'GET' }, accessToken)
      
      if (!photosResponse.ok) continue
      
      const { files: tablePhotos } = await photosResponse.json() as { 
        files: Array<{
          id: string
          name: string
          mimeType: string
          size: string
          createdTime: string
          webContentLink: string
          thumbnailLink?: string
        }>
      }
      
      // Fotoğrafları formatla
      tablePhotos.forEach(photo => {
        photos.push({
          id: photo.id,
          name: photo.name,
          url: photo.thumbnailLink || photo.webContentLink,
          downloadUrl: photo.webContentLink,
          tableNumber: i + 1,
          tableName: tableName,
          uploadedAt: photo.createdTime,
          size: parseInt(photo.size) || 0,
          mimeType: photo.mimeType
        })
      })
    }

    // Fotoğrafları tarihe göre sırala (en yeni önce)
    photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return new Response(
      JSON.stringify({
        success: true,
        data: photos
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[GALLERY] Error:', error)
    return createErrorResponse(error)
  }
}
