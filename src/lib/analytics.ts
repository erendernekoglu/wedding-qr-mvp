// Analytics utilities and data processing

export interface AnalyticsData {
  // Genel istatistikler
  totalUsers: number
  totalEvents: number
  totalFiles: number
  totalBetaCodes: number
  
  // Zaman bazlı veriler
  dailyStats: DailyStat[]
  weeklyStats: WeeklyStat[]
  monthlyStats: MonthlyStat[]
  
  // Popüler içerikler
  topBetaCodes: TopItem[]
  topEvents: TopItem[]
  
  // Son aktiviteler
  recentActivity: Activity[]
  
  // Performans metrikleri
  performance: PerformanceMetrics
}

export interface DailyStat {
  date: string
  users: number
  events: number
  files: number
  revenue?: number
}

export interface WeeklyStat {
  week: string
  users: number
  events: number
  files: number
  revenue?: number
}

export interface MonthlyStat {
  month: string
  users: number
  events: number
  files: number
  revenue?: number
}

export interface TopItem {
  id: string
  name: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

export interface Activity {
  id: string
  type: 'user_signup' | 'event_created' | 'file_upload' | 'beta_access' | 'admin_action'
  message: string
  timestamp: string
  userId: string
  metadata?: Record<string, any>
}

export interface PerformanceMetrics {
  averageLoadTime: number
  totalRequests: number
  errorRate: number
  uptime: number
  memoryUsage: number
}

// Analytics data processor
export class AnalyticsProcessor {
  private data: AnalyticsData

  constructor(data: AnalyticsData) {
    this.data = data
  }

  // Günlük istatistikleri hesapla
  getDailyStats(days: number = 7): DailyStat[] {
    return this.data.dailyStats.slice(-days)
  }

  // Haftalık istatistikleri hesapla
  getWeeklyStats(weeks: number = 4): WeeklyStat[] {
    return this.data.weeklyStats.slice(-weeks)
  }

  // Aylık istatistikleri hesapla
  getMonthlyStats(months: number = 6): MonthlyStat[] {
    return this.data.monthlyStats.slice(-months)
  }

  // Büyüme oranını hesapla
  getGrowthRate(period: 'daily' | 'weekly' | 'monthly'): number {
    const stats = period === 'daily' ? this.data.dailyStats : 
                  period === 'weekly' ? this.data.weeklyStats : 
                  this.data.monthlyStats

    if (stats.length < 2) return 0

    const current = stats[stats.length - 1]
    const previous = stats[stats.length - 2]
    
    const currentTotal = current.users + current.events + current.files
    const previousTotal = previous.users + previous.events + previous.files

    if (previousTotal === 0) return 100

    return ((currentTotal - previousTotal) / previousTotal) * 100
  }

  // En popüler öğeleri hesapla
  getTopItems(type: 'betaCodes' | 'events', limit: number = 5): TopItem[] {
    const items = type === 'betaCodes' ? this.data.topBetaCodes : this.data.topEvents
    return items.slice(0, limit)
  }

  // Son aktiviteleri getir
  getRecentActivity(limit: number = 10): Activity[] {
    return this.data.recentActivity.slice(0, limit)
  }

  // Performans metriklerini getir
  getPerformanceMetrics(): PerformanceMetrics {
    return this.data.performance
  }

  // Trend analizi
  getTrendAnalysis(metric: 'users' | 'events' | 'files'): {
    trend: 'up' | 'down' | 'stable'
    percentage: number
    direction: string
  } {
    const dailyStats = this.getDailyStats(7)
    if (dailyStats.length < 2) {
      return { trend: 'stable', percentage: 0, direction: 'No data' }
    }

    const current = dailyStats[dailyStats.length - 1]
    const previous = dailyStats[dailyStats.length - 2]
    
    const currentValue = current[metric]
    const previousValue = previous[metric]
    
    const percentage = previousValue === 0 ? 100 : ((currentValue - previousValue) / previousValue) * 100
    
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let direction = 'No change'
    
    if (percentage > 5) {
      trend = 'up'
      direction = `+${percentage.toFixed(1)}%`
    } else if (percentage < -5) {
      trend = 'down'
      direction = `${percentage.toFixed(1)}%`
    } else {
      direction = `${percentage.toFixed(1)}%`
    }

    return { trend, percentage, direction }
  }

