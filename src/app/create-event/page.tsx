'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Calendar, 
  Users, 
  Camera, 
  QrCode, 
  ArrowLeft,
  CheckCircle,
  Upload,
  Settings,
  Eye
} from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/Animations'
import { useToast } from '@/components/ui/Toast'

const eventTemplates = [
  {
    id: 'wedding',
    name: 'Düğün',
    description: 'Düğün etkinliği için özel tasarım',
    icon: '💒',
    color: 'pink',
    features: ['Romantik tema', 'Özel QR kodlar', 'Düğün mesajları']
  },
  {
    id: 'birthday',
    name: 'Doğum Günü',
    description: 'Doğum günü partisi için eğlenceli tasarım',
    icon: '🎂',
    color: 'yellow',
    features: ['Eğlenceli tema', 'Renkli QR kodlar', 'Parti mesajları']
  },
  {
    id: 'corporate',
    name: 'Kurumsal',
    description: 'Şirket etkinlikleri için profesyonel tasarım',
    icon: '🏢',
    color: 'blue',
    features: ['Profesyonel tema', 'Kurumsal QR kodlar', 'Resmi mesajlar']
  },
  {
    id: 'graduation',
    name: 'Mezuniyet',
    description: 'Mezuniyet töreni için özel tasarım',
    icon: '🎓',
    color: 'purple',
    features: ['Akademik tema', 'Özel QR kodlar', 'Mezuniyet mesajları']
  }
]

function CreateEventContent() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    tableCount: 5,
    maxFiles: 100,
    template: 'wedding',
    customMessage: '',
    isActive: true
  })
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const selectedPackage = searchParams.get('package') || 'professional'

  useEffect(() => {
    // Paket bilgisine göre varsayılan değerleri ayarla
    if (selectedPackage === 'basic') {
      setFormData(prev => ({ ...prev, tableCount: 5, maxFiles: 100 }))
    } else if (selectedPackage === 'professional') {
      setFormData(prev => ({ ...prev, tableCount: 10, maxFiles: -1 }))
    } else if (selectedPackage === 'premium') {
      setFormData(prev => ({ ...prev, tableCount: 20, maxFiles: -1 }))
    }
  }, [selectedPackage])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleCreateEvent = async () => {
    if (!user) {
      toast({
        title: 'Hata!',
        description: 'Giriş yapmanız gerekiyor.',
        variant: 'error'
      })
      return
    }

    setIsCreating(true)
    
    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          packageType: selectedPackage
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Etkinlik Oluşturuldu!',
          description: 'Etkinliğiniz admin onayına gönderildi. Onaylandıktan sonra aktif olacak.',
          variant: 'success'
        })
        
        // Dashboard'a yönlendir
        router.push('/dashboard')
      } else {
        throw new Error(result.error || 'Etkinlik oluşturulamadı')
      }
      
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Etkinlik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'error'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getPackageInfo = () => {
    switch (selectedPackage) {
      case 'basic':
        return { name: 'Temel Paket', tables: 5, files: 100 }
      case 'professional':
        return { name: 'Profesyonel Paket', tables: 10, files: 'Sınırsız' }
      case 'premium':
        return { name: 'Premium Paket', tables: 20, files: 'Sınırsız' }
      default:
        return { name: 'Profesyonel Paket', tables: 10, files: 'Sınırsız' }
    }
  }

  const packageInfo = getPackageInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/purchase-event')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paket Seçimine Dön</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/logos/logo.png" 
                alt="Momento Logo" 
                className="w-8 h-8"
              />
              <img 
                src="/logos/yazı.png" 
                alt="Momento" 
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Etkinlik Oluştur</h1>
            <span className="text-sm text-gray-600">Adım {step}/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Package Info */}
        <FadeIn>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{packageInfo.name}</h3>
                <p className="text-sm text-gray-600">
                  {packageInfo.tables} masa • {packageInfo.files} fotoğraf
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Paket Detayları</p>
                <p className="font-semibold text-gray-900">
                  {selectedPackage === 'basic' ? '99 TL' : 
                   selectedPackage === 'professional' ? '199 TL' : '399 TL'}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <FadeIn>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etkinlik Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Örn: Ahmet & Ayşe Düğünü"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Etkinlik hakkında kısa bir açıklama..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarih *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saat
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasyon
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Örn: Hilton Otel, İstanbul"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleNext}
                  disabled={!formData.name || !formData.date}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İleri
                </button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Step 2: Template Selection */}
        {step === 2 && (
          <FadeIn>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tema Seçimi</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventTemplates.map((template, index) => (
                  <SlideIn key={template.id} delay={index * 100}>
                    <div
                      onClick={() => handleInputChange('template', template.id)}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.template === template.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">{template.icon}</div>
                        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                        <div className="space-y-2">
                          {template.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SlideIn>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Geri
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  İleri
                </button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && (
          <FadeIn>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Yapılandırma</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Masa Sayısı: {formData.tableCount}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={packageInfo.tables}
                    value={formData.tableCount}
                    onChange={(e) => handleInputChange('tableCount', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paket limiti: {packageInfo.tables} masa
                  </p>
                </div>

                {packageInfo.files !== 'Sınırsız' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimum Fotoğraf Sayısı: {formData.maxFiles}
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      value={formData.maxFiles}
                      onChange={(e) => handleInputChange('maxFiles', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Paket limiti: {packageInfo.files} fotoğraf
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özel Mesaj
                  </label>
                  <textarea
                    value={formData.customMessage}
                    onChange={(e) => handleInputChange('customMessage', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Misafirlerin göreceği özel mesaj..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Etkinliği hemen aktif et
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Geri
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={isCreating}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Etkinliği Oluştur
                    </>
                  )}
                </button>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Yükleniyor...</p>
        </div>
      </div>
    }>
      <CreateEventContent />
    </Suspense>
  )
}
