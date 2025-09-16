import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { getAccessToken } from '@/lib/google'
import { createErrorResponse } from '@/lib/error-handler'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'

async function driveFetch(path: string, init: RequestInit, accessToken: string) {
  const headers = { ...init.headers, Authorization: `Bearer ${accessToken}` }
  return fetch(`${DRIVE_API}${path}`, { ...init, headers })
}

export async function GET(req: NextRequest, { params }: { params: { eventCode: string } }) {
  try {
    const eventCode = params.eventCode
    const { searchParams } = new URL(req.url)
    const tableNumber = parseInt(searchParams.get('table') || '1')

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

    // Google Drive'dan masa fotoğraf sayısını çek
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
          data: {
            tableNumber,
            photoCount: 0,
            tableName: `Masa ${tableNumber}`
          }
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    const eventFolderId = eventFolders[0].id

    // Masa ismini al
    const tableNames = event.tableNames || Array.from({ length: event.tableCount || 5 }, (_, i) => `Masa ${i + 1}`)
    const tableName = tableNames[tableNumber - 1] || `Masa ${tableNumber}`
    
    // Masa klasörünü bul
    const tableFolderQuery = encodeURIComponent(`name = '${tableName}' and '${eventFolderId}' in parents and trashed = false`)
    const tableFolderResponse = await driveFetch(`/files?q=${tableFolderQuery}&fields=files(id,name)`, { method: 'GET' }, accessToken)
    
    if (!tableFolderResponse.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            tableNumber,
            photoCount: 0,
            tableName
          }
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    }
    
    const { files: tableFolders } = await tableFolderResponse.json() as { files: Array<{id: string, name: string}> }
    
    if (!tableFolders?.[0]) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            tableNumber,
            photoCount: 0,
            tableName
          }
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    }
    
    const tableFolderId = tableFolders[0].id
    
    // Masa klasöründeki fotoğraf sayısını al
    const photosQuery = encodeURIComponent(`'${tableFolderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`)
    const photosResponse = await driveFetch(`/files?q=${photosQuery}&fields=files(id)`, { method: 'GET' }, accessToken)
    
    if (!photosResponse.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            tableNumber,
            photoCount: 0,
            tableName
          }
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    }
    
    const { files: tablePhotos } = await photosResponse.json() as { files: Array<{id: string}> }
    const photoCount = tablePhotos?.length || 0

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tableNumber,
          photoCount,
          tableName
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[TABLE_STATS] Error:', error)
    return createErrorResponse(error)
  }
}
