import { NextRequest } from 'next/server'
import { getAccessToken } from '@/lib/google'
import { ensureAlbumFolder, startResumable } from '@/lib/drive'
import { kvDb } from '@/lib/kv-db'

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const eventCode = params.code

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    console.log(`[UPLOAD] Event: ${eventCode}, File: ${file.name}`)

    // Event var mı kontrol et
    const event = await kvDb.event.findUnique({ code: eventCode })

    if (!event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // Event aktif mi kontrol et
    if (!event.isActive) {
      return new Response(
        JSON.stringify({ error: 'Event is not active' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // Dosya limiti kontrol et
    if (event.maxFiles && event.currentFiles >= event.maxFiles) {
      return new Response(
        JSON.stringify({ error: 'File limit reached' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // Dosya boyutu kontrol et
    if (event.maxFileSize && file.size > event.maxFileSize * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: `File too large. Max size: ${event.maxFileSize}MB` }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // Environment variables kontrol et
    const requiredEnvs = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'DRIVE_ROOT_FOLDER_ID']
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
    const accessToken = await getAccessToken()
    const rootId = process.env.DRIVE_ROOT_FOLDER_ID!
    const folderId = await ensureAlbumFolder(accessToken, rootId, eventCode)

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

    // Event dosya sayısını artır
    await kvDb.event.incrementFileCount(eventCode, {
      userId: 'anonymous',
      userAgent: req.headers.get('user-agent') || 'unknown',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      action: 'file_upload',
      fileCount: 1
    })

    console.log(`[UPLOAD] File uploaded successfully: ${file.name} (${fileId})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId,
        eventCode
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