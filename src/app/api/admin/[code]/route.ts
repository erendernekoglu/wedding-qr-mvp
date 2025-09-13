import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    // Album bilgilerini al
    const album = await prisma.album.findUnique({
      where: { code },
      include: {
        files: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!album) {
      return new Response(
        JSON.stringify({ error: 'Album bulunamadı' }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    // İstatistikleri hesapla
    const fileCount = album.files.length
    const totalSize = album.files.reduce((sum, file) => sum + file.size, 0)

    const albumData = {
      code: album.code,
      name: album.name,
      createdAt: album.createdAt.toISOString(),
      fileCount,
      totalSize
    }

    const filesData = album.files.map(file => ({
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
