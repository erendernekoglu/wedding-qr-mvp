'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Camera, Users, Image } from 'lucide-react'
import EnhancedUploadDropzone from '@/components/EnhancedUploadDropzone'

interface EventData {
  id: string
  code: string
  name: string
  description?: string
  tableCount?: number
  tableNames?: string[]
}

interface TableStats {
  tableNumber: number
  photoCount: number
  tableName: string
}

export default function GuestUploadPage() {
  const { code } = useParams<{ code: string }>()
  const searchParams = useSearchParams()
  const tableNumber = parseInt(searchParams.get('table') || '1')
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [tableStats, setTableStats] = useState<TableStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Event data'yı yükle
        const eventResponse = await fetch(`/api/events/${code}?t=${Date.now()}`, {
          cache: 'no-store'
        })
        
        if (eventResponse.ok) {
          const eventResult = await eventResponse.json()
          if (eventResult.success) {
            setEventData(eventResult.data)
          }
        }

        // Table stats'ı yükle
        const statsResponse = await fetch(`/api/events/${code}/table-stats?table=${tableNumber}&t=${Date.now()}`, {
          cache: 'no-store'
        })
        
        if (statsResponse.ok) {
          const statsResult = await statsResponse.json()
          if (statsResult.success) {
            setTableStats(statsResult.data)
          }
        }
      } catch (error) {
        console.error('Data load error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [code, tableNumber])
  
  // Masa ismini al
  const getTableName = () => {
    if (tableStats) return tableStats.tableName
    if (!eventData) return `Masa ${tableNumber}`
    
    const tableCount = eventData.tableCount || 5
    const tableNames = eventData.tableNames || []
    
    // Eğer özel masa ismi varsa onu kullan, yoksa varsayılan
    if (tableNames[tableNumber - 1]) {
      return tableNames[tableNumber - 1]
    }
    
    return `Masa ${tableNumber}`
  }

  const handlePhotoCountUpdate = (increment: number) => {
    setTableStats(prev => prev ? {
      ...prev,
      photoCount: prev.photoCount + increment
    } : null)
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-lg p-6 space-y-6">
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Anı Yükle
          </h1>
          
          <p className="text-gray-600 font-medium">
            Uygulama yok, giriş yok. Sadece yükle.
          </p>
          
          {loading ? (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Masa: {tableNumber}</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>{getTableName()}</span>
            </div>
          )}
        </header>

        {/* Table Stats */}
        {tableStats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full mb-2">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {tableStats.photoCount}
                </div>
                <div className="text-sm text-gray-500">
                  Fotoğraf
                </div>
              </div>
              
              <div className="w-px h-16 bg-gray-200"></div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {tableStats.tableName}
                </div>
                <div className="text-sm text-gray-500">
                  Masa
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Component */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <EnhancedUploadDropzone 
            albumCode={String(code)} 
            tableNumber={String(tableNumber)}
            onPhotoCountUpdate={handlePhotoCountUpdate}
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500">
          <p>Anılarınız güvenle saklanır ve paylaşılır</p>
        </footer>
      </div>
    </main>
  )
}
