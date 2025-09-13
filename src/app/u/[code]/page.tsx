'use client'
import { useParams } from 'next/navigation'
import UploadDropzone from '@/components/UploadDropzone'

export default function GuestUploadPage() {
  const { code } = useParams<{ code: string }>()
  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Anı Yükle 📸</h1>
        <p className="text-sm text-slate-600">Uygulama yok, giriş yok. Sadece yükle.</p>
      </header>
      <UploadDropzone albumCode={String(code)} />
    </main>
  )
}
