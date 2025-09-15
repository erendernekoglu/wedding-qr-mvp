import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest, { params }: { params: { eventCode: string } }) {
  try {
    const eventCode = params.eventCode

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

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: event.id,
          code: event.code,
          name: event.name,
          description: event.description,
          isActive: event.isActive,
          createdAt: event.createdAt,
          createdBy: event.createdBy,
          maxFiles: event.maxFiles,
          currentFiles: event.currentFiles || 0,
          maxFileSize: event.maxFileSize,
          eventDate: undefined,
          eventTime: undefined,
          location: undefined,
          tableCount: undefined,
          template: undefined,
          customMessage: undefined
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[EVENT_GET] Error:', error)
    return createErrorResponse(error)
  }
}
