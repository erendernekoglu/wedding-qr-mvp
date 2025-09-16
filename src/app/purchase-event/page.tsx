'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  Camera, 
  QrCode, 
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Clock,
  Star,
  Shield
} from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/Animations'
import { useToast } from '@/components/ui/Toast'

const eventPackages = [
  {
    id: 'basic',
    name: 'Temel Paket',
    price: 99,
    currency: 'TL',
    duration: '1 etkinlik',
    description: 'Küçük etkinlikler için ideal',
    features: [
      '1 Etkinlik',
      '100 Fotoğraf Yükleme',
      '5 Masa QR Kodu',
      'Canlı Galeri Erişimi',
      'Google Drive Entegrasyonu',
      'Temel Destek'
    ],
    limitations: [
      'Maksimum 5 masa',
      '100 fotoğraf limiti',
      'Temel tema seçenekleri'
    ],
    isPopular: false,
    color: 'blue'
  },
  {
    id: 'professional',
    name: 'Profesyonel Paket',
    price: 199,
    currency: 'TL',
    duration: '1 etkinlik',
    description: 'Orta büyüklükteki etkinlikler için',
    features: [
      '1 Etkinlik',
      'Sınırsız Fotoğraf Yükleme',
      '10 Masa QR Kodu',
      'Canlı Galeri Erişimi',
      'Google Drive Entegrasyonu',
      'Öncelikli Destek',
      'Özelleştirilebilir QR Kodlar',
      'Gelişmiş Temalar'
    ],
    limitations: [
      'Maksimum 10 masa',
      'Sınırsız fotoğraf',
      'Gelişmiş özelleştirme'
    ],
    isPopular: true,
    color: 'purple'
  },
  {
    id: 'premium',
    name: 'Premium Paket',
    price: 399,
    currency: 'TL',
    duration: '1 etkinlik',
    description: 'Büyük etkinlikler için kapsamlı çözüm',
    features: [
      '1 Etkinlik',
      'Sınırsız Fotoğraf Yükleme',
      '20 Masa QR Kodu',
      'Canlı Galeri Erişimi',
      'Google Drive Entegrasyonu',
      '7/24 Destek',
      'Tam Özelleştirme',
      'Özel Tasarım Desteği',
      'Analytics Raporları',
      'Öncelikli İşlem'
    ],
    limitations: [
      'Maksimum 20 masa',
      'Sınırsız fotoğraf',
      'Tam özelleştirme'
    ],
    isPopular: false,
    color: 'gold'
  }
]

export default function PurchaseEventPage() {
  const [selectedPackage, setSelectedPackage] = useState('professional')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handlePurchase = async (packageId: string) => {
    setIsProcessing(true)
    
    try {
      // Simüle edilmiş ödeme işlemi
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Başarılı satın alma
      toast({
        title: 'Satın Alma Başarılı!',
        description: 'Etkinliğinizi oluşturmaya başlayabilirsiniz.',
        variant: 'success'
      })
      
      // Etkinlik oluşturma sayfasına yönlendir
      router.push(`/create-event?package=${packageId}`)
      
    } catch (error) {
      toast({
        title: 'Ödeme Hatası!',
        description: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          border: 'border-blue-200',
          light: 'bg-blue-50'
        }
      case 'purple':
        return {
          bg: 'bg-purple-500',
          text: 'text-purple-600',
          border: 'border-purple-200',
          light: 'bg-purple-50'
        }
      case 'gold':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-600',
          border: 'border-yellow-200',
          light: 'bg-yellow-50'
        }
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-600',
          border: 'border-gray-200',
          light: 'bg-gray-50'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard'a Dön</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/logos/logo.png" 
                alt="Momento Logo" 
                className="w-12 h-12"
              />
              <img 
                src="/logos/yazı.png" 
                alt="Momento" 
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Etkinlik Paketi Seçin
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Etkinliğinizin büyüklüğüne uygun paketi seçin ve anında başlayın
            </p>
          </div>
        </FadeIn>

        {/* Features Overview */}
        <FadeIn delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Masa Bazlı QR Kodlar</h3>
              <p className="text-sm text-gray-600">Her masa için ayrı QR kod</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Anında Fotoğraf Yükleme</h3>
              <p className="text-sm text-gray-600">Misafirler kolayca fotoğraf yükler</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Canlı Galeri</h3>
              <p className="text-sm text-gray-600">Tüm fotoğrafları anında görün</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Güvenli Saklama</h3>
              <p className="text-sm text-gray-600">Google Drive'da güvenli yedekleme</p>
            </div>
          </div>
        </FadeIn>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {eventPackages.map((pkg, index) => {
            const colors = getColorClasses(pkg.color)
            const isSelected = selectedPackage === pkg.id
            
            return (
              <SlideIn key={pkg.id} delay={index * 100}>
                <div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                  isSelected ? `${colors.border} ring-2 ring-opacity-50` : 'border-gray-200'
                } ${pkg.isPopular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}>
                  {pkg.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        En Popüler
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                      <p className="text-gray-600 mb-4">{pkg.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                        <span className="text-xl text-gray-600 ml-1">{pkg.currency}</span>
                        <span className="text-sm text-gray-500 ml-2">/ {pkg.duration}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="font-semibold text-gray-900">Paket Özellikleri:</h4>
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="font-semibold text-gray-900">Sınırlamalar:</h4>
                      {pkg.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-center">
                          <Clock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={isProcessing}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                        isSelected
                          ? `${colors.bg} text-white hover:opacity-90`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          İşleniyor...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Satın Al
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </SlideIn>
            )
          })}
        </div>

        {/* FAQ Section */}
        <FadeIn delay={400}>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sık Sorulan Sorular</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Etkinlik paketi ne kadar süre geçerli?</h3>
                <p className="text-gray-600 text-sm">Her paket 1 etkinlik için geçerlidir. Etkinlik tamamlandıktan sonra yeni bir paket satın almanız gerekir.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Fotoğraflar nerede saklanır?</h3>
                <p className="text-gray-600 text-sm">Tüm fotoğraflar sizin Google Drive hesabınızda güvenli bir şekilde saklanır ve istediğiniz zaman indirebilirsiniz.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Misafirlerin uygulama indirmesi gerekir mi?</h3>
                <p className="text-gray-600 text-sm">Hayır, misafirlerin sadece telefonlarının kamera uygulamasını kullanarak QR kodu okutmaları yeterlidir.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ödeme nasıl yapılır?</h3>
                <p className="text-gray-600 text-sm">Kredi kartı, banka kartı veya dijital cüzdan ile güvenli ödeme yapabilirsiniz.</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
