import './globals.css'
import type { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { Toaster } from '@/components/ui/Toast'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  )
}
