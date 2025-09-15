import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Tüm kullanıcıları getir
    const users = await kvDb.user.findMany()
    const totalUsers = users.length

    // Tüm etkinlikleri getir
    const events = await kvDb.event.findMany()
    const totalEvents = events.length
    const activeEvents = events.filter(event => event.isActive).length
    const pendingEvents = events.filter(event => !event.isActive).length

    // Toplam dosya sayısı
    const totalFiles = events.reduce((sum, event) => sum + (event.currentFiles || 0), 0)

    // Toplam yükleme sayısı (etkinlik kullanımları)
    const eventUsages = await kvDb.event.getAllUsages()
    const totalUploads = eventUsages.reduce((sum, usage) => sum + (usage.fileCount || 0), 0)

    // Son aktivite (son 24 saat içindeki aktiviteler)
    const activities = await kvDb.activity.findMany()
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const recentActivities = activities.filter(activity => 
      new Date(activity.timestamp) > last24Hours
    ).length

    // Sistem sağlığı (basit kontrol)
    let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy'
    
    // Redis bağlantısı kontrolü
    try {
      await kvDb.user.findMany()
      systemHealth = 'healthy'
    } catch (error) {
      systemHealth = 'error'
    }

    // Eğer çok fazla bekleyen etkinlik varsa uyarı
    if (pendingEvents > totalEvents * 0.5) {
      systemHealth = 'warning'
    }

    const stats = {
      totalUsers,
      totalEvents,
      totalFiles,
      activeEvents,
      pendingEvents,
      totalUploads,
      recentActivity: recentActivities,
      systemHealth
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
    console.error('[ADMIN_DASHBOARD_STATS] Error:', error)
    return createErrorResponse(error)
  }
}
