'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Share2, Camera, Users, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { validateBetaCode, trackBetaUsage } from '@/lib/beta-users'
import { validateEventCode, trackEventUsage } from '@/lib/event-validation'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import DragDropUpload from '@/components/DragDropUpload'
import ProgressBar from '@/components/ProgressBar'
import { UploadSkeleton } from '@/components/LoadingSkeleton'
import ResponsiveContainer, { ResponsiveGrid, ResponsiveText, ResponsiveButton } from '@/components/ResponsiveContainer'
import { FadeIn, SlideIn, Stagger, HoverScale, PageTransition } from '@/components/Animations'

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)
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
    setBetaAccessCode('')
    setUploadedFile(null)
  }, [])

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
    setUploadProgress(0)
    
    try {
      const totalFiles = files.length
      let completedFiles = 0
      
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
        
        // Progress güncelle
        completedFiles++
        const progress = Math.round((completedFiles / totalFiles) * 100)
        setUploadProgress(progress)
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
      setUploadProgress(0)
    }
  }

  const handleLogout = () => {
    // State'leri sıfırla
    setIsBetaAccessGranted(false)
    setIsEventAccessGranted(false)
    setCurrentEvent(null)
    setEventCode('')
    setBetaAccessCode('')
    setUploadedFile(null)
    
    toast({
      title: 'Çıkış Yapıldı',
      description: 'Oturum sonlandırıldı',
      variant: 'info'
    })
  }

  const downloadQR = () => {
    if (!currentEvent) return
    
    try {
      const svg = document.querySelector('#qr-code svg')
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
        downloadLink.download = `etkinlik-${currentEvent.code}-qr.png`
        downloadLink.href = pngFile
        downloadLink.click()
        
        toast({
          title: 'QR Kod İndirildi!',
          description: 'QR kod başarıyla indirildi',
          variant: 'success'
        })
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    } catch (error) {
      console.error('QR download error:', error)
      toast({
        title: 'Hata',
        description: 'QR kod indirilemedi',
        variant: 'error'
      })
    }
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
        
        // Kullanım istatistiği kaydet
        await trackBetaUsage(
          betaAccessCode,
          'anonymous',
          navigator.userAgent,
          'unknown', // IP adresi server-side'da alınabilir
          'beta_access'
        )
        
        // Beta kodu doğrulandıktan sonra URL'yi güncelle
        router.push(`/b/${betaAccessCode}`)
        
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
    <PageTransition>
      <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <ResponsiveContainer maxWidth="2xl" padding="lg">
          {/* Header */}
          <FadeIn delay={200}>
            <header className="text-center mb-12">
              <HoverScale>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-full mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </HoverScale>
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
          </FadeIn>

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
              <DragDropUpload
                onFilesSelected={handleFileUpload}
                isUploading={isUploading}
                maxFiles={currentEvent?.maxFiles || 10}
                maxFileSize={currentEvent?.maxFileSize || 50}
                acceptedTypes={['image/*', 'video/*', 'audio/*']}
                className="mb-6"
              />

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-6">
                  <ProgressBar
                    progress={uploadProgress}
                    showPercentage={true}
                    size="lg"
                    color="primary"
                    animated={true}
                  />
                </div>
              )}

              {/* QR Kod ve Paylaşım */}
              {currentEvent && (
                <div className="mt-8 grid md:grid-cols-2 gap-8">
                  {/* QR Kod */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Etkinlik QR Kodu</h3>
                    <div id="qr-code" className="inline-block p-4 bg-white rounded-xl shadow-lg border">
                      <QRCodeSVG
                        value={`${window.location.origin}/u/${currentEvent.code}`}
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
                          value={`${window.location.origin}/u/${currentEvent.code}`}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/u/${currentEvent.code}`)
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
                          navigator.clipboard.writeText(`${window.location.origin}/u/${currentEvent.code}`)
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
                        onClick={() => window.open(`${window.location.origin}/u/${currentEvent.code}`, '_blank')}
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
      </ResponsiveContainer>
      
      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </main>
    </PageTransition>
  )
}
