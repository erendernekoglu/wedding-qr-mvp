import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    // Tüm verileri topla
    const users = await kvDb.user.findMany()
    const events = await kvDb.event.findMany()
    const activities = await kvDb.activity.findMany()
    const settings = await kvDb.redis.get('admin:settings')
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        users,
        events,
        activities,
        settings
      }
    }
    
    // Backup'ı Redis'e kaydet
    const backupId = `backup_${Date.now()}`
    await kvDb.redis.set(`backup:${backupId}`, backupData)
    
    // Backup listesini güncelle
    const existingBackups = await kvDb.redis.get('admin:backups') || []
    const backups = Array.isArray(existingBackups) ? existingBackups : []
    backups.push({
      id: backupId,
      timestamp: backupData.timestamp,
      userCount: users.length,
      eventCount: events.length,
      fileCount: events.reduce((sum, event) => sum + (event.currentFiles || 0), 0)
    })
    
    // Son 10 backup'ı sakla
    const recentBackups = backups.slice(-10)
    await kvDb.redis.set('admin:backups', recentBackups)
    
    // Aktivite kaydı oluştur
    await kvDb.activity.create({
      userId: 'admin',
      action: 'backup_created',
      userAgent: 'admin-panel',
      ipAddress: 'admin-panel'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Yedekleme başarıyla oluşturuldu',
        data: {
          backupId,
          timestamp: backupData.timestamp,
          userCount: users.length,
          eventCount: events.length,
          fileCount: events.reduce((sum, event) => sum + (event.currentFiles || 0), 0)
        }
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_BACKUP] Error:', error)
    return createErrorResponse(error)
  }
}
