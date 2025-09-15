import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    // Admin kullanıcısı oluştur
    const adminUser = await kvDb.user.create({
      email: 'admin@momento.com',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      passwordHash: 'admin123' // Geçici şifre (gerçek uygulamada hash'lenmeli)
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin kullanıcısı oluşturuldu',
        data: {
          email: adminUser.email,
          password: 'admin123' // Geçici şifre
        }
      }),
      {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[CREATE_ADMIN] Error:', error)
    return createErrorResponse(error)
  }
}
