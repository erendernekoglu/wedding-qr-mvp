import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId } = body

    if (!eventId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Etkinlik ID gereklidir'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Etkinliği bul
    const event = await kvDb.event.findById(eventId)
    if (!event) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Etkinlik bulunamadı'
        }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Etkinliği sil
    await kvDb.redis.del(`event:${eventId}`)
    await kvDb.redis.del(`event:code:${event.code}`)

    // Aktivite kaydı oluştur
    await kvDb.activity.create({
      userId: 'admin',
      action: 'event_deleted',
      eventCode: event.code,
      userAgent: 'admin-panel',
      ipAddress: 'admin-panel'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Etkinlik başarıyla silindi'
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[DELETE_EVENT] Error:', error)
    return createErrorResponse(error)
  }
}
