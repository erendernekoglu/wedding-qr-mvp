import { NextRequest } from 'next/server'
import { getAccessToken } from '@/lib/google'
import { ensureAlbumFolder, startResumable } from '@/lib/drive'
import { kvDb } from '@/lib/kv-db'
import { AppError, ERROR_CODES, createErrorResponse, validateEnvironment, checkRateLimit } from '@/lib/error-handler'

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    checkRateLimit(`upload:${clientIP}`, 50, 60000) // 50 uploads per minute per IP

    // Environment validation
    validateEnvironment()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const eventCode = params.code

    if (!file) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'No file provided', 400)
    }

    console.log(`[UPLOAD] Event: ${eventCode}, File: ${file.name}`)

    // Event var mı kontrol et
    const event = await kvDb.event.findUnique({ code: eventCode })

    if (!event) {
      throw new AppError(ERROR_CODES.EVENT_NOT_FOUND, 'Event not found', 404)
    }

    // Event aktif mi kontrol et
    if (!event.isActive) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Event is not active', 400)
    }

    // Dosya limiti kontrol et
    if (event.maxFiles && event.currentFiles >= event.maxFiles) {
      throw new AppError(ERROR_CODES.FILE_LIMIT_REACHED, 'File limit reached', 400)
    }

    // Dosya boyutu kontrol et
    if (event.maxFileSize && file.size > event.maxFileSize * 1024 * 1024) {
      throw new AppError(ERROR_CODES.FILE_TOO_LARGE, `File too large. Max size: ${event.maxFileSize}MB`, 400)
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
      throw new AppError(ERROR_CODES.GOOGLE_DRIVE_ERROR, 'Google Drive upload failed', 500)
    }

    const uploadResult = await uploadResponse.json()
    const fileId = uploadResult.id

    if (!fileId) {
      throw new AppError(ERROR_CODES.GOOGLE_DRIVE_ERROR, 'No file ID returned from Google Drive', 500)
    }

    // Event dosya sayısını artır
    await kvDb.event.incrementFileCount(eventCode, {
      userId: 'anonymous',
      userAgent: req.headers.get('user-agent') || 'unknown',
      ipAddress: clientIP,
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
  } catch (error: any) {
    console.error('[UPLOAD] Error:', error)
    return createErrorResponse(error)
  }
}