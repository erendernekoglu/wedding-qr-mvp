'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft,
  Download,
  Share2,
  QrCode,
  Copy,
  Check,
  Upload
} from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/Animations'
import { useToast } from '@/components/ui/Toast'
import QRCode from 'qrcode.react'

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

export default function EventQRPage() {
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
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

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/u/${eventCode}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({
      title: 'Link Kopyalandı!',
      description: 'Etkinlik linki panoya kopyalandı.',
      variant: 'success'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.download = `qr-code-${eventCode}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/u/${eventCode}`
    if (navigator.share) {
      navigator.share({
        title: eventData?.name || 'Etkinlik',
        text: 'Bu etkinliğe katılmak için QR kodu okutun!',
        url: shareUrl
      })
    } else {
      handleCopyLink()
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">QR kodlar yükleniyor...</p>
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
            <QrCode className="w-8 h-8 text-gray-400" />
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

  const tableCount = eventData.tableCount || 5
  const tableNames = eventData.tableNames || Array.from({ length: tableCount }, (_, i) => `Masa ${i + 1}`)
  const shareUrl = `${window.location.origin}/u/${eventCode}`

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
                className="w-16 h-16"
              />
              <img 
                src="/logos/yazı.png" 
                alt="Momento" 
                className="h-32"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventData.name}</h1>
            <p className="text-gray-600">QR Kodlar - {tableCount} Masa</p>
          </div>
        </FadeIn>

        {/* QR Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: tableCount }, (_, index) => (
            <FadeIn key={index} delay={index * 100}>
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{tableNames[index] || `Masa ${index + 1}`}</h3>
                <div className="mb-4">
                  <QRCode
                    id={`qr-code-${index}`}
                    value={`${shareUrl}?table=${index + 1}`}
                    size={150}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Misafirler bu QR kodu okutarak fotoğraf yükleyebilir
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const canvas = document.getElementById(`qr-code-${index}`) as HTMLCanvasElement
                      if (canvas) {
                        const link = document.createElement('a')
                        link.download = `masa-${index + 1}-qr-code.png`
                        link.href = canvas.toDataURL()
                        link.click()
                      }
                    }}
                    className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    QR İndir
                  </button>
                  
                  <button
                    onClick={() => {
                      const uploadUrl = `${shareUrl}?table=${index + 1}`
                      window.open(uploadUrl, '_blank')
                    }}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Fotoğraf Yükle
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Actions */}
        <FadeIn delay={500}>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span>{copied ? 'Kopyalandı!' : 'Link Kopyala'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Paylaş</span>
              </button>
              
              <button
                onClick={handleDownloadQR}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Tüm QR Kodları İndir</span>
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Instructions */}
        <FadeIn delay={600}>
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Nasıl Kullanılır?</h3>
            <div className="space-y-2 text-blue-800">
              <p>1. Her masa için ayrı QR kod yazdırın</p>
              <p>2. QR kodları masalara yerleştirin</p>
              <p>3. Misafirler QR kodu okutarak fotoğraf yükleyebilir</p>
              <p>4. Yüklenen fotoğraflar canlı galeride görünür</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
