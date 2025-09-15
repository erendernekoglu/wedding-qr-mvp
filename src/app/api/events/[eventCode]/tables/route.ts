import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function PUT(req: NextRequest, { params }: { params: { eventCode: string } }) {
  try {
    const eventCode = params.eventCode
    const { tableNames, tableCount } = await req.json()

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
      tableNames,
      tableCount
    })

    // Activity oluştur
    await kvDb.activity.create({
      userId: 'user',
      action: 'tables_updated',
      eventCode: eventCode,
      userAgent: 'web',
      ipAddress: 'unknown'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Table names updated successfully',
        data: updatedEvent
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[TABLES_UPDATE] Error:', error)
    return createErrorResponse(error)
  }
}
