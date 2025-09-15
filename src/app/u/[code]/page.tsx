'use client'
import { useParams, useSearchParams } from 'next/navigation'
import UploadDropzone from '@/components/UploadDropzone'

export default function GuestUploadPage() {
  const { code } = useParams<{ code: string }>()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || '1'
  
  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Anı Yükle 📸</h1>
        <p className="text-sm text-slate-600">Uygulama yok, giriş yok. Sadece yükle.</p>
        <p className="text-xs text-blue-600">Masa: {tableNumber}</p>
      </header>
      <UploadDropzone albumCode={String(code)} tableNumber={tableNumber} />
    </main>
  )
}
