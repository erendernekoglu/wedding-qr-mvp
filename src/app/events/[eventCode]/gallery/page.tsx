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
  tableNames?: string[]
}

interface Photo {
  id: string
  name: string
  url: string
  downloadUrl: string
  tableNumber: number
  tableName: string
  uploadedAt: string
  size: number
  mimeType: string
}

export default function EventGalleryPage() {
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  
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

  // Otomatik yenileme (30 saniyede bir)
  useEffect(() => {
    if (!isAuthenticated || !eventData) return

    const interval = setInterval(() => {
      loadPhotos()
    }, 30000) // 30 saniye

    return () => clearInterval(interval)
  }, [isAuthenticated, eventData])

  const loadEventData = async () => {
    try {
      const response = await fetch(`/api/events/${eventCode}?t=${Date.now()}`, {
        cache: 'no-store'
      })
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
      
      const response = await fetch(`/api/events/${eventCode}/gallery`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error('Failed to load photos')
      }

      setPhotos(result.data || [])
      
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
    link.href = photo.downloadUrl
    link.download = photo.name
    link.target = '_blank'
    link.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
  }

  const closeModal = () => {
    setSelectedPhoto(null)
  }

  // Masa bazlı fotoğrafları grupla
  const photosByTable = photos.reduce((acc, photo) => {
    if (!acc[photo.tableNumber]) {
      acc[photo.tableNumber] = []
    }
    acc[photo.tableNumber].push(photo)
    return acc
  }, {} as Record<number, Photo[]>)

  // Seçili masanın fotoğrafları
  const currentTablePhotos = selectedTable ? photosByTable[selectedTable] || [] : []

  // Masa istatistikleri
  const tableStats = Object.keys(photosByTable).map(tableNum => {
    const tableNumber = parseInt(tableNum)
    const tablePhotos = photosByTable[tableNumber]
    const tableName = eventData?.tableNames?.[tableNumber - 1] || `Masa ${tableNumber}`
    
    return {
      tableNumber,
      tableName,
      photoCount: tablePhotos.length,
      lastUpload: tablePhotos.length > 0 
        ? Math.max(...tablePhotos.map(p => new Date(p.uploadedAt).getTime()))
        : 0
    }
  }).sort((a, b) => a.tableNumber - b.tableNumber)

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
            
            <div className="flex items-center space-x-3">
              <img 
                src="/logos/logo.png" 
                alt="Momento Logo" 
                className="w-28 h-28"
              />
              <img 
                src="/logos/yazı.png" 
                alt="Momento" 
                className="h-24"
              />
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
                    {tableStats.length}
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

        {/* Masa Seçimi */}
        {photos.length > 0 && (
          <FadeIn delay={400}>
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Masalar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tableStats.map((table, index) => (
                  <button
                    key={table.tableNumber}
                    onClick={() => setSelectedTable(table.tableNumber)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTable === table.tableNumber
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-pink-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">{table.tableName}</h4>
                      <p className="text-sm text-gray-600">{table.photoCount} fotoğraf</p>
                      {table.lastUpload > 0 && (
                        <p className="text-xs text-gray-500">
                          {new Date(table.lastUpload).toLocaleTimeString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

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
        ) : selectedTable ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {tableStats.find(t => t.tableNumber === selectedTable)?.tableName} - {currentTablePhotos.length} fotoğraf
              </h3>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Tüm masaları göster
              </button>
            </div>
            {currentTablePhotos.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileImage className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600">Bu masada henüz fotoğraf yok.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentTablePhotos.map((photo, index) => (
                  <FadeIn key={photo.id} delay={400 + index * 50}>
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="aspect-square relative group cursor-pointer" onClick={() => handlePhotoClick(photo)}>
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePhotoClick(photo)
                              }}
                              className="bg-white text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadPhoto(photo)
                              }}
                              className="bg-white text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
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
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600">Bir masa seçin ve fotoğraflarını görüntüleyin.</p>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedPhoto.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedPhoto.tableName} • {formatFileSize(selectedPhoto.size)} • {new Date(selectedPhoto.uploadedAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPhoto(selectedPhoto)}
                  className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>İndir</span>
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
