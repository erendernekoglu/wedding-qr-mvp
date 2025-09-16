'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Users,
  QrCode
} from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/Animations'
import { useToast } from '@/components/ui/Toast'

interface EventData {
  id: string
  code: string
  name: string
  tableCount?: number
  tableNames?: string[]
}

export default function EventTablesPage() {
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [tableNames, setTableNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
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
      
      // Masa isimlerini yükle veya varsayılan oluştur
      const tableCount = result.data.tableCount || 5
      const existingNames = result.data.tableNames || []
      const defaultNames = Array.from({ length: tableCount }, (_, i) => 
        existingNames[i] || `Masa ${i + 1}`
      )
      setTableNames(defaultNames)
      
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

  const handleTableNameChange = (index: number, value: string) => {
    const newNames = [...tableNames]
    newNames[index] = value
    setTableNames(newNames)
  }

  const handleAddTable = () => {
    setTableNames([...tableNames, `Masa ${tableNames.length + 1}`])
  }

  const handleRemoveTable = (index: number) => {
    if (tableNames.length > 1) {
      const newNames = tableNames.filter((_, i) => i !== index)
      setTableNames(newNames)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      console.log('Saving table names:', { tableNames, tableCount: tableNames.length })
      
      const response = await fetch(`/api/events/${eventCode}/tables`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNames,
          tableCount: tableNames.length
        })
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)

      if (result.success) {
        toast({
          title: 'Başarılı!',
          description: 'Masa isimleri güncellendi.',
          variant: 'success'
        })
        
        // Etkinlik detaylarına dön
        router.push(`/events/${eventCode}`)
      } else {
        throw new Error(result.error || 'Update failed')
      }
      
    } catch (error: any) {
      console.error('Save error:', error)
      toast({
        title: 'Hata!',
        description: `Masa isimleri güncellenirken bir hata oluştu: ${error?.message || 'Bilinmeyen hata'}`,
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Masa isimleri yükleniyor...</p>
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
            <Users className="w-8 h-8 text-gray-400" />
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Masa İsimlerini Düzenle</h1>
            <p className="text-gray-600">{eventData.name} - {tableNames.length} masa</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Masa Listesi */}
          <div className="lg:col-span-2">
            <FadeIn delay={200}>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Masa Listesi</h2>
                    <button
                      onClick={handleAddTable}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Masa Ekle</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {tableNames.map((name, index) => (
                      <FadeIn key={index} delay={300 + index * 50}>
                        <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleTableNameChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Masa adı"
                          />
                          {tableNames.length > 1 && (
                            <button
                              onClick={() => handleRemoveTable(index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </FadeIn>
                    ))}
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
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                  </button>
                  
                  <button
                    onClick={() => router.push(`/events/${eventCode}/qr`)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Kodları Görüntüle</span>
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Preview */}
        <FadeIn delay={500}>
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Önizleme</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tableNames.map((name, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-2">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
