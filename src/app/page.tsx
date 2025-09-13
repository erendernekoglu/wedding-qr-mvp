'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Share2, Camera, Users, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { validateBetaCode, trackBetaUsage } from '@/lib/beta-users'
import { validateEventCode, trackEventUsage } from '@/lib/event-validation'

export default function HomePage() {
  const [albumCode, setAlbumCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createdAlbum, setCreatedAlbum] = useState<{ code: string; url: string } | null>(null)
  const [betaAccessCode, setBetaAccessCode] = useState('')
  const [isBetaAccessGranted, setIsBetaAccessGranted] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [eventCode, setEventCode] = useState('')
  const [isEventAccessGranted, setIsEventAccessGranted] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Client-side hydration kontrolü
    setIsClient(true)
    
    // Beta access kontrolü
    const storedAccess = localStorage.getItem('beta-access')
    if (storedAccess === 'true') {
      setIsBetaAccessGranted(true)
    }
    
    // Event access kontrolü
    const storedEventAccess = localStorage.getItem('event-access')
    const storedEventCode = localStorage.getItem('event-code')
    if (storedEventAccess === 'true' && storedEventCode) {
      setIsEventAccessGranted(true)
      setEventCode(storedEventCode)
    }
  }, [])

  const generateCode = () => {
    // Basit kod üretimi - gerçek uygulamada daha güvenli olmalı
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    return code
  }

  const createAlbum = async () => {
    if (albumCode.trim().length < 3) {
      toast({
        title: 'Geçersiz kod',
        description: 'Album kodu en az 3 karakter olmalıdır.',
        variant: 'error'
      })
      return
    }

    setIsCreating(true)
    try {
      // API çağrısı yapılacak
      const response = await fetch('/api/albums/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: albumCode.trim() })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Album oluşturulamadı')
      }

      const data = await response.json()
      const albumUrl = `${window.location.origin}/u/${data.code}`
      setCreatedAlbum({ code: data.code, url: albumUrl })
      
      toast({
        title: 'Album oluşturuldu!',
        description: 'QR kodu paylaşarak misafirlerin fotoğraf yüklemesini sağlayabilirsiniz.',
        variant: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Album oluşturulamadı',
        variant: 'error'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const quickCreate = async () => {
    const code = generateCode()
    setAlbumCode(code)
    await createAlbum()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Kopyalandı!',
        description: 'URL panoya kopyalandı.',
        variant: 'success'
      })
    } catch {
      toast({
        title: 'Kopyalanamadı',
        description: 'Manuel olarak kopyalayın.',
        variant: 'error'
      })
    }
  }

  const downloadQR = () => {
    if (!createdAlbum) return
    
    const svg = document.getElementById('qr-code')?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `album-${createdAlbum.code}-qr.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const handleBetaAccess = async () => {
    if (!betaAccessCode.trim()) {
      toast({
        title: 'Kod Gerekli',
        description: 'Lütfen beta erişim kodunu girin.',
        variant: 'error'
      })
      return
    }

    try {
      const response = await fetch('/api/validate-beta-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: betaAccessCode })
      })
      
      if (!response.ok) {
        throw new Error('API hatası')
      }
      
      const { valid, betaCode, error } = await response.json()
      
      if (valid) {
        setIsBetaAccessGranted(true)
        localStorage.setItem('beta-access', 'true')
        localStorage.setItem('beta-code', betaAccessCode)
        
        // Kullanım istatistiği kaydet
        await trackBetaUsage(
          betaAccessCode,
          'anonymous',
          navigator.userAgent,
          'unknown', // IP adresi server-side'da alınabilir
          'beta_access'
        )
        
        toast({
          title: 'Beta Erişimi Onaylandı!',
          description: `Hoş geldiniz! ${betaCode?.name || 'Beta'} kodunu kullanıyorsunuz.`,
          variant: 'success'
        })
      } else {
        toast({
          title: 'Geçersiz Kod',
          description: error || 'Beta erişim kodu geçersiz, süresi dolmuş veya kullanım limitine ulaşmış.',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Beta access error:', error)
      toast({
        title: 'Hata',
        description: 'Beta erişim kontrolü sırasında bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  const handleEventAccess = async () => {
    if (!eventCode.trim()) {
      toast({
        title: 'Kod Gerekli',
        description: 'Lütfen etkinlik kodunu girin.',
        variant: 'error'
      })
      return
    }

    try {
      const response = await fetch('/api/validate-event-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: eventCode })
      })
      
      if (!response.ok) {
        throw new Error('API hatası')
      }
      
      const { valid, event, error } = await response.json()
      
      if (valid) {
        setIsEventAccessGranted(true)
        setCurrentEvent(event)
        localStorage.setItem('event-access', 'true')
        localStorage.setItem('event-code', eventCode)
        
        // Kullanım istatistiği kaydet
        await trackEventUsage(
          eventCode,
          'anonymous',
          navigator.userAgent,
          'unknown',
          'event_access',
          0
        )
        
        toast({
          title: 'Etkinlik Erişimi Onaylandı!',
          description: `Hoş geldiniz! ${event?.name || 'Etkinlik'} kodunu kullanıyorsunuz.`,
          variant: 'success'
        })
      } else {
        toast({
          title: 'Geçersiz Kod',
          description: error || 'Etkinlik kodu geçersiz, süresi dolmuş veya kullanım limitine ulaşmış.',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Event access error:', error)
      toast({
        title: 'Hata',
        description: 'Etkinlik erişim kontrolü sırasında bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  // Client-side hydration kontrolü
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Beta access kontrolü
  if (!isBetaAccessGranted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Lock className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Beta Sürümü
              </h1>
              <p className="text-gray-600 mb-6">
                Bu uygulama şu anda beta aşamasındadır. Erişim için beta kodunu girin.
              </p>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={betaAccessCode}
                    onChange={(e) => setBetaAccessCode(e.target.value.toUpperCase())}
                    placeholder="Beta Erişim Kodu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-center font-mono"
                  />
                </div>
                
                <button
                  onClick={handleBetaAccess}
                  disabled={!betaAccessCode.trim()}
                  className="w-full bg-brand-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Beta Erişimi Al
                </button>
                
                <p className="text-xs text-gray-500">
                  Beta kodu için geliştirici ile iletişime geçin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Etkinlik erişim kontrolü
  if (!isEventAccessGranted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Etkinlik Erişimi
              </h1>
              <p className="text-gray-600 mb-6">
                Etkinliğe katılmak için etkinlik kodunu girin.
              </p>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                    placeholder="Etkinlik Kodu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-center font-mono"
                  />
                </div>
                
                <button
                  onClick={handleEventAccess}
                  disabled={!eventCode.trim()}
                  className="w-full bg-brand-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Etkinliğe Katıl
                </button>
                
                <p className="text-xs text-gray-500">
                  Etkinlik kodu için organizatör ile iletişime geçin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {currentEvent?.name || 'Momento'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {currentEvent?.description || 'Etkinliklerinizin anılarını kolayca paylaşın. QR kod ile hızlı erişim, Google Drive ile güvenli saklama.'}
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            <Camera className="w-4 h-4 mr-1" />
            Etkinlik: {currentEvent?.code}
          </div>
        </header>

        {!createdAlbum ? (
          /* Album Oluşturma Formu */
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-center mb-6">
                Yeni Etkinlik Oluştur
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etkinlik Kodu
                  </label>
                  <input
                    type="text"
                    value={albumCode}
                    onChange={(e) => setAlbumCode(e.target.value.toUpperCase())}
                    placeholder="örn: PARTY2024"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Katılımcılar bu kodu kullanarak fotoğraf yükleyecek
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={createAlbum}
                    disabled={isCreating || !albumCode.trim()}
                    className="w-full bg-brand-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreating ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">veya</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={quickCreate}
                    disabled={isCreating}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Hızlı Oluştur (Rastgele Kod)
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* QR Kod ve Paylaşım */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Etkinlik Hazır! 🎉
                </h2>
                <p className="text-gray-600">
                  QR kodu paylaşarak katılımcıların fotoğraf yüklemesini sağlayın
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* QR Kod */}
                <div className="text-center">
                  <div id="qr-code" className="inline-block p-4 bg-white rounded-xl shadow-lg">
                    <QRCodeSVG
                      value={createdAlbum.url}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Etkinlik Kodu: <span className="font-mono font-semibold">{createdAlbum.code}</span>
                  </p>
                </div>

                {/* Paylaşım Butonları */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etkinlik URL'si
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={createdAlbum.url}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(createdAlbum.url)}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => copyToClipboard(createdAlbum.url)}
                      className="flex items-center justify-center space-x-2 py-2 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Kopyala</span>
                    </button>
                    
                    <button
                      onClick={downloadQR}
                      className="flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>QR İndir</span>
                    </button>
                  </div>

                  <button
                    onClick={() => window.open(createdAlbum.url, '_blank')}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Etkinlik Sayfasını Aç</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setCreatedAlbum(null)
                      setAlbumCode('')
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Yeni Etkinlik Oluştur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Özellikler */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Kolay Yükleme</h3>
            <p className="text-gray-600">
              QR kod okutarak anında fotoğraf yükleme. Uygulama gerekmez.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Güvenli Paylaşım</h3>
            <p className="text-gray-600">
              Google Drive ile güvenli saklama ve organize edilmiş dosyalar.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Anında Erişim</h3>
            <p className="text-gray-600">
              Tüm katılımcılar aynı anda fotoğraf yükleyebilir ve paylaşabilir.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
