import { kvDb } from './kv-db'

// Beta kod doğrulama
export const validateBetaCode = async (code: string): Promise<{ valid: boolean; betaCode?: any }> => {
  try {
    const betaCode = await kvDb.betaCode.findUnique({ code: code.toUpperCase() })
    
    if (!betaCode) {
      return { valid: false }
    }
    
    // Kod aktif mi?
    if (!betaCode.isActive) {
      return { valid: false }
    }
    
    // Kod süresi dolmuş mu?
    if (betaCode.expiresAt && new Date(betaCode.expiresAt) < new Date()) {
      return { valid: false }
    }
    
    // Maksimum kullanım sayısına ulaşılmış mı?
    if (betaCode.maxUses && betaCode.currentUses >= betaCode.maxUses) {
      return { valid: false }
    }
    
    return { valid: true, betaCode }
  } catch (error) {
    console.error('Beta code validation error:', error)
    return { valid: false }
  }
}

// Kullanım istatistiği kaydet
export const trackBetaUsage = async (code: string, userId: string, userAgent: string, ipAddress: string, action: string) => {
  try {
    // Redis bağlantısını kontrol et
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('Redis credentials not found, skipping usage tracking')
      return
    }
    
    await kvDb.betaCode.incrementUsage(code, {
      userId,
      userAgent,
      ipAddress,
      action
    })
  } catch (error) {
    console.error('Beta usage tracking error:', error)
    // Hata durumunda uygulamanın çalışmasını engelleme
  }
}

// Eski sistem için backward compatibility
export const getBetaAccessCode = (): string => {
  return 'BETA2024'
}
