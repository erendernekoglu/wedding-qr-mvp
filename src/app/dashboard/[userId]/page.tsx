'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, 
  Calendar, 
  QrCode, 
  Users, 
  FileImage, 
  BarChart3, 
  RefreshCcw,
  Settings,
  Eye,
  Download,
  LogOut
} from 'lucide-react'
import { FadeIn, SlideIn, Stagger } from '@/components/Animations'
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
    status: 'active' | 'completed' | 'pending'
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

export default function UserDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()

  const userId = params.userId as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    // URL'deki userId ile giriş yapan kullanıcının ID'si eşleşmiyor mu?
    if (user && user.id !== userId) {
      router.push(`/dashboard/${user.id}`)
      return
    }
    
    if (isAuthenticated && user) {
      loadDashboardData()
    }
  }, [isAuthenticated, authLoading, router, userId, user])

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
      title: 'Başarılı!',
      description: 'Dashboard verileri güncellendi.',
      variant: 'success'
    })
  }

  const handleCreateEvent = () => {
    router.push('/purchase-event')
  }

  const handleViewEvent = (eventCode: string) => {
    router.push(`/events/${eventCode}`)
  }

  const handleViewQR = (eventCode: string) => {
    router.push(`/events/${eventCode}/qr`)
  }

  const handleLogout = () => {
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
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Bulunamadı</h3>
          <p className="text-gray-600 mb-4">Dashboard verileri yüklenemedi.</p>
          <button 
            onClick={handleRefresh}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
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
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Hoş geldiniz, {user?.name || 'Kullanıcı'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              >
                <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Yenile</span>
              </button>
              
              <button 
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <Settings className="w-4 h-4" />
                <span>Profil</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FadeIn>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Etkinlik</p>
                  <p className="text-3xl font-bold text-gray-900">{data.stats.totalEvents.value}</p>
                  <p className="text-sm text-green-600">{data.stats.totalEvents.changeText}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Fotoğraf</p>
                  <p className="text-3xl font-bold text-gray-900">{data.stats.totalFiles.value}</p>
                  <p className="text-sm text-green-600">{data.stats.totalFiles.changeText}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Misafir</p>
                  <p className="text-3xl font-bold text-gray-900">{data.stats.activeGuests.value}</p>
                  <p className="text-sm text-green-600">{data.stats.activeGuests.changeText}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Masa</p>
                  <p className="text-3xl font-bold text-gray-900">{data.stats.totalTables.value}</p>
                  <p className="text-sm text-green-600">{data.stats.totalTables.changeText}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  event.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : event.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {event.status === 'active' ? 'Aktif' : event.status === 'pending' ? 'Beklemede' : 'Tamamlandı'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>{new Date(event.date).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="flex items-center">
                                  <QrCode className="w-4 h-4 mr-2" />
                                  <span>{event.tables} masa</span>
                                </div>
                                <div className="flex items-center">
                                  <FileImage className="w-4 h-4 mr-2" />
                                  <span>{event.photos} fotoğraf</span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-2" />
                                  <span>{event.guests} misafir</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleViewEvent(event.code)}
                                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Görüntüle</span>
                              </button>
                              <button
                                onClick={() => handleViewQR(event.code)}
                                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-pink-700 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              >
                                <QrCode className="w-4 h-4" />
                                <span>QR Kod</span>
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
        </div>
      </div>
    </div>
  )
}
