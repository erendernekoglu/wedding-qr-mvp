import './globals.css'
import type { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { Toaster } from '@/components/ui/Toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'

export const metadata = {
  title: 'Momento - Anı Paylaşım Uygulaması',
  description: 'Etkinliklerinizin anılarını kolayca paylaşın. QR kod ile hızlı erişim, Google Drive ile güvenli saklama.',
  keywords: 'momento, anı paylaşım, etkinlik, fotoğraf, QR kod, Google Drive',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
            <head>
              <title>Momento - Anı Paylaşım Uygulaması</title>
              <meta name="description" content="Etkinliklerinizin anılarını kolayca paylaşın. QR kod ile hızlı erişim, Google Drive ile güvenli saklama." />
              <meta name="keywords" content="momento, anı paylaşım, etkinlik, fotoğraf, QR kod, Google Drive" />
              
              {/* PWA Meta Tags */}
              <meta name="application-name" content="Momento" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="default" />
              <meta name="apple-mobile-web-app-title" content="Momento" />
              <meta name="format-detection" content="telephone=no" />
              <meta name="mobile-web-app-capable" content="yes" />
              <meta name="msapplication-config" content="/browserconfig.xml" />
              <meta name="msapplication-TileColor" content="#C2185B" />
              <meta name="msapplication-tap-highlight" content="no" />
              <meta name="theme-color" content="#C2185B" />
              
              {/* Apple Touch Icons */}
              <link rel="apple-touch-icon" href="/icon-192x192.svg" />
              <link rel="apple-touch-icon" sizes="152x152" href="/icon-144x144.svg" />
              <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.svg" />
              <link rel="apple-touch-icon" sizes="167x167" href="/icon-144x144.svg" />
              
              {/* Standard Icons */}
              <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icon-72x72.svg" />
              <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icon-72x72.svg" />
              <link rel="shortcut icon" href="/icon-72x72.svg" />
              <link rel="manifest" href="/manifest.json" />
              
              {/* Splash Screens */}
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <AuthProvider>
          <AdminAuthProvider>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
