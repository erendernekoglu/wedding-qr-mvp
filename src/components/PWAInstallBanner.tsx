'use client'
import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, showInstallPrompt, installApp, dismissInstallPrompt } = usePWA()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show banner if app is installable and not already installed
    if (isInstallable && !isInstalled && showInstallPrompt) {
      setIsVisible(true)
    }
  }, [isInstallable, isInstalled, showInstallPrompt])

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    dismissInstallPrompt()
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Momento'yu Yükle
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Uygulamayı ana ekranınıza ekleyerek daha hızlı erişim sağlayın
            </p>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-brand-primary text-white text-xs font-medium py-2 px-3 rounded-md hover:bg-brand-primary/90 transition-colors"
              >
                <Download className="w-3 h-3 inline mr-1" />
                Yükle
              </button>
              
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Smartphone className="w-3 h-3" />
              <span>Mobil</span>
            </div>
            <div className="flex items-center space-x-1">
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
