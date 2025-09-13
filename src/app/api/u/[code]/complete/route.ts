import { NextRequest } from 'next/server'
import { memoryDb } from '@/lib/memory-db'
import { z } from 'zod'

const completeRequestSchema = z.object({
  fileId: z.string().min(1),
  name: z.string().min(1).max(200),
  size: z.number().min(1),
  mimeType: z.string().min(1).max(100)
})

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const body = await req.json()
    const validation = completeRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Geçersiz veri', 
          details: validation.error.errors 
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    const { fileId, name, size, mimeType } = validation.data

    // Album var mı kontrol et
    const album = await memoryDb.album.findUnique({ code: params.code })

    if (!album) {
      return new Response(
        JSON.stringify({ error: 'Album bulunamadı' }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // Dosyayı veritabanına kaydet
    const file = await memoryDb.file.create({
      fileId,
      name,
      size,
      mimeType,
      albumId: album.id
    })

    console.log(`[UPLOAD] File completed: ${file.name} in album ${params.code}`)

    return new Response(
      JSON.stringify({ 
        ok: true, 
        code: params.code, 
        fileId: file.fileId,
        id: file.id
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )
  } catch (e: any) {
    console.error('[UPLOAD] Complete error:', e.message)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'Dosya kaydedilemedi',
        details: 'Sunucu hatası'
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
}