  // Kullanıcı segmentasyonu
  getUserSegments(): {
    newUsers: number
    returningUsers: number
    activeUsers: number
    inactiveUsers: number
  } {
    // Bu veriler gerçek uygulamada veritabanından gelecek
    return {
      newUsers: Math.floor(this.data.totalUsers * 0.3),
      returningUsers: Math.floor(this.data.totalUsers * 0.4),
      activeUsers: Math.floor(this.data.totalUsers * 0.6),
      inactiveUsers: Math.floor(this.data.totalUsers * 0.4)
    }
  }

  // Etkinlik analizi
  getEventAnalysis(): {
    averageFilesPerEvent: number
    mostActiveEvent: string
    leastActiveEvent: string
    totalStorageUsed: number
  } {
    const totalFiles = this.data.totalFiles
    const totalEvents = this.data.totalEvents
    
    return {
      averageFilesPerEvent: totalEvents > 0 ? Math.round(totalFiles / totalEvents) : 0,
      mostActiveEvent: this.data.topEvents[0]?.name || 'N/A',
      leastActiveEvent: this.data.topEvents[this.data.topEvents.length - 1]?.name || 'N/A',
      totalStorageUsed: totalFiles * 2.5 // Ortalama 2.5MB per file
    }
  }
}

// Mock data generator (gerçek uygulamada veritabanından gelecek)
export function generateMockAnalyticsData(): AnalyticsData {
  const now = new Date()
  const dailyStats: DailyStat[] = []
  const weeklyStats: WeeklyStat[] = []
  const monthlyStats: MonthlyStat[] = []

  // Son 30 gün için günlük veriler
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    dailyStats.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 20) + 5,
      events: Math.floor(Math.random() * 10) + 2,
      files: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 1000) + 100
    })
  }

  // Son 12 hafta için haftalık veriler
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - (i * 7))
    
    weeklyStats.push({
      week: `Hafta ${12 - i}`,
      users: Math.floor(Math.random() * 100) + 50,
      events: Math.floor(Math.random() * 50) + 20,
      files: Math.floor(Math.random() * 200) + 100,
      revenue: Math.floor(Math.random() * 5000) + 1000
    })
  }

  // Son 6 ay için aylık veriler
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now)
    monthStart.setMonth(monthStart.getMonth() - i)
    
    monthlyStats.push({
      month: monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      users: Math.floor(Math.random() * 500) + 200,
      events: Math.floor(Math.random() * 200) + 100,
      files: Math.floor(Math.random() * 1000) + 500,
      revenue: Math.floor(Math.random() * 20000) + 5000
    })
  }

  return {
    totalUsers: 1250,
    totalEvents: 89,
    totalFiles: 2340,
    totalBetaCodes: 12,
    dailyStats,
    weeklyStats,
    monthlyStats,
    topBetaCodes: [
      { id: '1', name: 'FRIEND2024', count: 45, percentage: 25, trend: 'up' },
      { id: '2', name: 'FAMILY2024', count: 38, percentage: 21, trend: 'up' },
      { id: '3', name: 'WORK2024', count: 32, percentage: 18, trend: 'down' },
      { id: '4', name: 'EVENT2024', count: 28, percentage: 16, trend: 'stable' },
      { id: '5', name: 'TEST2024', count: 22, percentage: 12, trend: 'up' }
    ],
    topEvents: [
      { id: '1', name: 'Düğün - Ahmet & Ayşe', count: 156, percentage: 28, trend: 'up' },
      { id: '2', name: 'Doğum Günü - Mehmet', count: 134, percentage: 24, trend: 'up' },
      { id: '3', name: 'Şirket Etkinliği', count: 98, percentage: 18, trend: 'down' },
      { id: '4', name: 'Mezuniyet - Üniversite', count: 87, percentage: 16, trend: 'stable' },
      { id: '5', name: 'Yılbaşı Partisi', count: 76, percentage: 14, trend: 'up' }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'file_upload',
        message: 'Yeni fotoğraf yüklendi: Düğün - Ahmet & Ayşe',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        userId: 'user_123'
      },
      {
        id: '2',
        type: 'event_created',
        message: 'Yeni etkinlik oluşturuldu: Doğum Günü - Mehmet',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        userId: 'user_456'
      },
      {
        id: '3',
        type: 'beta_access',
        message: 'Beta erişimi: FRIEND2024',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        userId: 'user_789'
      }
    ],
    performance: {
      averageLoadTime: 245,
      totalRequests: 15420,
      errorRate: 0.8,
      uptime: 99.9,
      memoryUsage: 67.5
    }
  }
}

// Export utilities
export function exportToCSV(data: any[], filename: string): void {
  if (typeof window === 'undefined') return

  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

export function exportToJSON(data: any, filename: string): void {
  if (typeof window === 'undefined') return

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  link.click()
  window.URL.revokeObjectURL(url)
}