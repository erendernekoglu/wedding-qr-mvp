import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Sistem istatistiklerini hesapla
    const users = await kvDb.user.findMany()
    const events = await kvDb.event.findMany()
    const activities = await kvDb.activity.findMany()
    
    const totalUsers = users.length
    const totalEvents = events.length
    const totalFiles = events.reduce((sum, event) => sum + (event.currentFiles || 0), 0)
    
    // Depolama kullanımını hesapla (yaklaşık)
    const storageUsed = totalFiles * 2 // Her dosya için ortalama 2MB varsayımı
    
    // Son yedekleme tarihi (şimdilik boş)
    const lastBackup = ''
    
    // Sistem çalışma süresi (şimdilik boş)
    const systemUptime = ''
    
    // Redis bağlantı durumu
    let redisStatus: 'connected' | 'disconnected' = 'disconnected'
    try {
      await kvDb.redis.ping()
      redisStatus = 'connected'
    } catch (error) {
      redisStatus = 'disconnected'
    }
    
    // Google Drive bağlantı durumu (şimdilik bağlı varsayımı)
    const driveStatus: 'connected' | 'disconnected' = 'connected'

    const stats = {
      totalUsers,
      totalEvents,
      totalFiles,
      storageUsed,
      lastBackup,
      systemUptime,
      redisStatus,
      driveStatus
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: stats
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_SETTINGS_STATS] Error:', error)
    return createErrorResponse(error)
  }
}
