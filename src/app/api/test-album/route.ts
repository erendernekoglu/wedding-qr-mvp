import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'

export async function POST(req: NextRequest) {
  try {
    console.log('[TEST] Album creation test started')
    
    // Basit album oluşturma testi
    const testAlbum = await kvDb.album.create({
      code: 'TEST123',
      name: 'Test Album',
      isActive: true
    })
    
    console.log('[TEST] Album created:', testAlbum)
    
    // Album'u bulma testi
    const foundAlbum = await kvDb.album.findUnique({ code: 'TEST123' })
    
    console.log('[TEST] Album found:', foundAlbum)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Album creation test successful!',
        created: testAlbum,
        found: foundAlbum,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )
  } catch (e: any) {
    console.error('[TEST] Album creation error:', e.message, e.stack)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'Album creation test failed',
        details: e.stack || 'Check server logs',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
}
