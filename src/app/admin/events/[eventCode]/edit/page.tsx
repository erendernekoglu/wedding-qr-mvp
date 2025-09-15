'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Clock,
  Users,
  QrCode,
  Settings,
  CheckCircle,
  X
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

export default function AdminEventEditPage() {
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    tableCount: 5,
    maxFiles: 100,
    customMessage: '',
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const eventCode = params.eventCode as string

  useEffect(() => {
    loadEventData()
  }, [eventCode])

  const loadEventData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/events/${eventCode}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error('Event not found')
      }

      setEventData(result.data)
      setFormData({
        name: result.data.name || '',
        description: result.data.description || '',
        eventDate: result.data.eventDate || '',
        eventTime: result.data.eventTime || '',
        location: result.data.location || '',
        tableCount: result.data.tableCount || 5,
        maxFiles: result.data.maxFiles || 100,
        customMessage: result.data.customMessage || '',
        isActive: result.data.isActive
      })
      
    } catch (error) {
      console.error('Event data load error:', error)
      toast({
        title: 'Hata!',
        description: 'Etkinlik verileri yüklenirken bir hata oluştu.',
        variant: 'error'
      })
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/events/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventCode,
          ...formData
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Başarılı!',
          description: 'Etkinlik başarıyla güncellendi.',
          variant: 'success'
        })
        
        // Admin sayfasına dön
        router.push('/admin')
      } else {
        throw new Error(result.error || 'Update failed')
      }
      
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Etkinlik güncellenirken bir hata oluştu.',
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/events/${eventCode}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Başarılı!',
          description: 'Etkinlik onaylandı.',
          variant: 'success'
        })
        
        // Admin sayfasına dön
        router.push('/admin')
      } else {
        throw new Error(result.error || 'Approval failed')
      }
      
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Etkinlik onaylanırken bir hata oluştu.',
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/events/${eventCode}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Başarılı!',
          description: 'Etkinlik reddedildi.',
          variant: 'success'
        })
        
        // Admin sayfasına dön
        router.push('/admin')
      } else {
        throw new Error(result.error || 'Rejection failed')
      }
      
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Etkinlik reddedilirken bir hata oluştu.',
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Etkinlik yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Etkinlik Bulunamadı</h3>
          <p className="text-gray-600 mb-4">Bu etkinlik mevcut değil.</p>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Admin Paneline Dön
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
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Admin Paneline Dön</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Momento Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Etkinlik Düzenle</h1>
            <p className="text-gray-600">Etkinlik bilgilerini düzenleyin ve onaylayın</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <FadeIn delay={200}>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Etkinlik Bilgileri</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etkinlik Adı
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Etkinlik adı"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Etkinlik açıklaması"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarih
                      </label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleInputChange('eventDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saat
                      </label>
                      <input
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) => handleInputChange('eventTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasyon
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Etkinlik lokasyonu"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Masa Sayısı
                      </label>
                      <input
                        type="number"
                        value={formData.tableCount}
                        onChange={(e) => handleInputChange('tableCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        min="1"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimum Fotoğraf
                      </label>
                      <input
                        type="number"
                        value={formData.maxFiles}
                        onChange={(e) => handleInputChange('maxFiles', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        min="1"
                        max="10000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Özel Mesaj
                    </label>
                    <textarea
                      value={formData.customMessage}
                      onChange={(e) => handleInputChange('customMessage', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Misafirlerin göreceği özel mesaj"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Etkinliği aktif et
                    </label>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1">
            <FadeIn delay={400}>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">İşlemler</h2>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Kaydet</span>
                  </button>

                  {!eventData.isActive && (
                    <button
                      onClick={handleApprove}
                      disabled={saving}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Onayla</span>
                    </button>
                  )}

                  <button
                    onClick={handleReject}
                    disabled={saving}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Reddet</span>
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
