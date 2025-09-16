'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  LogIn
} from 'lucide-react'
import { FadeIn } from '@/components/Animations'
import { useToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()
  const { toast } = useToast()
  const { login, isLoading } = useAuth()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const success = await login(formData.email, formData.password)
      
      if (success) {
        toast({
          title: 'Hoş geldiniz!',
          description: 'Başarıyla giriş yaptınız.',
          variant: 'success'
        })
        
        // Dashboard'a yönlendir
        router.push('/dashboard')
      } else {
        toast({
          title: 'Hata!',
          description: 'E-posta veya şifre hatalı.',
          variant: 'error'
        })
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Giriş sırasında bir hata oluştu.',
        variant: 'error'
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
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
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <FadeIn>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Giriş Yapın
              </h2>
              <p className="text-gray-600">
                Hesabınıza giriş yapın
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* E-posta */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Şifre */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Şifrenizi girin"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Şifremi Unuttum */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="text-sm text-pink-600 hover:text-pink-500 transition-colors"
                  >
                    Şifremi unuttum
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Giriş yapılıyor...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="w-4 h-4 mr-2" />
                      Giriş Yap
                    </div>
                  )}
                </button>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Hesabınız yok mu?{' '}
                  <button
                    onClick={() => router.push('/register')}
                    className="font-medium text-pink-600 hover:text-pink-500 transition-colors"
                  >
                    Hesap oluşturun
                  </button>
                </p>
              </div>
            </form>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
