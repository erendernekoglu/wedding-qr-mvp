'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import UploadDropzone from '@/components/UploadDropzone'

interface EventData {
  id: string
  code: string
  name: string
  description?: string
  tableCount?: number
  tableNames?: string[]
}

export default function GuestUploadPage() {
  const { code } = useParams<{ code: string }>()
  const searchParams = useSearchParams()
  const tableNumber = parseInt(searchParams.get('table') || '1')
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadEventData = async () => {
      try {
        const response = await fetch(`/api/events/${code}?t=${Date.now()}`, {
          cache: 'no-store'
        })
        
        if (!response.ok) {
          throw new Error('Event not found')
        }
        
        const result = await response.json()
        if (result.success) {
          setEventData(result.data)
        }
      } catch (error) {
        console.error('Event data load error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadEventData()
  }, [code])
  
  // Masa ismini al
  const getTableName = () => {
    if (!eventData) return `Masa ${tableNumber}`
    
    const tableCount = eventData.tableCount || 5
    const tableNames = eventData.tableNames || []
    
    // Eğer özel masa ismi varsa onu kullan, yoksa varsayılan
    if (tableNames[tableNumber - 1]) {
      return tableNames[tableNumber - 1]
    }
    
    return `Masa ${tableNumber}`
  }
  
  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Anı Yükle 📸</h1>
        <p className="text-sm text-slate-600">Uygulama yok, giriş yok. Sadece yükle.</p>
        {loading ? (
          <p className="text-xs text-blue-600">Masa: {tableNumber}</p>
        ) : (
          <p className="text-xs text-blue-600">{getTableName()}</p>
        )}
      </header>
      <UploadDropzone albumCode={String(code)} tableNumber={String(tableNumber)} />
    </main>
  )
}
