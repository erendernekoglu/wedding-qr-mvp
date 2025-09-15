import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Tüm etkinlikleri getir
    const events = await kvDb.event.findMany()
    
    // Kullanıcı bilgilerini al
    const users = await kvDb.user.findMany()
    const userMap = new Map(users.map(user => [user.id, user]))
    
    // Etkinlikleri kullanıcı bilgileri ile zenginleştir
    const enrichedEvents = events.map(event => ({
      ...event,
      createdByUser: userMap.get(event.createdBy)?.name || 'Bilinmeyen Kullanıcı'
    }))
    
    // İstatistikleri hesapla
    const totalEvents = events.length
    const activeEvents = events.filter(event => event.isActive).length
    const pendingEvents = events.filter(event => !event.isActive).length
    const totalFiles = events.reduce((sum, event) => sum + (event.currentFiles || 0), 0)
    const totalUsers = users.length

    const stats = {
      totalEvents,
      activeEvents,
      pendingEvents,
      totalFiles,
      totalUsers
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events: enrichedEvents,
          stats
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_EVENTS] Error:', error)
    return createErrorResponse(error)
  }
}