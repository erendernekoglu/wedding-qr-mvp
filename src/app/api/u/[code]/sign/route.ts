import { NextRequest } from 'next/server'
import { jsonRes } from '@/lib/utils'
import { getAccessToken } from '@/lib/google'
import { ensureAlbumFolder, startResumable } from '@/lib/drive'
import { z } from 'zod'

const signRequestSchema = z.object({
  filename: z.string().min(1).max(200),
  size: z.number().min(1).max(2_000_000_000),
  mimeType: z.string().min(1).max(100)
})

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const body = await req.json()
    const validation = signRequestSchema.safeParse(body)
    
    if (!validation.success) {
      console.log('[UPLOAD] Validation failed:', validation.error.errors)
      return new Response(
        JSON.stringify({ 
          error: 'invalid body', 
          details: validation.error.errors 
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    const { filename, size, mimeType } = validation.data
    
    // Log for traceability
    console.log(`[UPLOAD] Album: ${params.code}, File: ${filename}`)

    // Check environment variables
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

    const accessToken = await getAccessToken()
    const rootId = process.env.DRIVE_ROOT_FOLDER_ID!
    const folderId = await ensureAlbumFolder(accessToken, rootId, params.code)

    const uploadUrl = await startResumable(accessToken, {
      name: filename,
      size,
      mimeType,
      parentFolderId: folderId
    })

    return new Response(
      JSON.stringify({ uploadUrl }),
      {
        status: 200,
        headers: { 
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    )
  } catch (e: any) {
    console.log('[UPLOAD] Error:', e.message)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'unknown',
        details: 'Check server logs for more information'
      }),
      {
        status: 500,
        headers: { 
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    )
  }
}
