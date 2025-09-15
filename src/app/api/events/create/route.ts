import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      description,
      date,
      time,
      location,
      tableCount,
      maxFiles,
      template,
      customMessage,
      isActive,
      userId,
      packageType
    } = body

    // Etkinlik kodu oluştur
    const eventCode = generateEventCode()
    
    // Etkinlik oluştur (başlangıçta pasif)
    const event = await kvDb.event.create({
      code: eventCode,
      name,
      description,
      isActive: false, // Admin onayı bekliyor
      maxFiles: maxFiles === -1 ? undefined : maxFiles,
      createdBy: userId
    })

    // Admin'e bildirim için activity oluştur
    await kvDb.activity.create({
      userId: 'admin',
      action: 'event_created',
      eventCode: eventCode,
      userAgent: 'system',
      ipAddress: 'system'
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventId: event.id,
          eventCode: event.code,
          status: 'pending_approval',
          message: 'Etkinlik oluşturuldu ve admin onayına gönderildi.'
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[CREATE_EVENT] Error:', error)
    return createErrorResponse(error)
  }
}

function generateEventCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
