import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, eventIds } = body

    if (!action || !eventIds || !Array.isArray(eventIds)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Geçersiz istek parametreleri'
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    const results = []

    for (const eventId of eventIds) {
      try {
        if (action === 'approve') {
          // Etkinliği onayla
          const event = await kvDb.event.findById(eventId)
          if (event) {
            await kvDb.event.update(eventId, { isActive: true })
            
            // Aktivite kaydı oluştur
            await kvDb.activity.create({
              userId: 'admin',
              action: 'event_approved',
              eventCode: event.code,
              userAgent: 'admin-panel',
              ipAddress: 'admin-panel'
            })
            
            results.push({ eventId, success: true })
          } else {
            results.push({ eventId, success: false, error: 'Etkinlik bulunamadı' })
          }
        } else if (action === 'reject') {
          // Etkinliği sil
          const event = await kvDb.event.findById(eventId)
          if (event) {
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
            
            results.push({ eventId, success: true })
          } else {
            results.push({ eventId, success: false, error: 'Etkinlik bulunamadı' })
          }
        } else {
          results.push({ eventId, success: false, error: 'Geçersiz işlem' })
        }
      } catch (error) {
        results.push({ eventId, success: false, error: 'İşlem hatası' })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        message: `${successCount} etkinlik işlendi, ${failCount} hata`,
        data: {
          results,
          successCount,
          failCount
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[BULK_EVENTS] Error:', error)
    return createErrorResponse(error)
  }
}