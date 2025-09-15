import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password, phone, company } = body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'E-posta, şifre, ad ve soyad gereklidir'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Geçerli bir e-posta adresi giriniz'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Password length validation
    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Şifre en az 6 karakter olmalıdır'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Check if user already exists
    const existingUser = await kvDb.user.findByEmail(email)
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bu e-posta adresi zaten kullanılıyor'
        }),
        {
          status: 409,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Create user
    const name = `${firstName} ${lastName}`.trim()
    const newUser = await kvDb.user.create({
      email,
      name,
      firstName,
      lastName,
      phone: phone || undefined,
      company: company || undefined,
      isAdmin: false
    })

    // Don't return password in response
    const { ...userWithoutPassword } = newUser

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Kullanıcı başarıyla oluşturuldu',
        data: userWithoutPassword
      }),
      {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[REGISTER] Error:', error)
    return createErrorResponse(error)
  }
}
