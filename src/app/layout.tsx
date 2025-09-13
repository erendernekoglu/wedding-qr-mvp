import './globals.css'
import type { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { Toaster } from '@/components/ui/Toast'

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
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  )
}
