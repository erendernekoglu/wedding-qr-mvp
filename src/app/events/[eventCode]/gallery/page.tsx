'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft,
  Download,
  RefreshCcw,
  Eye,
  Calendar,
  Users,
  FileImage
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

interface Photo {
  id: string
  name: string
  url: string
  tableNumber: number
  uploadedAt: string
  size: number
}

export default function EventGalleryPage() {
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
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
      loadPhotos()
    }
  }, [isAuthenticated, authLoading, router, eventCode])

  const loadEventData = async () => {
    try {
      const response = await fetch(`/api/events/${eventCode}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error('Event not found')
      }

      setEventData(result.data)
      
    } catch (error) {
      console.error('Event data load error:', error)
      toast({
        title: 'Hata!',
        description: 'Etkinlik verileri yüklenirken bir hata oluştu.',
        variant: 'error'
      })
      router.push('/dashboard')
    }
  }

  const loadPhotos = async () => {
    try {
      setLoading(true)
      
      // Mock photos - gerçek uygulamada API'den gelecek
      const mockPhotos: Photo[] = [
        {
          id: '1',
          name: 'photo1.jpg',
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
          tableNumber: 1,
          uploadedAt: new Date().toISOString(),
          size: 1024000
        },
        {
          id: '2',
          name: 'photo2.jpg',
          url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80',
          tableNumber: 2,
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          size: 2048000
        },
        {
          id: '3',
          name: 'photo3.jpg',
          url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80',
          tableNumber: 1,
          uploadedAt: new Date(Date.now() - 7200000).toISOString(),
          size: 1536000
        },
        {
          id: '4',
          name: 'photo4.jpg',
          url: 'https://images.unsplash.com/photo-1533174072545-7bd46c006744?auto=format&fit=crop&w=400&q=80',
          tableNumber: 3,
          uploadedAt: new Date(Date.now() - 10800000).toISOString(),
          size: 3072000
        }
      ]
      
      setPhotos(mockPhotos)
      
    } catch (error) {
      console.error('Photos load error:', error)
      toast({
        title: 'Hata!',
        description: 'Fotoğraflar yüklenirken bir hata oluştu.',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPhotos()
    setRefreshing(false)
    toast({
      title: 'Başarılı!',
      description: 'Galeri güncellendi.',
      variant: 'success'
    })
  }

  const handleDownloadPhoto = (photo: Photo) => {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.name
    link.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Galeri yükleniyor...</p>
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
            <FileImage className="w-8 h-8 text-gray-400" />
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
                onClick={() => router.push(`/events/${eventCode}`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Etkinlik Detaylarına Dön</span>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventData.name}</h1>
              <p className="text-gray-600">Canlı Fotoğraf Galerisi</p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Yenile</span>
            </button>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <FadeIn delay={100}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Fotoğraf</p>
                  <p className="text-3xl font-bold text-gray-900">{photos.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Aktif Masa</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set(photos.map(p => p.tableNumber)).size}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Son Yükleme</p>
                  <p className="text-lg font-bold text-gray-900">
                    {photos.length > 0 
                      ? new Date(photos[0].uploadedAt).toLocaleTimeString('tr-TR')
                      : 'Yok'
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <FadeIn delay={400}>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz fotoğraf yok</h3>
              <p className="text-gray-600 mb-4">Misafirler fotoğraf yükledikçe burada görünecek.</p>
              <button 
                onClick={handleRefresh}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Yenile
              </button>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <FadeIn key={photo.id} delay={400 + index * 50}>
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="aspect-square relative group">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <button
                        onClick={() => handleDownloadPhoto(photo)}
                        className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Masa {photo.tableNumber}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{photo.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(photo.size)} • {new Date(photo.uploadedAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
