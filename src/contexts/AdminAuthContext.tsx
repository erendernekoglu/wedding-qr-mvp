'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  lastLoginAt?: string
}

interface AdminAuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Admin bilgilerini localStorage'dan yükle
    const loadAdminData = () => {
      const adminData = localStorage.getItem('momento_admin')
      if (adminData) {
        try {
          const parsedAdmin = JSON.parse(adminData)
          setAdmin(parsedAdmin)
        } catch (error) {
          console.error('Admin data parse error:', error)
          localStorage.removeItem('momento_admin')
        }
      }
      setIsLoading(false)
    }

    loadAdminData()

    // localStorage değişikliklerini dinle
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'momento_admin') {
        loadAdminData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (result.success) {
        setAdmin(result.data)
        localStorage.setItem('momento_admin', JSON.stringify(result.data))
        return true
      }

      return false
    } catch (error) {
      console.error('Admin login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('momento_admin')
    router.push('/admin/login')
  }

  const isAdmin = admin?.isAdmin === true

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
