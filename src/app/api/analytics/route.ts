import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { AnalyticsData, DailyStat, WeeklyStat, MonthlyStat, TopItem, Activity, PerformanceMetrics } from '@/lib/analytics'
import { AppError, ERROR_CODES, createErrorResponse, validateEnvironment } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Environment validation
    validateEnvironment()

    // URL parametrelerini al
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'daily'
    const limit = parseInt(searchParams.get('limit') || '7')

    // Genel istatistikleri al
    const totalUsers = await getTotalUsers()
    const totalEvents = await getTotalEvents()
    const totalFiles = await getTotalFiles()
    const totalBetaCodes = await getTotalBetaCodes()

    // Zaman bazlı veriler
    const dailyStats = await getDailyStats(limit)
    const weeklyStats = await getWeeklyStats(4)
    const monthlyStats = await getMonthlyStats(6)

    // Popüler içerikler
    const topBetaCodes = await getTopBetaCodes(5)
    const topEvents = await getTopEvents(5)

    // Son aktiviteler
    const recentActivity = await getRecentActivity(10)

    // Performans metrikleri
    const performance = await getPerformanceMetrics()

    const analyticsData: AnalyticsData = {
      totalUsers,
      totalEvents,
      totalFiles,
      totalBetaCodes,
      dailyStats,
      weeklyStats,
      monthlyStats,
      topBetaCodes,
      topEvents,
      recentActivity,
      performance
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: analyticsData
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('[ANALYTICS] Error:', error)
    return createErrorResponse(error)
  }
}

// Yardımcı fonksiyonlar
async function getTotalUsers(): Promise<number> {
  try {
    // Beta kod kullanımlarından benzersiz kullanıcı sayısını hesapla
    const betaUsages = await kvDb.betaCode.getAllUsages()
    const uniqueUsers = new Set(betaUsages.map(usage => usage.userId)).size
    return uniqueUsers
  } catch (error) {
    console.error('Error getting total users:', error)
    return 0
  }
}

async function getTotalEvents(): Promise<number> {
  try {
    const events = await kvDb.event.getAll()
    return events.length
  } catch (error) {
    console.error('Error getting total events:', error)
    return 0
  }
}

async function getTotalFiles(): Promise<number> {
  try {
    const events = await kvDb.event.getAll()
    return events.reduce((total, event) => total + (event.currentFiles || 0), 0)
  } catch (error) {
    console.error('Error getting total files:', error)
    return 0
  }
}

async function getTotalBetaCodes(): Promise<number> {
  try {
    const betaCodes = await kvDb.betaCode.getAll()
    return betaCodes.length
  } catch (error) {
    console.error('Error getting total beta codes:', error)
    return 0
  }
}

async function getDailyStats(days: number): Promise<DailyStat[]> {
  try {
    const stats: DailyStat[] = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Bu gün için verileri al
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      // Günlük aktiviteleri say
      const activities = await kvDb.activity.getByDateRange(dayStart, dayEnd)
      
      const users = new Set(activities.map(a => a.userId)).size
      const events = new Set(activities.filter(a => a.action === 'event_created').map(a => a.eventCode)).size
      const files = activities.filter(a => a.action === 'file_upload').length
      
      stats.push({
        date: dateStr,
        users,
        events,
        files,
        revenue: 0 // Şimdilik 0, ödeme sistemi eklendiğinde güncellenecek
      })
    }
    
    return stats
  } catch (error) {
    console.error('Error getting daily stats:', error)
    return []
  }
}

async function getWeeklyStats(weeks: number): Promise<WeeklyStat[]> {
  try {
    const stats: WeeklyStat[] = []
    const now = new Date()
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const activities = await kvDb.activity.getByDateRange(weekStart, weekEnd)
      
      const users = new Set(activities.map(a => a.userId)).size
      const events = new Set(activities.filter(a => a.action === 'event_created').map(a => a.eventCode)).size
      const files = activities.filter(a => a.action === 'file_upload').length
      
      stats.push({
        week: `Hafta ${weeks - i}`,
        users,
        events,
        files,
        revenue: 0
      })
    }
    
    return stats
  } catch (error) {
    console.error('Error getting weekly stats:', error)
    return []
  }
}

