'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Share2, Camera, Users, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { validateBetaCode, trackBetaUsage } from '@/lib/beta-users'
import { validateEventCode, trackEventUsage } from '@/lib/event-validation'

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false)
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
    
    setIsUploading(true)
    try {
      // Burada gerçek dosya yükleme işlemi olacak
      // Şimdilik sadece simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setUploadedFile({
        name: files[0].name,
        url: 'https://example.com/uploaded-file'
      })
      
      toast({
        title: 'Başarılı!',
        description: 'Fotoğraf başarıyla yüklendi',
        variant: 'success'
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Hata',
        description: 'Fotoğraf yüklenirken bir hata oluştu',
        variant: 'error'
      })
    } finally {
      setIsUploading(false)
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
                  accept="image/*,video/*"
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
                    {currentEvent.allowedTypes && currentEvent.allowedTypes.length > 0 && (
                      <li>• Sadece {currentEvent.allowedTypes.join(', ')} formatları kabul edilir</li>
                    )}
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
                    // Yeni fotoğraf yükleme için sayfayı yenile
                    window.location.reload()
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
