import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'E-posta adresi gereklidir'
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
          error: 'Kullanıcı bulunamadı'
        }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Admin yetkisi ver
    const updatedUser = await kvDb.user.update(user.id, { isAdmin: true })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Kullanıcıya admin yetkisi verildi',
        data: updatedUser
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[MAKE_ADMIN] Error:', error)
    return createErrorResponse(error)
  }
}
