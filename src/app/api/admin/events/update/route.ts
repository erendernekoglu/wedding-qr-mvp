import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventCode,
      name,
      description,
      eventDate,
      eventTime,
      location,
      tableCount,
      maxFiles,
      customMessage,
      isActive
    } = body

    // Etkinliği bul
    const event = await kvDb.event.findUnique({ code: eventCode })
    
    if (!event) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Event not found'
        }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    // Etkinliği güncelle
    const updatedEvent = await kvDb.event.update(eventCode, {
      name,
      description,
      maxFiles,
      isActive,
      eventDate,
      eventTime,
      location,
      tableCount,
      customMessage
    })

    // Activity oluştur
    await kvDb.activity.create({
      userId: 'admin',
      action: 'event_updated',
      eventCode: eventCode,
      userAgent: 'admin',
      ipAddress: 'admin'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[EVENT_UPDATE] Error:', error)
    return createErrorResponse(error)
  }
}
