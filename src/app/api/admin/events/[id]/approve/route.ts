import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id
    const { action } = await req.json() // 'approve' or 'reject'

    // Etkinliği bul
    const event = await kvDb.event.findUnique({ code: eventId })
    
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

    if (action === 'approve') {
      // Etkinliği aktif et
      await kvDb.event.update(eventId, { isActive: true })
      
      // Activity oluştur
      await kvDb.activity.create({
        userId: 'admin',
        action: 'event_approved',
        eventCode: eventId,
        userAgent: 'admin',
        ipAddress: 'admin'
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Event approved successfully',
          data: {
            eventId: eventId,
            isActive: true
          }
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    } else if (action === 'reject') {
      // Etkinliği reddet (sil)
      await kvDb.event.delete(eventId)
      
      // Activity oluştur
      await kvDb.activity.create({
        userId: 'admin',
        action: 'event_rejected',
        eventCode: eventId,
        userAgent: 'admin',
        ipAddress: 'admin'
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Event rejected successfully'
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid action. Use "approve" or "reject"'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

  } catch (error: any) {
    console.error('[EVENT_APPROVAL] Error:', error)
    return createErrorResponse(error)
  }
}
