'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  QrCode,
  FileImage,
  Settings,
  Download,
  Share2,
  Eye,
  BarChart3
} from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/Animations'
import { useToast } from '@/components/ui/Toast'

interface EventData {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  createdBy: string
  maxFiles?: number
  currentFiles: number
  maxFileSize?: number
  eventDate?: string
  eventTime?: string
  location?: string
  tableCount?: number
  template?: string
  customMessage?: string
}

export default function EventViewPage() {
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalGuests: 0,
    totalTables: 0,
    recentUploads: 0
  })
  
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const eventCode = params.eventCode as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (isAuthenticated) {
      loadEventData()
    }
  }, [isAuthenticated, authLoading, router, eventCode])

  const loadEventData = async () => {
    try {
      setLoading(true)
      
      // Etkinlik bilgilerini getir
      const response = await fetch(`/api/events/${eventCode}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error('Event not found')
      }

      setEventData(result.data)
      
      // İstatistikleri hesapla
      setStats({
        totalPhotos: result.data.currentFiles || 0,
        totalGuests: Math.floor(Math.random() * 50) + 10, // Mock data
        totalTables: result.data.tableCount || 5,
        recentUploads: Math.floor(Math.random() * 10) + 1 // Mock data
      })
      
    } catch (error) {
      console.error('Event data load error:', error)
      toast({
        title: 'Hata!',
        description: 'Etkinlik verileri yüklenirken bir hata oluştu.',
        variant: 'error'
      })
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleViewQR = () => {
    router.push(`/events/${eventCode}/qr`)
  }

  const handleViewGallery = () => {
    router.push(`/events/${eventCode}/gallery`)
  }

  const handleEditEvent = () => {
    router.push(`/events/${eventCode}/edit`)
  }

  const handleShareEvent = () => {
    const shareUrl = `${window.location.origin}/u/${eventCode}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: 'Link Kopyalandı!',
      description: 'Etkinlik linki panoya kopyalandı.',
      variant: 'success'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Etkinlik yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Redirect will happen in useEffect
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Etkinlik Bulunamadı</h3>
          <p className="text-gray-600 mb-4">Bu etkinlik mevcut değil veya erişim yetkiniz yok.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Dashboard'a Dön
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
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/dashboard/${user?.id}`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard'a Dön</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Momento</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventData.name}</h1>
                <p className="text-gray-600">{eventData.description || 'Etkinlik açıklaması bulunmuyor.'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  eventData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {eventData.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FadeIn delay={100}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Fotoğraf</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPhotos}</p>
                  <p className="text-sm text-green-600">+{stats.recentUploads} son 24 saat</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Misafir</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalGuests}</p>
                  <p className="text-sm text-green-600">Aktif katılımcı</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Masa Sayısı</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTables}</p>
                  <p className="text-sm text-gray-500">QR kodlu masa</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Etkinlik Kodu</p>
                  <p className="text-2xl font-bold text-gray-900 font-mono">{eventData.code}</p>
                  <p className="text-sm text-gray-500">Paylaşım kodu</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FadeIn delay={500}>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Etkinlik Detayları</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Etkinlik Tarihi</p>
                        <p className="text-sm text-gray-600">
                          {eventData.eventDate 
                            ? new Date(eventData.eventDate).toLocaleDateString('tr-TR')
                            : 'Belirtilmemiş'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Etkinlik Saati</p>
                        <p className="text-sm text-gray-600">
                          {eventData.eventTime || 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Lokasyon</p>
                        <p className="text-sm text-gray-600">
                          {eventData.location || 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <QrCode className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Masa Sayısı</p>
                        <p className="text-sm text-gray-600">
                          {eventData.tableCount || 5} masa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-1">
            <FadeIn delay={600}>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h2>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    onClick={handleViewQR}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <QrCode className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium">QR Kodları Görüntüle</span>
                  </button>
                  
                  <button
                    onClick={handleViewGallery}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Fotoğraf Galerisi</span>
                  </button>
                  
                  <button
                    onClick={handleEditEvent}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Etkinlik Düzenle</span>
                  </button>
                  
                  <button
                    onClick={handleShareEvent}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium">Etkinlik Paylaş</span>
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
