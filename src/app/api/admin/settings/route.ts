import { NextRequest } from 'next/server'
import { kvDb } from '@/lib/kv-db'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    // Ayarları Redis'ten getir
    const settings = await kvDb.redis.get('admin:settings')
    
    if (!settings) {
      // Varsayılan ayarları döndür
      const defaultSettings = {
        siteName: 'Momento',
        siteDescription: 'Etkinlik fotoğraf paylaşım platformu',
        siteUrl: 'https://momentobeta.vercel.app',
        maintenanceMode: false,
        maxFileSize: 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFilesPerEvent: 1000,
        storageProvider: 'drive',
        defaultEventDuration: 24,
        autoApproveEvents: false,
        requireEventApproval: true,
        maxTablesPerEvent: 50,
        allowUserRegistration: true,
        requireEmailVerification: false,
        defaultUserRole: 'user',
        emailNotifications: true,
        adminEmailNotifications: true,
        notificationEmail: 'admin@momento.com',
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        enableTwoFactor: false,
        enableAnalytics: true,
        analyticsProvider: 'internal',
        trackingId: '',
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          data: defaultSettings
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: settings
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_SETTINGS_GET] Error:', error)
    return createErrorResponse(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Ayarları Redis'e kaydet
    await kvDb.redis.set('admin:settings', body)
    
    // Aktivite kaydı oluştur
    await kvDb.activity.create({
      userId: 'admin',
      action: 'settings_updated',
      userAgent: 'admin-panel',
      ipAddress: 'admin-panel'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ayarlar başarıyla kaydedildi'
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[ADMIN_SETTINGS_PUT] Error:', error)
    return createErrorResponse(error)
  }
}
