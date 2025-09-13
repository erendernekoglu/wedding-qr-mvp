import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('[TEST] Upload endpoint called')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test upload endpoint works!',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )
  } catch (e: any) {
    console.error('[TEST] Error:', e.message)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'Test failed',
        details: 'Check server logs'
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
}
