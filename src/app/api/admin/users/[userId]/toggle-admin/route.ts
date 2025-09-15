import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const body = await req.json()
    const { isAdmin } = body

    // Kullanıcıyı bul
    const user = await kvDb.user.findById(userId)
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

    // Admin yetkisini güncelle
    const updatedUser = await kvDb.user.update(userId, { isAdmin })

    if (!updatedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Kullanıcı güncellenemedi'
        }),
        {
          status: 500,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Aktivite kaydı oluştur
    await kvDb.activity.create({
      userId: 'admin',
      action: isAdmin ? 'user_promoted_to_admin' : 'user_demoted_from_admin',
      userAgent: 'admin-panel',
      ipAddress: 'admin-panel'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: isAdmin ? 'Kullanıcıya admin yetkisi verildi' : 'Kullanıcının admin yetkisi kaldırıldı',
        data: updatedUser
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[TOGGLE_ADMIN] Error:', error)
    return createErrorResponse(error)
  }
}
