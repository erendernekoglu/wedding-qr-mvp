'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Sayfa yüklendiğinde kullanıcı bilgilerini kontrol et
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // localStorage'dan kullanıcı bilgilerini al
      const savedUser = localStorage.getItem('momento_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Simüle edilmiş giriş kontrolü
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock kullanıcı verileri
      const mockUsers = [
        { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', isAdmin: false },
        { id: '2', name: 'Admin User', email: 'admin@momento.com', isAdmin: true },
        { id: '3', name: 'Test User', email: 'test@example.com', isAdmin: false }
      ]
      
      const foundUser = mockUsers.find(u => u.email === email)
      
      if (foundUser && password === '123456') {
        setUser(foundUser)
        localStorage.setItem('momento_user', JSON.stringify(foundUser))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('momento_user')
    router.push('/login')
  }

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
