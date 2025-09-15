import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function PATCH(req: NextRequest) {
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

    // Etkinliği onayla
    const updatedEvent = await kvDb.event.update(eventId, { isActive: true })

    if (!updatedEvent) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Etkinlik güncellenemedi'
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
      action: 'event_approved',
      eventCode: event.code,
      userAgent: 'admin-panel',
      ipAddress: 'admin-panel'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Etkinlik başarıyla onaylandı',
        data: updatedEvent
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[APPROVE_EVENT] Error:', error)
    return createErrorResponse(error)
  }
}
