'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Share2, Camera, Users, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { validateBetaCode, trackBetaUsage } from '@/lib/beta-users'
import { validateEventCode, trackEventUsage } from '@/lib/event-validation'

export default function BetaCodePage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)
  const [isBetaAccessGranted, setIsBetaAccessGranted] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [eventCode, setEventCode] = useState('')
  const [isEventAccessGranted, setIsEventAccessGranted] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const betaCode = params.betaCode as string

  useEffect(() => {
    setIsClient(true)
    
    // Her girişte localStorage'ı temizle - sıfırdan başla
    localStorage.removeItem('beta-access')
    localStorage.removeItem('event-access')
    localStorage.removeItem('event-code')
    localStorage.removeItem('event-data')
    
    // State'leri sıfırla
    setIsBetaAccessGranted(false)
    setIsEventAccessGranted(false)
    setCurrentEvent(null)
    setEventCode('')
    setUploadedFile(null)
    
    // URL'den beta kodunu al ve doğrula
    if (betaCode) {
      handleBetaAccess(betaCode)
    }
  }, [betaCode])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return
    if (!currentEvent) {
      toast({
        title: 'Hata',
        description: 'Etkinlik bulunamadı',
        variant: 'error'
      })
      return
    }
    
    setIsUploading(true)
    try {
      // Her dosya için upload işlemi
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // FormData oluştur
        const formData = new FormData()
        formData.append('file', file)
        formData.append('albumCode', currentEvent.code)
        
        // Upload API'sine istek gönder
        const response = await fetch(`/api/u/${currentEvent.code}/upload`, {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }
        
        const result = await response.json()
        console.log('Upload result:', result)
      }
      
      // İlk dosyayı başarılı olarak göster
      setUploadedFile({
        name: files[0].name,
        url: 'https://drive.google.com'
      })
      
      // Etkinlik dosya sayısını güncelle
      setCurrentEvent((prev: any) => prev ? {
        ...prev,
        currentFiles: prev.currentFiles + files.length
      } : null)
      
      // Kullanım istatistiği kaydet
      await trackEventUsage(
        currentEvent.code,
        'anonymous',
        navigator.userAgent,
        'unknown',
        'file_upload',
        files.length
      )
      
      toast({
        title: 'Başarılı!',
        description: `${files.length} dosya başarıyla yüklendi`,
        variant: 'success'
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Fotoğraf yüklenirken bir hata oluştu',
        variant: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogout = () => {
    // State'leri sıfırla
    setIsBetaAccessGranted(false)
    setIsEventAccessGranted(false)
    setCurrentEvent(null)
    setEventCode('')
    setUploadedFile(null)
    
    // Ana sayfaya yönlendir
    router.push('/')
    
    toast({
      title: 'Çıkış Yapıldı',
      description: 'Oturum sonlandırıldı',
      variant: 'info'
    })
  }

  const downloadQR = () => {
    if (!currentEvent) return
    
    try {
      const qrElement = document.getElementById('qr-code')
      if (!qrElement) return
      
      const svg = qrElement.querySelector('svg')
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
        downloadLink.download = `etkinlik-qr-${currentEvent.code}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    } catch (error) {
      console.error('QR download error:', error)
    }
  }

  const handleBetaAccess = async (code: string) => {
    try {
      const response = await fetch('/api/validate-beta-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!response.ok) {
        throw new Error('API hatası')
      }
      
      const { valid, betaCode, error } = await response.json()
      
      if (valid) {
        setIsBetaAccessGranted(true)
        
        // Kullanım istatistiği kaydet
        await trackBetaUsage(
          code,
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
        // Geçersiz kod ise ana sayfaya yönlendir
        router.push('/')
      }
    } catch (error) {
      console.error('Beta code validation error:', error)
      toast({
        title: 'Hata',
        description: 'Beta kodu doğrulanırken bir hata oluştu',
        variant: 'error'
      })
      router.push('/')
    }
  }

  const handleEventAccess = async (eventCode: string) => {
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
        setEventCode(eventCode)
        
        // Kullanım istatistiği kaydet
        await trackEventUsage(
          eventCode,
          'anonymous',
          navigator.userAgent,
          'unknown',
          'event_access',
          0
        )
        
        // URL'yi güncelle
        router.push(`/b/${betaCode}/${eventCode}`)
        
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
      console.error('Event code validation error:', error)
      toast({
        title: 'Hata',
        description: 'Etkinlik kodu doğrulanırken bir hata oluştu',
        variant: 'error'
      })
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!isBetaAccessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Beta kodu doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  if (!isEventAccessGranted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-full mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Momento</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Etkinlik kodunu girin ve fotoğraflarınızı paylaşmaya başlayın
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              <Camera className="w-4 h-4 mr-1" />
              Beta Kodu: {betaCode}
            </div>
          </header>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Etkinlik Kodunu Girin
                </h2>
                <p className="text-gray-600">
                  Etkinlik organizatöründen aldığınız kodu girin
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                    placeholder="Etkinlik kodunu girin"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-center text-lg font-mono"
                  />
                </div>

                <button
                  onClick={() => handleEventAccess(eventCode)}
                  disabled={!eventCode.trim()}
                  className="w-full bg-brand-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Etkinliğe Katıl
                </button>
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
          <div className="mt-4 flex justify-center space-x-4">
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              <Camera className="w-4 h-4 mr-1" />
              Beta: {betaCode}
            </div>
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              <Camera className="w-4 h-4 mr-1" />
              Etkinlik: {currentEvent?.code}
            </div>
          </div>
        </header>

        {!uploadedFile ? (
          /* Etkinlik Bilgileri ve Fotoğraf Yükleme */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentEvent?.name || 'Etkinlik'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {currentEvent?.description || 'Etkinlik fotoğraflarınızı paylaşın'}
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Camera className="w-4 h-4 mr-2" />
                  Etkinlik Kodu: {currentEvent?.code}
                </div>
              </div>

              {/* Etkinlik İstatistikleri */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentEvent?.currentFiles || 0}
                  </div>
                  <div className="text-sm text-gray-600">Yüklenen Fotoğraf</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentEvent?.maxFiles ? `${currentEvent.maxFiles}` : '∞'}
                  </div>
                  <div className="text-sm text-gray-600">Maksimum Limit</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentEvent?.isActive ? 'Aktif' : 'Pasif'}
                  </div>
                  <div className="text-sm text-gray-600">Durum</div>
                </div>
              </div>

              {/* Fotoğraf Yükleme Bölümü */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-primary transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary rounded-full mb-4">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Fotoğraflarınızı Paylaşın
                </h3>
                <p className="text-gray-600 mb-4">
                  Etkinlik fotoğraflarınızı buraya sürükleyip bırakın veya seçmek için tıklayın
                </p>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*,video/*,audio/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files)
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors cursor-pointer"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {isUploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}
                </label>
              </div>

              {/* QR Kod ve Paylaşım */}
              {currentEvent && (
                <div className="mt-8 grid md:grid-cols-2 gap-8">
                  {/* QR Kod */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Etkinlik QR Kodu</h3>
                    <div id="qr-code" className="inline-block p-4 bg-white rounded-xl shadow-lg border">
                      <QRCodeSVG
                        value={`${window.location.origin}/b/${betaCode}/${currentEvent.code}`}
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Etkinlik Kodu: <span className="font-mono font-semibold">{currentEvent.code}</span>
                    </p>
                    <button
                      onClick={downloadQR}
                      className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>QR Kod İndir</span>
                    </button>
                  </div>

                  {/* Paylaşım Bilgileri */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Paylaşım Bilgileri</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Etkinlik URL'si
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={`${window.location.origin}/b/${betaCode}/${currentEvent.code}`}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/b/${betaCode}/${currentEvent.code}`)
                            toast({
                              title: 'Kopyalandı!',
                              description: 'URL panoya kopyalandı',
                              variant: 'success'
                            })
                          }}
                          className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/b/${betaCode}/${currentEvent.code}`)
                          toast({
                            title: 'Kopyalandı!',
                            description: 'URL panoya kopyalandı',
                            variant: 'success'
                          })
                        }}
                        className="flex items-center justify-center space-x-2 py-2 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>URL Kopyala</span>
                      </button>

                      <button
                        onClick={() => window.open(`${window.location.origin}/b/${betaCode}/${currentEvent.code}`, '_blank')}
                        className="flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Etkinlik Sayfası</span>
                      </button>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Etkinlik Kuralları */}
              {currentEvent && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">Etkinlik Kuralları</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {currentEvent.maxFiles && (
                      <li>• Maksimum {currentEvent.maxFiles} fotoğraf yükleyebilirsiniz</li>
                    )}
                    {currentEvent.maxFileSize && (
                      <li>• Her fotoğraf maksimum {currentEvent.maxFileSize}MB olabilir</li>
                    )}
                    <li>• Tüm medya dosyaları kabul edilir (jpg, png, gif, mp4, vb.)</li>
                    {currentEvent.expiresAt && (
                      <li>• Etkinlik {formatDate(currentEvent.expiresAt)} tarihinde sona erer</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Fotoğraf Yükleme Başarılı */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Camera className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  Fotoğraf Yüklendi! 🎉
                </h2>
                <p className="text-gray-600">
                  Fotoğrafınız başarıyla yüklendi ve etkinlik albümüne eklendi
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Teşekkürler!</h3>
                  <p className="text-sm text-green-800">
                    Fotoğrafınız güvenle Google Drive'da saklandı.
                    Etkinlik organizatörü tüm fotoğrafları görebilir.
                  </p>
                </div>

                <button
                  onClick={() => {
                    // Sadece upload state'ini sıfırla, sayfayı yenileme
                    setUploadedFile(null)
                    setIsUploading(false)
                  }}
                  className="w-full bg-brand-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  Başka Fotoğraf Yükle
                </button>
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
