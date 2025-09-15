import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

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

    // Kullanıcının etkinliklerini kontrol et
    const events = await kvDb.event.findMany()
    const userEvents = events.filter(event => event.createdBy === userId)
    
    if (userEvents.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bu kullanıcının etkinlikleri bulunuyor. Önce etkinlikleri silin veya başka bir kullanıcıya aktarın.'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Kullanıcıyı sil
    await kvDb.redis.del(`user:${userId}`)
    await kvDb.redis.del(`user:email:${user.email}`)

    // Aktivite kaydı oluştur
    await kvDb.activity.create({
      userId: 'admin',
      action: 'user_deleted',
      userAgent: 'admin-panel',
      ipAddress: 'admin-panel'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Kullanıcı başarıyla silindi'
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[DELETE_USER] Error:', error)
    return createErrorResponse(error)
  }
}
