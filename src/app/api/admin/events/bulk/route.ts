import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

export async function POST(req: NextRequest) {
  try {
    const { action, eventIds } = await req.json()

    if (!action || !eventIds || !Array.isArray(eventIds)) {
      return NextResponse.json(
        { error: 'Geçersiz istek parametreleri' },
        { status: 400 }
      )
    }

    const results = []

    switch (action) {
      case 'delete':
        for (const eventId of eventIds) {
          try {
            await kvDb.event.delete(eventId)
            results.push({ id: eventId, success: true })
          } catch (error) {
            results.push({ id: eventId, success: false, error: 'Silme hatası' })
          }
        }
        break

      case 'archive':
        for (const eventId of eventIds) {
          try {
            await kvDb.event.update(eventId, { isActive: false })
            results.push({ id: eventId, success: true })
          } catch (error) {
            results.push({ id: eventId, success: false, error: 'Arşivleme hatası' })
          }
        }
        break

      case 'activate':
        for (const eventId of eventIds) {
          try {
            await kvDb.event.update(eventId, { isActive: true })
            results.push({ id: eventId, success: true })
          } catch (error) {
            results.push({ id: eventId, success: false, error: 'Aktivasyon hatası' })
          }
        }
        break

      case 'duplicate':
        for (const eventId of eventIds) {
          try {
            const originalEvent = await kvDb.event.findUnique({ code: eventId })
            if (originalEvent) {
              const duplicatedEvent = {
                ...originalEvent,
                code: `${originalEvent.code}_COPY_${Date.now()}`,
                name: `${originalEvent.name} (Kopya)`,
                createdAt: new Date().toISOString(),
                currentFiles: 0
              }
              await kvDb.event.create(duplicatedEvent)
              results.push({ id: eventId, success: true, newId: duplicatedEvent.code })
            } else {
              results.push({ id: eventId, success: false, error: 'Etkinlik bulunamadı' })
            }
          } catch (error) {
            results.push({ id: eventId, success: false, error: 'Kopyalama hatası' })
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Desteklenmeyen işlem' },
          { status: 400 }
        )
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `${successCount} etkinlik başarıyla işlendi${failureCount > 0 ? `, ${failureCount} etkinlik başarısız` : ''}`,
      results
    })

  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