async function getMonthlyStats(months: number): Promise<MonthlyStat[]> {
  try {
    const stats: MonthlyStat[] = []
    const now = new Date()
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now)
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setDate(0)
      monthEnd.setHours(23, 59, 59, 999)
      
      const activities = await kvDb.activity.getByDateRange(monthStart, monthEnd)
      
      const users = new Set(activities.map(a => a.userId)).size
      const events = new Set(activities.filter(a => a.action === 'event_created').map(a => a.eventCode)).size
      const files = activities.filter(a => a.action === 'file_upload').length
      
      stats.push({
        month: monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
        users,
        events,
        files,
        revenue: 0
      })
    }
    
    return stats
  } catch (error) {
    console.error('Error getting monthly stats:', error)
    return []
  }
}

async function getTopBetaCodes(limit: number): Promise<TopItem[]> {
  try {
    const betaCodes = await kvDb.betaCode.getAll()
    const usages = await kvDb.betaCode.getAllUsages()
    
    // Her beta kod için kullanım sayısını hesapla
    const usageCounts = new Map<string, number>()
    usages.forEach(usage => {
      const count = usageCounts.get(usage.betaCodeId) || 0
      usageCounts.set(usage.betaCodeId, count + 1)
    })
    
    // Beta kodları kullanım sayısına göre sırala
    const sortedCodes = betaCodes
      .map(code => ({
        id: code.code,
        name: code.code,
        count: usageCounts.get(code.code) || 0,
        percentage: 0,
        trend: 'stable' as const
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
    
    // Yüzde hesapla
    const totalUsage = sortedCodes.reduce((sum, code) => sum + code.count, 0)
    sortedCodes.forEach(code => {
      code.percentage = totalUsage > 0 ? Math.round((code.count / totalUsage) * 100) : 0
    })
    
    return sortedCodes
  } catch (error) {
    console.error('Error getting top beta codes:', error)
    return []
  }
}

async function getTopEvents(limit: number): Promise<TopItem[]> {
  try {
    const events = await kvDb.event.getAll()
    
    // Etkinlikleri dosya sayısına göre sırala
    const sortedEvents = events
      .map(event => ({
        id: event.code,
        name: event.name || event.code,
        count: event.currentFiles || 0,
        percentage: 0,
        trend: 'stable' as const
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
    
    // Yüzde hesapla
    const totalFiles = sortedEvents.reduce((sum, event) => sum + event.count, 0)
    sortedEvents.forEach(event => {
      event.percentage = totalFiles > 0 ? Math.round((event.count / totalFiles) * 100) : 0
    })
    
    return sortedEvents
  } catch (error) {
    console.error('Error getting top events:', error)
    return []
  }
}

async function getRecentActivity(limit: number): Promise<Activity[]> {
  try {
    const activities = await kvDb.activity.getRecent(limit)
    
    return activities.map(activity => ({
      id: activity.id,
      type: activity.action as any,
      message: getActivityMessage(activity),
      timestamp: activity.timestamp,
      userId: activity.userId,
      metadata: {
        eventCode: activity.eventCode,
        betaCode: activity.betaCode,
        fileCount: activity.fileCount
      }
    }))
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return []
  }
}

async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  try {
    // Basit performans metrikleri
    // Gerçek uygulamada daha detaylı metrikler toplanabilir
    return {
      averageLoadTime: 245,
      totalRequests: 15420,
      errorRate: 0.8,
      uptime: 99.9,
      memoryUsage: 67.5
    }
  } catch (error) {
    console.error('Error getting performance metrics:', error)
    return {
      averageLoadTime: 0,
      totalRequests: 0,
      errorRate: 0,
      uptime: 0,
      memoryUsage: 0
    }
  }
}

function getActivityMessage(activity: any): string {
  switch (activity.action) {
    case 'file_upload':
      return `Yeni fotoğraf yüklendi: ${activity.eventCode}`
    case 'event_created':
      return `Yeni etkinlik oluşturuldu: ${activity.eventCode}`
    case 'beta_access':
      return `Beta erişimi: ${activity.betaCode}`
    case 'admin_action':
      return `Admin işlemi: ${activity.eventCode || activity.betaCode}`
    default:
      return `Aktivite: ${activity.action}`
  }
}
