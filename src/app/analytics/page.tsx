'use client'
import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  Users, 
  Calendar, 
  FileImage, 
  Key,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Database
} from 'lucide-react'
import { 
  AnalyticsData, 
  AnalyticsProcessor, 
  generateMockAnalyticsData,
  exportToCSV,
  exportToJSON
} from '@/lib/analytics'
import { 
  LineChart, 
  BarChart, 
  DoughnutChart, 
  StatCard, 
  TrendIndicator 
} from '@/components/analytics/ChartComponents'

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [processor, setProcessor] = useState<AnalyticsProcessor | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'doughnut'>('line')

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Gerçek uygulamada API'den veri gelecek
      const data = generateMockAnalyticsData()
      setAnalyticsData(data)
      setProcessor(new AnalyticsProcessor(data))
    } catch (error) {
      console.error('Analytics data load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: 'csv' | 'json') => {
    if (!analyticsData) return

    const filename = `analytics-${new Date().toISOString().split('T')[0]}`
    
    if (format === 'csv') {
      exportToCSV(analyticsData.dailyStats, filename)
    } else {
      exportToJSON(analyticsData, filename)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
          <p className="text-gray-600">Analytics yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData || !processor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">Analytics verileri yüklenemedi</p>
            <button
              onClick={loadAnalyticsData}
              className="text-brand-primary hover:text-brand-primary/80"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  const dailyStats = processor.getDailyStats(7)
  const weeklyStats = processor.getWeeklyStats(4)
  const monthlyStats = processor.getMonthlyStats(6)
  const topBetaCodes = processor.getTopItems('betaCodes', 5)
  const topEvents = processor.getTopItems('events', 5)
  const recentActivity = processor.getRecentActivity(10)
  const performance = processor.getPerformanceMetrics()
  const userSegments = processor.getUserSegments()
  const eventAnalysis = processor.getEventAnalysis()

  const currentPeriodData = selectedPeriod === 'daily' ? dailyStats :
                           selectedPeriod === 'weekly' ? weeklyStats :
                           monthlyStats

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Momento kullanım istatistikleri ve raporları</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadAnalyticsData}
                className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Yenile</span>
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Genel İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Toplam Kullanıcı"
            value={analyticsData.totalUsers.toLocaleString()}
            change={{
              value: processor.getTrendAnalysis('users').percentage,
              type: processor.getTrendAnalysis('users').trend === 'up' ? 'increase' : 
                    processor.getTrendAnalysis('users').trend === 'down' ? 'decrease' : 'neutral'
            }}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Toplam Etkinlik"
            value={analyticsData.totalEvents.toLocaleString()}
            change={{
              value: processor.getTrendAnalysis('events').percentage,
              type: processor.getTrendAnalysis('events').trend === 'up' ? 'increase' : 
                    processor.getTrendAnalysis('events').trend === 'down' ? 'decrease' : 'neutral'
            }}
            icon={<Calendar className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Toplam Dosya"
            value={analyticsData.totalFiles.toLocaleString()}
            change={{
              value: processor.getTrendAnalysis('files').percentage,
              type: processor.getTrendAnalysis('files').trend === 'up' ? 'increase' : 
                    processor.getTrendAnalysis('files').trend === 'down' ? 'decrease' : 'neutral'
            }}
            icon={<FileImage className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Beta Kodları"
            value={analyticsData.totalBetaCodes.toLocaleString()}
            icon={<Key className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Zaman Bazlı Grafikler */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Zaman Bazlı İstatistikler</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedPeriod('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'daily'
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Günlük
              </button>
              <button
                onClick={() => setSelectedPeriod('weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'weekly'
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Haftalık
              </button>
              <button
                onClick={() => setSelectedPeriod('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'monthly'
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aylık
              </button>
            </div>
          </div>
          
          <LineChart 
            data={currentPeriodData} 
            title={`${selectedPeriod === 'daily' ? 'Son 7 Gün' : selectedPeriod === 'weekly' ? 'Son 4 Hafta' : 'Son 6 Ay'} İstatistikleri`}
            height={400}
          />
        </div>

        {/* Popüler İçerikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">En Popüler Beta Kodları</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedChart('bar')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedChart === 'bar'
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setSelectedChart('doughnut')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedChart === 'doughnut'
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Doughnut
                </button>
              </div>
            </div>
            
            {selectedChart === 'bar' ? (
              <BarChart data={topBetaCodes} title="" height={300} />
            ) : (
              <DoughnutChart data={topBetaCodes} title="" height={300} />
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">En Aktif Etkinlikler</h3>
            <BarChart data={topEvents} title="" height={300} />
          </div>
        </div>

        {/* Performans ve Kullanıcı Analizi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performans Metrikleri</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ortalama Yükleme Süresi</span>
                <span className="font-semibold">{performance.averageLoadTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam İstek</span>
                <span className="font-semibold">{performance.totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hata Oranı</span>
                <span className="font-semibold">{performance.errorRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="font-semibold text-green-600">{performance.uptime}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Segmentasyonu</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yeni Kullanıcılar</span>
                <span className="font-semibold">{userSegments.newUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dönen Kullanıcılar</span>
                <span className="font-semibold">{userSegments.returningUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aktif Kullanıcılar</span>
                <span className="font-semibold">{userSegments.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pasif Kullanıcılar</span>
                <span className="font-semibold">{userSegments.inactiveUsers}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Etkinlik Analizi</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ortalama Dosya/Etkinlik</span>
                <span className="font-semibold">{eventAnalysis.averageFilesPerEvent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">En Aktif Etkinlik</span>
                <span className="font-semibold text-sm">{eventAnalysis.mostActiveEvent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Depolama</span>
                <span className="font-semibold">{(eventAnalysis.totalStorageUsed / 1024).toFixed(1)} GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Son Aktiviteler</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
