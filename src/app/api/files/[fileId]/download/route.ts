import { NextRequest } from 'next/server'
import { getAccessToken } from '@/lib/google'

export async function GET(req: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const { fileId } = params
    
    const accessToken = await getAccessToken()
    
    // Google Drive'dan dosyayı indir
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Dosya indirilemedi')
    }

    const buffer = await response.arrayBuffer()
    
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment'
      }
    })
  } catch (e: any) {
    console.error('[DOWNLOAD] Error:', e.message)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'Dosya indirilemedi',
        details: 'Sunucu hatası'
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
}
