'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { 
  Users, 
  Calendar, 
  FileImage, 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalEvents: number
  totalFiles: number
  activeEvents: number
  pendingEvents: number
  totalUploads: number
  recentActivity: number
  systemHealth: 'healthy' | 'warning' | 'error'
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'event_created' | 'event_approved' | 'file_uploaded' | 'beta_code_used'
  description: string
  timestamp: string
  user?: string
  eventCode?: string
}

interface TopEvent {
  id: string
  code: string
  name: string
  uploads: number
  tables: number
  createdBy: string
  createdAt: string
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalFiles: 0,
    activeEvents: 0,
    pendingEvents: 0,
    totalUploads: 0,
    recentActivity: 0,
    systemHealth: 'healthy'
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [topEvents, setTopEvents] = useState<TopEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Dashboard istatistikleri
      const statsResponse = await fetch('/api/admin/dashboard/stats')
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Son aktiviteler
      const activitiesResponse = await fetch('/api/admin/activities/recent')
      const activitiesData = await activitiesResponse.json()
      if (activitiesData.success) {
        setRecentActivities(activitiesData.data)
      }

      // En popüler etkinlikler
      const eventsResponse = await fetch('/api/admin/events/top')
      const eventsData = await eventsResponse.json()
      if (eventsData.success) {
        setTopEvents(eventsData.data)
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return <Users className="h-4 w-4 text-green-500" />
      case 'event_created': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'event_approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'file_uploaded': return <FileImage className="h-4 w-4 text-purple-500" />
      case 'beta_code_used': return <Activity className="h-4 w-4 text-orange-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Az önce'
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`
    return `${Math.floor(diffInMinutes / 1440)} gün önce`
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard" description="Sistem genel bakış ve istatistikler">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard" description="Sistem genel bakış ve istatistikler">
      <div className="space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Kullanıcı</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Etkinlik</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalEvents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileImage className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Dosya</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalFiles}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sistem Durumu</dt>
                    <dd className={`text-lg font-medium ${getHealthColor(stats.systemHealth)}`}>
                      {stats.systemHealth === 'healthy' ? 'Sağlıklı' : 
                       stats.systemHealth === 'warning' ? 'Uyarı' : 'Hata'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detaylı İstatistikler */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Etkinlik Durumları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-800">Aktif Etkinlikler</p>
                        <p className="text-2xl font-bold text-green-900">{stats.activeEvents}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-800">Bekleyen Onaylar</p>
                        <p className="text-2xl font-bold text-yellow-900">{stats.pendingEvents}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Hızlı İstatistikler
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Toplam Yükleme</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalUploads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Son Aktivite</span>
                  <span className="text-sm font-medium text-gray-900">{stats.recentActivity} dk</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Ortalama Dosya/Etkinlik</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalEvents > 0 ? Math.round(stats.totalFiles / stats.totalEvents) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Son Aktiviteler ve Popüler Etkinlikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Son Aktiviteler */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Son Aktiviteler
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <li key={activity.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Popüler Etkinlikler */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                En Popüler Etkinlikler
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {topEvents.slice(0, 5).map((event) => (
                    <li key={event.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{event.name}</p>
                          <p className="text-xs text-gray-500">Kod: {event.code}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{event.uploads} yükleme</span>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminAuthProvider>
      <AdminDashboard />
    </AdminAuthProvider>
  )
}
