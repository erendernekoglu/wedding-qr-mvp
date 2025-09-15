'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Admin giriş kontrolü
    const adminData = localStorage.getItem('momento_admin')
    if (!adminData) {
      router.push('/admin/login')
      return
    }

    try {
      const admin = JSON.parse(adminData)
      if (!admin.isAdmin) {
        router.push('/admin/login')
        return
      }
    } catch (error) {
      router.push('/admin/login')
      return
    }

    // Ana admin sayfasını dashboard'a yönlendir
    router.push('/admin/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Yönlendiriliyor...</p>
      </div>
    </div>
  )
}
