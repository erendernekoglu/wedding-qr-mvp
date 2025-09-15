'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Calendar,
  Users,
  FileImage,
  Clock,
  Download,
  RefreshCw
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

interface EventStats {
  totalEvents: number
  activeEvents: number
  pendingEvents: number
  totalFiles: number
  totalUsers: number
}

function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    activeEvents: 0,
    pendingEvents: 0,
    totalFiles: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'eventDate' | 'currentFiles'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterAndSortEvents()
  }, [events, searchTerm, filterStatus, sortBy, sortOrder])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/events')
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.data.events)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Events fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortEvents = () => {
    let filtered = [...events]

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Durum filtresi
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event => 
        filterStatus === 'active' ? event.isActive : !event.isActive
      )
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'eventDate':
          aValue = a.eventDate ? new Date(a.eventDate).getTime() : 0
          bValue = b.eventDate ? new Date(b.eventDate).getTime() : 0
          break
        case 'currentFiles':
          aValue = a.currentFiles || 0
          bValue = b.currentFiles || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredEvents(filtered)
  }

  const handleApproveEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/admin/events/approve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId })
      })

      const data = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.map(event => 
          event.id === eventId ? { ...event, isActive: true } : event
        ))
      }
    } catch (error) {
      console.error('Approve event error:', error)
    }
  }

  const handleRejectEvent = async (eventId: string) => {
    if (!confirm('Bu etkinliği reddetmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/events/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId })
      })

      const data = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.filter(event => event.id !== eventId))
      }
    } catch (error) {
      console.error('Reject event error:', error)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedEvents.length === 0) return

    try {
      const response = await fetch('/api/admin/events/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          eventIds: selectedEvents
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.map(event => 
          selectedEvents.includes(event.id) ? { ...event, isActive: true } : event
        ))
        setSelectedEvents([])
      }
    } catch (error) {
      console.error('Bulk approve error:', error)
    }
  }

  const handleBulkReject = async () => {
    if (selectedEvents.length === 0) return

    if (!confirm(`${selectedEvents.length} etkinliği reddetmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/events/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          eventIds: selectedEvents
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.filter(event => !selectedEvents.includes(event.id)))
        setSelectedEvents([])
      }
    } catch (error) {
      console.error('Bulk reject error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Az önce'
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`
    return `${Math.floor(diffInMinutes / 1440)} gün önce`
  }

  if (loading) {
    return (
      <AdminLayout title="Etkinlik Yönetimi" description="Sistem etkinliklerini yönetin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Etkinlik Yönetimi" description="Sistem etkinliklerini yönetin">
      <div className="space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Aktif Etkinlik</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeEvents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Bekleyen Onay</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingEvents}</dd>
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
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Etkinlik adı, kod veya açıklama ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="pending">Bekleyen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sırala</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="createdAt">Oluşturma Tarihi</option>
                  <option value="name">Etkinlik Adı</option>
                  <option value="eventDate">Etkinlik Tarihi</option>
                  <option value="currentFiles">Dosya Sayısı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sıra</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="desc">Azalan</option>
                  <option value="asc">Artan</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Toplu İşlemler */}
        {selectedEvents.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedEvents.length} etkinlik seçildi
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkApprove}
                  className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Toplu Onayla
                </button>
                <button
                  onClick={handleBulkReject}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4 inline mr-1" />
                  Toplu Reddet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Etkinlik Listesi */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <li key={event.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents(prev => [...prev, event.id])
                        } else {
                          setSelectedEvents(prev => prev.filter(id => id !== event.id))
                        }
                      }}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mr-4"
                    />
                    
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-pink-600" />
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">{event.name}</h3>
                        {event.isActive ? (
                          <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="ml-2 h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-mono">{event.code}</span>
                        {event.description && (
                          <span className="ml-2">• {event.description}</span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(event.createdAt)}
                        {event.eventDate && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Etkinlik: {formatDate(event.eventDate)}</span>
                          </>
                        )}
                        {event.location && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center">
                        <FileImage className="h-4 w-4 mr-1" />
                        {event.currentFiles || 0} dosya
                      </div>
                      {event.tableCount && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.tableCount} masa
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/events/${event.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Etkinliği görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      
                      {!event.isActive && (
                        <button
                          onClick={() => handleApproveEvent(event.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Etkinliği onayla"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleRejectEvent(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Etkinliği reddet"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Etkinlik bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinize uygun etkinlik bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function AdminEventsPage() {
  return <AdminEvents />
}
