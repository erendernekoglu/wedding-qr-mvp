import { NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

export async function GET() {
  try {
    console.log('[TEST] Redis connection test started')
    console.log('[TEST] Redis URL:', process.env.KV_REST_API_URL ? 'SET' : 'NOT SET')
    console.log('[TEST] Redis Token:', process.env.KV_REST_API_TOKEN ? 'SET' : 'NOT SET')
    
    // Basit Redis testi
    const testKey = 'test:connection'
    const testValue = 'success'
    
    await kvDb.betaCode.findMany()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Redis bağlantısı başarılı',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[TEST] Redis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: {
          url: process.env.KV_REST_API_URL ? 'SET' : 'NOT SET',
          token: process.env.KV_REST_API_TOKEN ? 'SET' : 'NOT SET'
        }
      },
      { status: 500 }
    )
  }
}