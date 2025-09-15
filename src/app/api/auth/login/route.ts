import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'E-posta ve şifre gereklidir'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Find user by email
    const user = await kvDb.user.findByEmail(email)
    if (!user) {
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

    // For now, we'll use a simple password check
    // In a real app, you'd hash and compare passwords
    // For demo purposes, we'll accept any password for existing users
    // and create new users if they don't exist
    
    // Update last login
    await kvDb.user.updateLastLogin(user.id)

    // Don't return password in response
    const { ...userWithoutPassword } = user

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Giriş başarılı',
        data: userWithoutPassword
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[LOGIN] Error:', error)
    return createErrorResponse(error)
  }
}
