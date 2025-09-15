'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'

export default function AdminPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Ana admin sayfasını dashboard'a yönlendir
    router.push('/admin/dashboard')
  }, [router])

  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Yönlendiriliyor...</p>
        </div>
      </div>
    </AdminAuthProvider>
  )
}
