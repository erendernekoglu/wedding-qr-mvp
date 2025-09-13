import { NextRequest } from 'next/server'
import { z } from 'zod'
import { kvDb } from '@/lib/kv-db'

const createAlbumSchema = z.object({
  code: z.string().min(3).max(10).regex(/^[A-Z0-9]+$/, 'Sadece büyük harf ve rakam kullanılabilir')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = createAlbumSchema.safeParse(body)
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Geçersiz album kodu', 
          details: validation.error.errors 
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    const { code } = validation.data
    
    // Kod kontrolü
    const existingAlbum = await kvDb.album.findUnique({ code })
    if (existingAlbum) {
      return new Response(
        JSON.stringify({ error: 'Bu kod zaten kullanılıyor' }),
        { status: 409, headers: { 'content-type': 'application/json' } }
      )
    }

    // Album oluştur
    const album = await kvDb.album.create({
      code,
      name: `Album ${code}`,
      isActive: true
    })

    console.log(`[ALBUM] Created album with code: ${code}`)
    
    return new Response(
      JSON.stringify({ 
        code: album.code,
        message: 'Album başarıyla oluşturuldu',
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/u/${album.code}`
      }),
      {
        status: 201,
        headers: { 'content-type': 'application/json' }
      }
    )
  } catch (e: any) {
    console.error('[ALBUM] Create error:', e.message)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'Album oluşturulamadı',
        details: 'Sunucu hatası'
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
}
