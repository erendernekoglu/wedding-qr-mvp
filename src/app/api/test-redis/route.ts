import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

export async function GET() {
  try {
    console.log('[TEST] Redis connection test started')
    
    // Environment variables kontrol et
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    console.log('[TEST] Redis URL:', redisUrl ? 'SET' : 'MISSING')
    console.log('[TEST] Redis Token:', redisToken ? 'SET' : 'MISSING')
    
    if (!redisUrl || !redisToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing environment variables',
          details: {
            UPSTASH_REDIS_REST_URL: redisUrl ? 'SET' : 'MISSING',
            UPSTASH_REDIS_REST_TOKEN: redisToken ? 'SET' : 'MISSING'
          }
        }),
        {
          status: 500,
          headers: { 'content-type': 'application/json' }
        }
      )
    }
    
    // Redis bağlantısını test et
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })
    
    // Basit test
    await redis.set('test:connection', 'success')
    const result = await redis.get('test:connection')
    
    console.log('[TEST] Redis test result:', result)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Redis connection successful!',
        testResult: result,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )
  } catch (e: any) {
    console.error('[TEST] Redis error:', e.message, e.stack)
    return new Response(
      JSON.stringify({ 
        error: e.message ?? 'Redis test failed',
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
