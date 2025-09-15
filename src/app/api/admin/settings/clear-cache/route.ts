import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    // Cache anahtarlarını temizle
    const cacheKeys = [
      'admin:dashboard:stats',
      'admin:users:list',
      'admin:events:list',
      'admin:activities:recent',
      'admin:events:top'
    ]
    
    // Her cache anahtarını sil
    for (const key of cacheKeys) {
      try {
        await kvDb.redis.del(key)
      } catch (error) {
        console.warn(`Cache key ${key} could not be deleted:`, error)
      }
    }
    
    // Aktivite kaydı oluştur
    await kvDb.activity.create({
      userId: 'admin',
      action: 'cache_cleared',
      userAgent: 'admin-panel',
      ipAddress: 'admin-panel'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Önbellek başarıyla temizlendi',
        data: {
          clearedKeys: cacheKeys.length,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_CLEAR_CACHE] Error:', error)
    return createErrorResponse(error)
  }
}
