import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'E-posta ve şifre gerekli'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Kullanıcıyı bul
    const user = await kvDb.user.findByEmail(email)

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Admin hesabı bulunamadı'
        }),
        {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Admin kontrolü
    if (!user.isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bu hesap admin yetkisine sahip değil'
        }),
        {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Şifre kontrolü (gerçek uygulamada hash karşılaştırması yapılmalı)
    if (user.passwordHash !== password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'E-posta veya şifre hatalı'
        }),
        {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Son giriş zamanını güncelle
    await kvDb.user.updateLastLogin(user.id)

    // Admin aktivite kaydı oluştur
    await kvDb.activity.create({
      userId: user.id,
      action: 'admin_logged_in',
      userAgent: req.headers.get('user-agent') || 'unknown',
      ipAddress: req.ip || 'unknown',
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          lastLoginAt: user.lastLoginAt,
        },
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_LOGIN_API_ERROR]', error)
    return createErrorResponse(error.message || 'Admin girişi sırasında bir hata oluştu.')
  }
}
