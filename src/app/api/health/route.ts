import { kvDb } from '@/lib/kv-db'

export async function GET() {
  try {
    // Redis bağlantısını test et
    await kvDb.album.findUnique({ code: 'health-check' })
    
    return new Response(
      JSON.stringify({ 
        ok: true, 
        timestamp: new Date().toISOString(),
        services: {
          redis: 'healthy',
          google_drive: 'not_checked'
        }
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      }
    )
  } catch (e: any) {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: e.message || 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json'
        }
      }
    )
  }
}
