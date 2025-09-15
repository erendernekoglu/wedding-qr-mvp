import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Mock user ID - gerçek uygulamada auth token'dan alınacak
    const userId = 'user_123'
    
    // Tüm etkinlikleri getir (gerçek uygulamada userId ile filtreleme yapılacak)
    const allEvents = await kvDb.event.findMany()
    const events = allEvents.filter(event => event.createdBy === userId)
    
    // Toplam istatistikleri hesapla
    const totalEvents = events.length
    const totalFiles = events.reduce((sum, event) => sum + (event.currentFiles || 0), 0)
    const totalTables = events.length * 5 // Mock: her etkinlik için 5 masa varsayımı
    
    // Aktif etkinlikler
    const activeEvents = events.filter(event => event.isActive)
    const activeGuests = activeEvents.length * 20 // Mock: her aktif etkinlik için 20 misafir varsayımı
    
    // Son 7 günlük aktiviteler
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const allActivities = await kvDb.activity.getRecent(50) // Son 50 aktivite
    const recentActivities = allActivities.filter(activity => 
      activity.userId === userId && 
      new Date(activity.timestamp) >= sevenDaysAgo
    )
    
    // Son aktiviteleri formatla
    const formattedActivities = recentActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(activity => ({
        id: activity.id,
        type: activity.action,
        description: getActivityDescription(activity),
        eventName: events.find(e => e.code === activity.eventCode)?.name || 'Bilinmeyen Etkinlik',
        timestamp: activity.timestamp,
        timeAgo: getTimeAgo(activity.timestamp)
      }))
    
    // Etkinlik detaylarını formatla
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      code: event.code,
      date: event.createdAt,
      status: event.isActive ? 'active' : 'completed',
      tables: 5, // Mock: her etkinlik için 5 masa
      photos: event.currentFiles || 0,
      guests: event.isActive ? 20 : 0, // Mock: aktif etkinlikler için 20 misafir
      maxFiles: event.maxFiles,
      maxFileSize: event.maxFileSize
    }))
    
    // Trend hesaplamaları (basit)
    const thisMonthEvents = events.filter(event => {
      const eventDate = new Date(event.createdAt)
      const now = new Date()
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
    }).length
    
    const lastMonthEvents = events.filter(event => {
      const eventDate = new Date(event.createdAt)
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      return eventDate.getMonth() === lastMonth.getMonth() && eventDate.getFullYear() === lastMonth.getFullYear()
    }).length
    
    const eventsChange = lastMonthEvents > 0 ? 
      Math.round(((thisMonthEvents - lastMonthEvents) / lastMonthEvents) * 100) : 0
    
    const thisWeekFiles = recentActivities
      .filter(activity => activity.action === 'file_upload')
      .reduce((sum, activity) => sum + (activity.fileCount || 0), 0)
    
    const todayGuests = recentActivities
      .filter(activity => {
        const activityDate = new Date(activity.timestamp)
        const today = new Date()
        return activityDate.toDateString() === today.toDateString()
      })
      .length
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stats: {
            totalEvents: {
              value: totalEvents,
              change: eventsChange,
              changeText: eventsChange > 0 ? `+${eventsChange}% bu ay` : `${eventsChange}% bu ay`
            },
            totalFiles: {
              value: totalFiles,
              change: thisWeekFiles,
              changeText: `+${thisWeekFiles} bu hafta`
            },
            activeGuests: {
              value: activeGuests,
              change: todayGuests,
              changeText: `+${todayGuests} bugün`
            },
            totalTables: {
              value: totalTables,
              change: thisMonthEvents,
              changeText: `+${thisMonthEvents} bu ay`
            }
          },
          events: formattedEvents,
          activities: formattedActivities,
          user: {
            name: 'Ahmet', // Mock - gerçek uygulamada user tablosundan gelecek
            email: 'ahmet@example.com'
          }
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )
    
  } catch (error: any) {
    console.error('[DASHBOARD] Error:', error)
    return createErrorResponse(error)
  }
}

function getActivityDescription(activity: any): string {
  switch (activity.action) {
    case 'file_upload':
      return `Yeni fotoğraf yüklendi (${activity.fileCount || 1} adet)`
    case 'event_created':
      return 'Yeni etkinlik oluşturuldu'
    case 'qr_generated':
      return 'QR kod oluşturuldu'
    case 'event_completed':
      return 'Etkinlik tamamlandı'
    case 'beta_access':
      return 'Beta kodu kullanıldı'
    default:
      return 'Yeni aktivite'
  }
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Az önce'
  if (diffInMinutes < 60) return `${diffInMinutes} dk önce`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} saat önce`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} gün önce`
  
  return activityTime.toLocaleDateString('tr-TR')
}
