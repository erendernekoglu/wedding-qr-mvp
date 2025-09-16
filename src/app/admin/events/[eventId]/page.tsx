'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Clock,
  Users,
  FileImage,
  Settings,
  QrCode,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react'

interface Event {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  maxFiles?: number
  currentFiles: number
  createdBy: string
  createdAt: string
  eventDate?: string
  eventTime?: string
  location?: string
  tableCount?: number
  customMessage?: string
  tableNames?: string[]
}

interface Table {
  id: string
  name: string
  qrCode?: string
  photoCount?: number
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    customMessage: '',
    maxFiles: 100,
    tableCount: 1
  })

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}`)
      const data = await response.json()
      
      if (data.success) {
        setEvent(data.data.event)
        setTables(data.data.tables || [])
        
        // Form verilerini doldur
        setFormData({
          name: data.data.event.name || '',
          description: data.data.event.description || '',
          eventDate: data.data.event.eventDate || '',
          eventTime: data.data.event.eventTime || '',
          location: data.data.event.location || '',
          customMessage: data.data.event.customMessage || '',
          maxFiles: data.data.event.maxFiles || 100,
          tableCount: data.data.event.tableCount || 1
        })
      } else {
        setError(data.error || 'Etkinlik bulunamadı')
      }
    } catch (error) {
      console.error('Event fetch error:', error)
      setError('Etkinlik bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Etkinlik başarıyla güncellendi!')
        setIsEditing(false)
        fetchEventDetails() // Verileri yenile
      } else {
        setError(data.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Update error:', error)
      setError('Güncelleme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleTableNameChange = async (tableId: string, newName: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/tables/${tableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName })
      })

      const data = await response.json()
      
      if (data.success) {
        setTables(prev => prev.map(table => 
          table.id === tableId ? { ...table, name: newName } : table
        ))
        setSuccess('Masa adı güncellendi!')
      } else {
        setError(data.error || 'Masa adı güncellenemedi')
      }
    } catch (error) {
      console.error('Table name update error:', error)
      setError('Masa adı güncellenirken hata oluştu')
    }
  }

  const handleAddTable = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      const data = await response.json()
      
      if (data.success) {
        setTables(prev => [...prev, data.data.table])
        setSuccess('Yeni masa eklendi!')
      } else {
        setError(data.error || 'Masa eklenemedi')
      }
    } catch (error) {
      console.error('Add table error:', error)
      setError('Masa eklenirken hata oluştu')
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Bu masayı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}/tables/${tableId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setTables(prev => prev.filter(table => table.id !== tableId))
        setSuccess('Masa silindi!')
      } else {
        setError(data.error || 'Masa silinemedi')
      }
    } catch (error) {
      console.error('Delete table error:', error)
      setError('Masa silinirken hata oluştu')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout title="Etkinlik Detayları" description="Etkinlik bilgilerini görüntüleyin ve düzenleyin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!event) {
    return (
      <AdminLayout title="Etkinlik Bulunamadı" description="Aradığınız etkinlik bulunamadı">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Etkinlik bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aradığınız etkinlik mevcut değil veya silinmiş olabilir.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/admin/events')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Etkinliklere Dön
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Etkinlik Detayları" description="Etkinlik bilgilerini görüntüleyin ve düzenleyin">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin/events')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                  <p className="text-sm text-gray-500">Etkinlik Kodu: {event.code}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {event.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Bekleyen
                  </span>
                )}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'İptal' : 'Düzenle'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hata/Success Mesajları */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Hata</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Başarılı</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Etkinlik Bilgileri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temel Bilgiler */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etkinlik Adı
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etkinlik Tarihi
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etkinlik Saati
                      </label>
                      <input
                        type="time"
                        name="eventTime"
                        value={formData.eventTime}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konum
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Özel Mesaj
                    </label>
                    <textarea
                      name="customMessage"
                      value={formData.customMessage}
                      onChange={handleInputChange}
                      rows={2}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Misafirlere gösterilecek özel mesaj..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maksimum Dosya Sayısı
                      </label>
                      <input
                        type="number"
                        name="maxFiles"
                        value={formData.maxFiles}
                        onChange={handleInputChange}
                        min="1"
                        max="1000"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Masa Sayısı
                      </label>
                      <input
                        type="number"
                        name="tableCount"
                        value={formData.tableCount}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2 inline" />
                          Kaydet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Etkinlik Adı</p>
                      <p className="text-sm text-gray-500">{event.name}</p>
                    </div>
                  </div>
                  
                  {event.description && (
                    <div className="flex items-start">
                      <Settings className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Açıklama</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.eventDate && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Etkinlik Tarihi</p>
                        <p className="text-sm text-gray-500">{formatDate(event.eventDate)}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Konum</p>
                        <p className="text-sm text-gray-500">{event.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <FileImage className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dosya Durumu</p>
                      <p className="text-sm text-gray-500">
                        {event.currentFiles || 0} / {event.maxFiles || 100} dosya
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Masa Sayısı</p>
                      <p className="text-sm text-gray-500">{event.tableCount || 0} masa</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* İstatistikler */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">İstatistikler</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Toplam Dosya</span>
                  <span className="text-lg font-semibold text-gray-900">{event.currentFiles || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Masa Sayısı</span>
                  <span className="text-lg font-semibold text-gray-900">{event.tableCount || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Oluşturulma Tarihi</span>
                  <span className="text-sm text-gray-900">{formatDate(event.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Durum</span>
                  <span className={`text-sm font-medium ${event.isActive ? 'text-green-600' : 'text-yellow-600'}`}>
                    {event.isActive ? 'Aktif' : 'Bekleyen'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Masa Yönetimi */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Masa Yönetimi</h3>
              <button
                onClick={handleAddTable}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Masa Ekle
              </button>
            </div>
            
            {tables.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz masa eklenmemiş</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Etkinlik için masa ekleyerek QR kodları oluşturabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div key={table.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{table.name}</h4>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Fotoğraf Sayısı:</span>
                        <span>{table.photoCount || 0}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTable(table)
                            setShowQRModal(true)
                          }}
                          className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <QrCode className="h-3 w-3 mr-1" />
                          QR Kod
                        </button>
                        
                        <button
                          onClick={() => {
                            const newName = prompt('Yeni masa adı:', table.name)
                            if (newName && newName.trim() !== '') {
                              handleTableNameChange(table.id, newName.trim())
                            }
                          }}
                          className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Düzenle
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hızlı İşlemler</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href={`/events/${event.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Etkinliği Görüntüle
              </a>
              
              <a
                href={`/events/${event.code}/gallery`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileImage className="h-4 w-4 mr-2" />
                Fotoğraf Galerisi
              </a>
              
              <button
                onClick={() => {
                  // QR kodları indirme işlemi
                  window.open(`/api/events/${event.code}/qr-codes`, '_blank')
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                QR Kodları İndir
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
