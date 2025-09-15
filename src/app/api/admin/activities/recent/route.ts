import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Son 20 aktiviteyi getir
    const activities = await kvDb.activity.getRecent(20)
    
    // Aktivite tiplerini daha okunabilir hale getir
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.action,
      description: getActivityDescription(activity),
      timestamp: activity.timestamp,
      user: activity.userId,
      eventCode: activity.eventCode
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: formattedActivities
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_ACTIVITIES_RECENT] Error:', error)
    return createErrorResponse(error)
  }
}

function getActivityDescription(activity: any) {
  switch (activity.action) {
    case 'user_registered':
      return 'Yeni kullanıcı kaydoldu'
    case 'event_created':
      return 'Yeni etkinlik oluşturuldu'
    case 'event_approved':
      return 'Etkinlik onaylandı'
    case 'file_uploaded':
      return 'Dosya yüklendi'
    case 'beta_code_used':
      return 'Beta kodu kullanıldı'
    case 'user_promoted_to_admin':
      return 'Kullanıcıya admin yetkisi verildi'
    case 'user_demoted_from_admin':
      return 'Kullanıcının admin yetkisi kaldırıldı'
    case 'user_deleted':
      return 'Kullanıcı silindi'
    default:
      return activity.action
  }
}
