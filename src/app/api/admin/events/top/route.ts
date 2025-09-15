import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Tüm etkinlikleri getir
    const events = await kvDb.event.findMany()
    
    // Etkinlik kullanımlarını getir
    const eventUsages = await kvDb.event.getAllUsages()
    
    // Her etkinlik için yükleme sayısını hesapla
    const eventsWithUploads = events.map(event => {
      const uploads = eventUsages
        .filter(usage => usage.eventId === event.id)
        .reduce((sum, usage) => sum + (usage.fileCount || 0), 0)
      
      return {
        id: event.id,
        code: event.code,
        name: event.name,
        uploads: uploads,
        tables: 5, // Mock: her etkinlik için 5 masa varsayımı
        createdBy: event.createdBy,
        createdAt: event.createdAt
      }
    })
    
    // Yükleme sayısına göre sırala ve ilk 10'u al
    const topEvents = eventsWithUploads
      .sort((a, b) => b.uploads - a.uploads)
      .slice(0, 10)

    return new Response(
      JSON.stringify({
        success: true,
        data: topEvents
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_EVENTS_TOP] Error:', error)
    return createErrorResponse(error)
  }
}
