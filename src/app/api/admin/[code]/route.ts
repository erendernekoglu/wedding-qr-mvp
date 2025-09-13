import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    // Album bilgilerini al
    const album = await kvDb.album.findUnique({ code })

    if (!album) {
      return new Response(
        JSON.stringify({ error: 'Album bulunamadı' }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // Dosyaları al
    const files = await kvDb.file.findMany({ albumId: album.id })

    // İstatistikleri hesapla
    const fileCount = files.length
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    const albumData = {
      code: album.code,
      name: album.name,
      createdAt: album.createdAt.toISOString(),
      fileCount,
      totalSize
    }

    const filesData = files.map(file => ({
      id: file.id,
      fileId: file.fileId,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt.toISOString()
    }))

    return new Response(
      JSON.stringify({
        album: albumData,
        files: filesData
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )
  } catch (e: any) {
    console.error('[ADMIN] Error:', e.message)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'Veri alınamadı',
        details: 'Sunucu hatası'
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
}
