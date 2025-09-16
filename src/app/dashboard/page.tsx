'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, 
  Calendar, 
  QrCode, 
  Users, 
  Camera, 
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  RefreshCcw,
  Eye,
  Download,
  MoreVertical
} from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/Animations'
import { useToast } from '@/components/ui/Toast'

interface DashboardData {
  stats: {
    totalEvents: { value: number; change: number; changeText: string }
    totalFiles: { value: number; change: number; changeText: string }
    activeGuests: { value: number; change: number; changeText: string }
    totalTables: { value: number; change: number; changeText: string }
  }
  events: Array<{
    id: string
    name: string
    code: string
    date: string
    status: 'active' | 'completed'
    tables: number
    photos: number
    guests: number
    maxFiles?: number
    maxFileSize?: number
  }>
  activities: Array<{
    id: string
    type: string
    description: string
    eventName: string
    timestamp: string
    timeAgo: string
  }>
  user: {
    name: string
    email: string
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (isAuthenticated && user) {
      // Kullanıcı özel URL'sine yönlendir
      router.push(`/dashboard/${user.id}`)
    }
  }, [isAuthenticated, authLoading, router, user])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error('API returned error')
      }
      
      setData(result.data)
    } catch (error) {
      console.error('Dashboard data load error:', error)
      toast({
        title: 'Hata!',
        description: 'Dashboard verileri yüklenirken bir hata oluştu.',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
    toast({
      title: 'Yenilendi!',
      description: 'Dashboard verileri güncellendi.',
      variant: 'success'
    })
  }

  const handleCreateEvent = () => {
    // Etkinlik satın alma sayfasına yönlendir
    router.push('/purchase-event')
  }

  const handleViewEvent = (eventCode: string) => {
    router.push(`/events/${eventCode}`)
  }

  const handleViewQR = (eventCode: string) => {
    router.push(`/events/${eventCode}/qr`)
  }

  const handleLogout = () => {
    const { logout } = useAuth()
    logout()
    toast({
      title: 'Çıkış Yapıldı',
      description: 'Başarıyla çıkış yaptınız.',
      variant: 'success'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCcw className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Redirect will happen in useEffect
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Veri Yüklenemedi</h2>
          <p className="text-gray-600 mb-4">Dashboard verileri yüklenirken bir hata oluştu.</p>
          <button
            onClick={loadDashboardData}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/logos/logo.png" 
                alt="Momento Logo" 
                className="w-24 h-24"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Hoş geldiniz, {user?.name || 'Kullanıcı'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCcw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SlideIn delay={0}>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Etkinlik</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.totalEvents.value}</p>
                    <p className={`text-sm ${data.stats.totalEvents.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.stats.totalEvents.changeText}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </SlideIn>
            
            <SlideIn delay={100}>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Fotoğraf</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.totalFiles.value.toLocaleString()}</p>
                    <p className="text-sm text-green-600">{data.stats.totalFiles.changeText}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </SlideIn>
            
            <SlideIn delay={200}>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktif Misafir</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.activeGuests.value}</p>
                    <p className="text-sm text-green-600">{data.stats.activeGuests.changeText}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </SlideIn>
            
            <SlideIn delay={300}>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Masa</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.totalTables.value}</p>
                    <p className="text-sm text-green-600">{data.stats.totalTables.changeText}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                    <QrCode className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </SlideIn>
          </div>
        </FadeIn>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Events List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Etkinliklerim</h2>
                  <button 
                    onClick={handleCreateEvent}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Etkinlik Satın Al
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {data.events.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz etkinliğiniz yok</h3>
                    <p className="text-gray-600 mb-4">İlk etkinliğinizi satın almak için "Etkinlik Satın Al" butonuna tıklayın.</p>
                    <button 
                      onClick={handleCreateEvent}
                      className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Etkinlik Satın Al
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.events.map((event, index) => (
                      <FadeIn key={event.id} delay={index * 100}>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all group">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors cursor-pointer"
                                  onClick={() => handleViewEvent(event.code)}>
                                {event.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(event.date).toLocaleDateString('tr-TR')} • {event.code}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">{event.tables} masa</span>
                                <span className="text-xs text-gray-500">{event.photos} fotoğraf</span>
                                <span className="text-xs text-gray-500">{event.guests} misafir</span>
                                {event.maxFiles && (
                                  <span className="text-xs text-gray-500">
                                    {event.photos}/{event.maxFiles} limit
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {event.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                            </span>
                            
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => handleViewEvent(event.code)}
                                className="p-2 text-gray-400 hover:text-pink-600 transition-colors"
                                title="Etkinliği Görüntüle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleViewQR(event.code)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="QR Kodları"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleCreateEvent}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-medium">Etkinlik Satın Al</span>
                </button>
                <button 
                  onClick={() => router.push('/analytics')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Analytics</span>
                </button>
                <button 
                  onClick={() => router.push('/upload')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Camera className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Fotoğraf Yükle</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
              {data.activities.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Bell className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Henüz aktivite yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.activities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'file_upload' ? 'bg-green-500' :
                        activity.type === 'event_created' ? 'bg-blue-500' :
                        activity.type === 'qr_generated' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {activity.eventName} - {activity.timeAgo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Bu Hafta</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm opacity-90">Yeni Fotoğraf</span>
                  <span className="text-sm font-semibold">{data.stats.totalFiles.change}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm opacity-90">Aktif Misafir</span>
                  <span className="text-sm font-semibold">{data.stats.activeGuests.change}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm opacity-90">Toplam Etkinlik</span>
                  <span className="text-sm font-semibold">{data.stats.totalEvents.value}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
