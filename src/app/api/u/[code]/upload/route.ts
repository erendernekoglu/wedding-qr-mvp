import { NextRequest } from 'next/server'
import { getServiceAccountAccessToken } from '@/lib/google-service'
import { ensureAlbumFolder, startResumable } from '@/lib/drive'
import { kvDb } from '@/lib/kv-db'

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const albumCode = formData.get('albumCode') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    console.log(`[UPLOAD] Album: ${albumCode}, File: ${file.name}`)

    // Album var mı kontrol et
    const album = await kvDb.album.findUnique({ code: albumCode })

    if (!album) {
      return new Response(
        JSON.stringify({ error: 'Album not found' }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // Environment variables kontrol et
    const requiredEnvs = ['GOOGLE_SERVICE_ACCOUNT_KEY', 'DRIVE_ROOT_FOLDER_ID']
    const missingEnvs = requiredEnvs.filter(env => !process.env[env])
    
    if (missingEnvs.length > 0) {
      console.log('[UPLOAD] Missing environment variables:', missingEnvs)
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error', 
          details: `Missing environment variables: ${missingEnvs.join(', ')}` 
        }),
        {
          status: 500,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // Google Drive'a upload
    const accessToken = await getServiceAccountAccessToken()
    const rootId = process.env.DRIVE_ROOT_FOLDER_ID!
    const folderId = await ensureAlbumFolder(accessToken, rootId, albumCode)

    const uploadUrl = await startResumable(accessToken, {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      parentFolderId: folderId
    })

    // Dosyayı Google Drive'a upload et
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': file.size.toString()
      },
      body: file
    })

    if (!uploadResponse.ok) {
      throw new Error('Google Drive upload failed')
    }

    const uploadResult = await uploadResponse.json()
    const fileId = uploadResult.id

    if (!fileId) {
      throw new Error('No file ID returned from Google Drive')
    }

    // Veritabanına kaydet
    const dbFile = await kvDb.file.create({
      fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      albumId: album.id
    })

    console.log(`[UPLOAD] File uploaded successfully: ${file.name} (${fileId})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId,
        id: dbFile.id
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )
  } catch (e: any) {
    console.error('[UPLOAD] Error:', e.message, e.stack)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'Upload failed',
        details: e.stack || 'Check server logs for more information'
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
}