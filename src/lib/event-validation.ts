import { kvDb } from './kv-db'

// Etkinlik kod doğrulama
export const validateEventCode = async (code: string): Promise<{ valid: boolean; event?: any }> => {
  try {
    const event = await kvDb.event.findUnique({ code: code.toUpperCase() })
    
    if (!event) {
      return { valid: false }
    }
    
    // Etkinlik aktif mi?
    if (!event.isActive) {
      return { valid: false }
    }
    
    // Etkinlik süresi dolmuş mu?
    if (event.expiresAt && new Date(event.expiresAt) < new Date()) {
      return { valid: false }
    }
    
    // Maksimum dosya sayısına ulaşılmış mı?
    if (event.maxFiles && event.currentFiles >= event.maxFiles) {
      return { valid: false }
    }
    
    return { valid: true, event }
  } catch (error) {
    console.error('Event code validation error:', error)
    return { valid: false }
  }
}

// Kullanım istatistiği kaydet
export const trackEventUsage = async (code: string, userId: string, userAgent: string, ipAddress: string, action: string, fileCount: number = 1) => {
  try {
    await kvDb.event.incrementFileCount(code, {
      userId,
      userAgent,
      ipAddress,
      action,
      fileCount
    })
  } catch (error) {
    console.error('Event usage tracking error:', error)
  }
}
