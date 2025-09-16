'use client'
import { useState } from 'react'
import { 
  QrCode, 
  Camera, 
  Users, 
  Download, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Play,
  Menu,
  X
} from 'lucide-react'
import { FadeIn, SlideIn, Stagger, HoverScale } from '@/components/Animations'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPricingOpen, setIsPricingOpen] = useState(false)

  const features = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "Masa Bazlı QR Kodlar",
      description: "Her masa için ayrı QR kod oluşturun. Misafirler hangi masadan fotoğraf yüklediğini kolayca takip edin.",
      color: "bg-blue-500"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Anında Fotoğraf Yükleme",
      description: "QR kod okutun, kamera açılsın, fotoğraf çekin ve yükleyin. Hiç uygulama indirmeye gerek yok.",
      color: "bg-green-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Canlı Fotoğraf Galerisi",
      description: "Etkinlik sırasında tüm fotoğrafları canlı olarak görün. Masa bazlı filtreleme ile organize edin.",
      color: "bg-purple-500"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Otomatik Drive Saklama",
      description: "Tüm fotoğraflar Google Drive'da otomatik olarak organize edilir. Etkinlik sonrası kolayca erişin.",
      color: "bg-orange-500"
    }
  ]

  const eventTypes = [
    { name: "Düğün", icon: "💒", color: "bg-pink-100 text-pink-800" },
    { name: "Doğum Günü", icon: "🎂", color: "bg-yellow-100 text-yellow-800" },
    { name: "Mezuniyet", icon: "🎓", color: "bg-blue-100 text-blue-800" },
    { name: "İş Etkinliği", icon: "💼", color: "bg-gray-100 text-gray-800" },
    { name: "Parti", icon: "🎉", color: "bg-purple-100 text-purple-800" },
    { name: "Toplantı", icon: "🤝", color: "bg-green-100 text-green-800" }
  ]

  const pricingPlans = [
    {
      name: "Temel",
      price: "100",
      photos: "100",
      features: ["1 Etkinlik", "5 Masa", "100 Fotoğraf", "Temel Tema", "Email Destek"],
      popular: false
    },
    {
      name: "Profesyonel",
      price: "200",
      photos: "200",
      features: ["1 Etkinlik", "10 Masa", "200 Fotoğraf", "Premium Tema", "Öncelikli Destek", "Canlı Galeri"],
      popular: true
    },
    {
      name: "Kurumsal",
      price: "500",
      photos: "500",
      features: ["1 Etkinlik", "20 Masa", "500 Fotoğraf", "Özel Tema", "7/24 Destek", "Gelişmiş Analitik"],
      popular: false
    }
  ]

  const testimonials = [
    {
      name: "Ahmet & Ayşe",
      event: "Düğün",
      message: "Misafirlerimiz çok kolay fotoğraf yükledi. Her masadan gelen fotoğrafları ayrı ayrı görebilmek harika oldu!",
      rating: 5
    },
    {
      name: "Mehmet Kaya",
      event: "İş Etkinliği",
      message: "Şirket etkinliğimizde kullandık. Çok profesyonel görünüyor ve misafirlerimiz çok beğendi.",
      rating: 5
    },
    {
      name: "Elif Demir",
      event: "Doğum Günü",
      message: "Kızımın doğum gününde kullandık. Herkes fotoğraflarını kolayca paylaştı, çok eğlenceli oldu!",
      rating: 5
    }
  ]

  const faqs = [
    {
      question: "Nasıl çalışıyor?",
      answer: "Etkinlik oluşturun, masa sayısını belirleyin, QR kodları indirin ve masalara yerleştirin. Misafirler QR kodu okutup fotoğraf yükleyebilir."
    },
    {
      question: "Uygulama indirmek gerekli mi?",
      answer: "Hayır! Misafirler sadece QR kodu okutup tarayıcıdan fotoğraf yükleyebilir. Hiç uygulama indirmeye gerek yok."
    },
    {
      question: "Fotoğraflar nerede saklanıyor?",
      answer: "Tüm fotoğraflar Google Drive'da güvenli şekilde saklanıyor. Etkinlik sonrası kolayca erişebilirsiniz."
    },
    {
      question: "Kaç masa kullanabilirim?",
      answer: "Paketinize göre değişir. Temel pakette 5 masa, Profesyonel'de 10 masa, Kurumsal'da 20 masa kullanabilirsiniz."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/logos/logo.png" 
                alt="Momento Logo" 
                className="w-24 h-24"
              />
              <img 
                src="/logos/yazı.png" 
                alt="Momento" 
                className="h-20"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Özellikler</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors" onClick={(e) => { e.preventDefault(); setIsPricingOpen(true); }}>Fiyatlar</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">SSS</a>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Giriş Yap
                </button>
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Hemen Başla
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            <a href="#features" className="block text-gray-600 hover:text-gray-900 transition-colors py-2">Özellikler</a>
            <a href="#pricing" className="block text-gray-600 hover:text-gray-900 transition-colors py-2" onClick={(e) => { e.preventDefault(); setIsPricingOpen(true); setIsMenuOpen(false); }}>Fiyatlar</a>
            <a href="#faq" className="block text-gray-600 hover:text-gray-900 transition-colors py-2">SSS</a>
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button 
                onClick={() => { window.location.href = '/login'; setIsMenuOpen(false); }}
                className="w-full text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 text-left"
              >
                Giriş Yap
              </button>
              <button 
                onClick={() => { window.location.href = '/register'; setIsMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Hemen Başla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Etkinliklerinizi
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"> Unutulmaz</span>
                <br />Kılın
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Masa bazlı QR kod sistemi ile misafirleriniz kolayca fotoğraf yüklesin. 
                Canlı galeri ile tüm anları anında görün.
              </p>
            </FadeIn>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Stagger>
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Hemen Başla
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-all">
                  <Play className="w-5 h-5 mr-2 inline" />
                  Demo İzle
                </button>
              </Stagger>
            </div>

            {/* Hero Image */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">QR Kod Okutun</h3>
                    <p className="text-gray-600 mb-6">Misafirler masadaki QR kodu okutup anında fotoğraf yükleyebilir</p>
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">Masa 5 - QR Kod</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Fotoğrafları Görün</h3>
                    <p className="text-gray-600 mb-6">Tüm fotoğrafları canlı olarak görün ve organize edin</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg aspect-square relative overflow-hidden bg-gradient-to-br from-pink-100 to-rose-200">
                        <div className="absolute inset-0 bg-cover bg-center" style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&crop=center')`
                        }}></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-1 left-1 text-xs text-white font-semibold bg-black/50 px-2 py-1 rounded">Düğün</div>
                      </div>
                      <div className="rounded-lg aspect-square relative overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-200">
                        <div className="absolute inset-0 bg-cover bg-center" style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop&crop=center')`
                        }}></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-1 left-1 text-xs text-white font-semibold bg-black/50 px-2 py-1 rounded">Doğum Günü</div>
                      </div>
                      <div className="rounded-lg aspect-square relative overflow-hidden bg-gradient-to-br from-green-100 to-emerald-200">
                        <div className="absolute inset-0 bg-cover bg-center" style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop&crop=center')`
                        }}></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-1 left-1 text-xs text-white font-semibold bg-black/50 px-2 py-1 rounded">Mezuniyet</div>
                      </div>
                      <div className="rounded-lg aspect-square relative overflow-hidden bg-gradient-to-br from-purple-100 to-pink-200">
                        <div className="absolute inset-0 bg-cover bg-center" style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop&crop=center')`
                        }}></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-1 left-1 text-xs text-white font-semibold bg-black/50 px-2 py-1 rounded">Parti</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Her Etkinlik İçin Mükemmel</h2>
            <p className="text-xl text-gray-600">Düğünden iş toplantısına kadar her türlü etkinlikte kullanın</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {eventTypes.map((event, index) => (
              <HoverScale key={index}>
                <div className={`p-4 rounded-lg text-center ${event.color} hover:shadow-lg transition-all`}>
                  <div className="text-3xl mb-2">{event.icon}</div>
                  <div className="font-semibold">{event.name}</div>
                </div>
              </HoverScale>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden Momento?</h2>
            <p className="text-xl text-gray-600">Etkinliklerinizi kolaylaştıran özellikler</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
            <p className="text-xl text-gray-600">Sadece 3 adımda etkinliğinizi hazırlayın</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Etkinlik Oluşturun",
                description: "Etkinlik bilgilerinizi girin ve masa sayısını belirleyin",
                icon: <Users className="w-8 h-8" />
              },
              {
                step: "2",
                title: "QR Kodları İndirin",
                description: "Her masa için ayrı QR kod oluşturulur ve indirilir",
                icon: <Download className="w-8 h-8" />
              },
              {
                step: "3",
                title: "Misafirler Yüklesin",
                description: "QR kod okutup fotoğraf yükleyin, canlı galeride görün",
                icon: <Camera className="w-8 h-8" />
              }
            ].map((step, index) => (
              <FadeIn key={index} delay={index * 200}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Müşterilerimiz Ne Diyor?</h2>
            <p className="text-xl text-gray-600">Binlerce mutlu müşteri</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.message}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.event}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h2>
            <p className="text-xl text-gray-600">Merak ettiğiniz her şey</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Hemen Başlayın</h2>
          <p className="text-xl text-pink-100 mb-8">Etkinliğinizi unutulmaz kılın</p>
          <button 
            onClick={() => window.location.href = '/register'}
            className="bg-white text-pink-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Hemen Başla
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/logos/logo.png" 
                  alt="Momento Logo" 
                  className="w-16 h-16"
                />
                <img 
                  src="/logos/yazı.png" 
                  alt="Momento" 
                  className="h-12"
                />
              </div>
              <p className="text-gray-400">Etkinliklerinizi unutulmaz kılın</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ürün</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); setIsPricingOpen(true); }}>Fiyatlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">SSS</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Yardım</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">İletişim</h3>
              <p className="text-gray-400">info@momento.com</p>
              <p className="text-gray-400">+90 555 123 45 67</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Momento. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {/* Pricing Modal */}
      {isPricingOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Fiyatlandırma</h2>
                <button 
                  onClick={() => setIsPricingOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricingPlans.map((plan, index) => (
                  <div key={index} className={`relative rounded-xl p-6 border-2 ${plan.popular ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          En Popüler
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        ₺{plan.price}
                        <span className="text-lg text-gray-500">/etkinlik</span>
                      </div>
                      <p className="text-gray-600">{plan.photos} fotoğraf hakkı</p>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}>
                      {plan.popular ? 'Hemen Başla' : 'Seç'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
