import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Tüm kullanıcıları getir
    const users = await kvDb.user.findMany()
    
    // İstatistikleri hesapla
    const totalUsers = users.length
    const adminUsers = users.filter(user => user.isAdmin).length
    const regularUsers = totalUsers - adminUsers
    
    // Bugün kayıt olan kullanıcılar
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newUsersToday = users.filter(user => 
      new Date(user.createdAt) >= today
    ).length
    
    // Bugün aktif olan kullanıcılar (son giriş bugün)
    const activeUsersToday = users.filter(user => {
      if (!user.lastLoginAt) return false
      const lastLogin = new Date(user.lastLoginAt)
      return lastLogin >= today
    }).length

    const stats = {
      totalUsers,
      adminUsers,
      regularUsers,
      newUsersToday,
      activeUsersToday
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          users,
          stats
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_USERS] Error:', error)
    return createErrorResponse(error)
  }
}
