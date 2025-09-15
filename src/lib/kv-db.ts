import { Redis } from '@upstash/redis'

// Redis client'ı basit konfigürasyonla oluştur
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface Album {
  id: string
  code: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface File {
  id: string
  fileId: string
  name: string
  size: number
  mimeType: string
  albumId: string
  createdAt: string
}

interface BetaCode {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  maxUses?: number
  currentUses: number
  createdBy: string
  createdAt: string
  expiresAt?: string
  lastUsedAt?: string
}

interface BetaUsage {
  id: string
  betaCodeId: string
  userId: string
  userAgent: string
  ipAddress: string
  usedAt: string
  action: string
}

interface Event {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  maxFiles?: number
  currentFiles: number
  maxFileSize?: number
  allowedTypes?: string[]
  createdBy: string
  createdAt: string
  expiresAt?: string
  lastUsedAt?: string
  eventDate?: string
  eventTime?: string
  location?: string
  tableCount?: number
  template?: string
  customMessage?: string
  tableNames?: string[]
  guestCount?: number
  totalUploads?: number
  lastUploadAt?: string
}

interface EventUsage {
  id: string
  eventId: string
  userId: string
  userAgent: string
  ipAddress: string
  usedAt: string
  action: string
  fileCount?: number
}

interface Activity {
  id: string
  userId: string
  action: string
  eventCode?: string
  betaCode?: string
  fileCount?: number
  timestamp: string
  userAgent: string
  ipAddress: string
}

export const kvDb = {
  // Album operations
  album: {
    create: async (data: Omit<Album, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const now = new Date().toISOString()
      const album: Album = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now
      }
      
      // Album'u code ile kaydet
      await redis.set(`album:${data.code}`, album)
      // Album'u id ile de kaydet (arama için)
      await redis.set(`album:id:${id}`, album)
      
      return album
    },
    
    findUnique: async (where: { code: string }) => {
      const album = await redis.get<Album>(`album:${where.code}`)
      return album || null
    },
    
    findById: async (id: string) => {
      const album = await redis.get<Album>(`album:id:${id}`)
      return album || null
    }
  },
  
  // File operations
  file: {
    create: async (data: Omit<File, 'id' | 'createdAt'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const now = new Date().toISOString()
      const file: File = {
        ...data,
        id,
        createdAt: now
      }
      
      // File'ı id ile kaydet
      await redis.set(`file:${id}`, file)
      // Album'e ait file listesine ekle
      await redis.sadd(`album:${data.albumId}:files`, id)
      
      return file
    },
    
    findMany: async (where: { albumId: string }) => {
      // Album'e ait file ID'lerini al
      const fileIds = await redis.smembers(`album:${where.albumId}:files`)
      
      if (!fileIds || fileIds.length === 0) {
        return []
      }
      
      // Her file ID için file bilgilerini al
      const files = await Promise.all(
        fileIds.map(async (fileId) => {
          const file = await redis.get<File>(`file:${fileId}`)
          return file
        })
      )
      
      // null olanları filtrele ve sırala
      return files
        .filter((file): file is File => file !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    
    findById: async (id: string) => {
      const file = await redis.get<File>(`file:${id}`)
      return file || null
    }
  },

  // Beta Code operations
  betaCode: {
    create: async (data: Omit<BetaCode, 'id' | 'createdAt' | 'currentUses'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const now = new Date().toISOString()
      const betaCode: BetaCode = {
        ...data,
        id,
        createdAt: now,
        currentUses: 0
      }
      
      // Beta code'u code ile kaydet
      await redis.set(`beta:${data.code}`, betaCode)
      // Beta code'u id ile de kaydet
      await redis.set(`beta:id:${id}`, betaCode)
      // Aktif beta kodları listesine ekle
      await redis.sadd('beta:codes:active', data.code)
      
      return betaCode
    },
    
    findUnique: async (where: { code: string }) => {
      const betaCode = await redis.get<BetaCode>(`beta:${where.code}`)
      return betaCode || null
    },
    
    findById: async (id: string) => {
      const betaCode = await redis.get<BetaCode>(`beta:id:${id}`)
      return betaCode || null
    },
    
    findMany: async () => {
      const codes = await redis.smembers('beta:codes:active')
      if (!codes || codes.length === 0) {
        return []
      }
      
      const betaCodes = await Promise.all(
        codes.map(async (code) => {
          const betaCode = await redis.get<BetaCode>(`beta:${code}`)
          return betaCode
        })
      )
      
      return betaCodes
        .filter((code): code is BetaCode => code !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    
    update: async (id: string, data: Partial<BetaCode>) => {
      const existing = await redis.get<BetaCode>(`beta:id:${id}`)
      if (!existing) return null
      
      const updated = { ...existing, ...data }
      await redis.set(`beta:${existing.code}`, updated)
      await redis.set(`beta:id:${id}`, updated)
      
      return updated
    },
    
    delete: async (id: string) => {
      const existing = await redis.get<BetaCode>(`beta:id:${id}`)
      if (!existing) return false
      
      await redis.del(`beta:${existing.code}`)
      await redis.del(`beta:id:${id}`)
      await redis.srem('beta:codes:active', existing.code)
      
      return true
    },
    
    incrementUsage: async (code: string, usageData: Omit<BetaUsage, 'id' | 'betaCodeId' | 'usedAt'>) => {
      const betaCode = await redis.get<BetaCode>(`beta:${code}`)
      if (!betaCode) return null
      
      // Usage kaydı oluştur
      const usageId = Math.random().toString(36).substr(2, 9)
      const usage: BetaUsage = {
        ...usageData,
        id: usageId,
        betaCodeId: betaCode.id,
        usedAt: new Date().toISOString()
      }
      
      await redis.set(`beta:usage:${usageId}`, usage)
      await redis.sadd(`beta:${betaCode.id}:usages`, usageId)
      
      // Beta code kullanım sayısını artır
      const updated = {
        ...betaCode,
        currentUses: betaCode.currentUses + 1,
        lastUsedAt: usage.usedAt
      }
      
      await redis.set(`beta:${code}`, updated)
      await redis.set(`beta:id:${betaCode.id}`, updated)
      
      return updated
    },
    
    getUsageStats: async (betaCodeId: string) => {
      const usageIds = await redis.smembers(`beta:${betaCodeId}:usages`)
      if (!usageIds || usageIds.length === 0) {
        return []
      }
      
      const usages = await Promise.all(
        usageIds.map(async (id) => {
          const usage = await redis.get<BetaUsage>(`beta:usage:${id}`)
          return usage
        })
      )
      
      return usages
        .filter((usage): usage is BetaUsage => usage !== null)
        .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())
    },
    
    getAll: async () => {
      const codes = await redis.smembers('beta:codes:active')
      if (!codes || codes.length === 0) {
        return []
      }
      
      const betaCodes = await Promise.all(
        codes.map(async (code) => {
          const betaCode = await redis.get<BetaCode>(`beta:${code}`)
          return betaCode
        })
      )
      
      return betaCodes
        .filter((code): code is BetaCode => code !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    
    getAllUsages: async () => {
      const betaCodes = await kvDb.betaCode.findMany()
      const allUsages: BetaUsage[] = []
      
      for (const betaCode of betaCodes) {
        const usages = await kvDb.betaCode.getUsageStats(betaCode.id)
        allUsages.push(...usages)
      }
      
      return allUsages
    }
  },

  // Event operations
  event: {
    create: async (data: Omit<Event, 'id' | 'createdAt' | 'currentFiles'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const now = new Date().toISOString()
      const event: Event = {
        ...data,
        id,
        createdAt: now,
        currentFiles: 0
      }
      
      // Event'i code ile kaydet
      await redis.set(`event:${data.code}`, event)
      // Event'i id ile de kaydet
      await redis.set(`event:id:${id}`, event)
      // Aktif eventleri listesine ekle
      await redis.sadd('events:active', data.code)
      
      return event
    },
    
    findUnique: async (where: { code: string }) => {
      const event = await redis.get<Event>(`event:${where.code}`)
      return event || null
    },
    
    findById: async (id: string) => {
      const event = await redis.get<Event>(`event:id:${id}`)
      return event || null
    },
    
    findMany: async () => {
      const codes = await redis.smembers('events:active')
      if (!codes || codes.length === 0) {
        return []
      }
      
      const events = await Promise.all(
        codes.map(async (code) => {
          const event = await redis.get<Event>(`event:${code}`)
          return event
        })
      )
      
      return events
        .filter((event): event is Event => event !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    
    update: async (id: string, data: Partial<Event>) => {
      const existing = await redis.get<Event>(`event:id:${id}`)
      if (!existing) return null
      
      const updated = { ...existing, ...data }
      await redis.set(`event:${existing.code}`, updated)
      await redis.set(`event:id:${id}`, updated)
      
      return updated
    },
    
    delete: async (id: string) => {
      const existing = await redis.get<Event>(`event:id:${id}`)
      if (!existing) return false
      
      await redis.del(`event:${existing.code}`)
      await redis.del(`event:id:${id}`)
      await redis.srem('events:active', existing.code)
      
      return true
    },
    
    incrementFileCount: async (code: string, usageData: Omit<EventUsage, 'id' | 'eventId' | 'usedAt'>) => {
      const event = await redis.get<Event>(`event:${code}`)
      if (!event) return null
      
      // Usage kaydı oluştur
      const usageId = Math.random().toString(36).substr(2, 9)
      const usage: EventUsage = {
        ...usageData,
        id: usageId,
        eventId: event.id,
        usedAt: new Date().toISOString()
      }
      
      await redis.set(`event:usage:${usageId}`, usage)
      await redis.sadd(`event:${event.id}:usages`, usageId)
      
      // Event dosya sayısını artır
      const updated = {
        ...event,
        currentFiles: event.currentFiles + (usageData.fileCount || 1),
        lastUsedAt: usage.usedAt
      }
      
      await redis.set(`event:${code}`, updated)
      await redis.set(`event:id:${event.id}`, updated)
      
      return updated
    },
    
    getUsageStats: async (eventId: string) => {
      const usageIds = await redis.smembers(`event:${eventId}:usages`)
      if (!usageIds || usageIds.length === 0) {
        return []
      }
      
      const usages = await Promise.all(
        usageIds.map(async (id) => {
          const usage = await redis.get<EventUsage>(`event:usage:${id}`)
          return usage
        })
      )
      
      return usages
        .filter((usage): usage is EventUsage => usage !== null)
        .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())
    },
    
    getAll: async () => {
      const codes = await redis.smembers('events:active')
      if (!codes || codes.length === 0) {
        return []
      }
      
      const events = await Promise.all(
        codes.map(async (code) => {
          const event = await redis.get<Event>(`event:${code}`)
          return event
        })
      )
      
      return events
        .filter((event): event is Event => event !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    
    getAllUsages: async () => {
      const events = await kvDb.event.getAll()
      const allUsages: EventUsage[] = []
      
      for (const event of events) {
        const usages = await kvDb.event.getUsageStats(event.id)
        allUsages.push(...usages)
      }
      
      return allUsages
    }
  },

  // Activity operations
  activity: {
    create: async (data: Omit<Activity, 'id' | 'timestamp'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const now = new Date().toISOString()
      const activity: Activity = {
        ...data,
        id,
        timestamp: now
      }
      
      // Activity'yi kaydet
      await redis.set(`activity:${id}`, activity)
      // Tarih bazlı indeksleme için
      const dateKey = now.split('T')[0] // YYYY-MM-DD
      await redis.sadd(`activity:date:${dateKey}`, id)
      // Genel aktivite listesine ekle
      await redis.lpush('activity:all', id)
      
      return activity
    },
    
    getRecent: async (limit: number = 10) => {
      const activityIds = await redis.lrange('activity:all', 0, limit - 1)
      if (!activityIds || activityIds.length === 0) {
        return []
      }
      
      const activities = await Promise.all(
        activityIds.map(async (id) => {
          const activity = await redis.get<Activity>(`activity:${id}`)
          return activity
        })
      )
      
      return activities
        .filter((activity): activity is Activity => activity !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    
    getByDateRange: async (startDate: Date, endDate: Date) => {
      const activities: Activity[] = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0]
        const activityIds = await redis.smembers(`activity:date:${dateKey}`)
        
        if (activityIds && activityIds.length > 0) {
          const dayActivities = await Promise.all(
            activityIds.map(async (id) => {
              const activity = await redis.get<Activity>(`activity:${id}`)
              return activity
            })
          )
          
          activities.push(...dayActivities.filter((activity): activity is Activity => activity !== null))
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    
    getByAction: async (action: string, limit: number = 50) => {
      // Bu basit bir implementasyon, gerçek uygulamada daha verimli olabilir
      const allActivityIds = await redis.lrange('activity:all', 0, limit * 2)
      if (!allActivityIds || allActivityIds.length === 0) {
        return []
      }
      
      const activities = await Promise.all(
        allActivityIds.map(async (id) => {
          const activity = await redis.get<Activity>(`activity:${id}`)
          return activity
        })
      )
      
      return activities
        .filter((activity): activity is Activity => activity !== null && activity.action === action)
        .slice(0, limit)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }
  },

  // Analytics helper functions
  analytics: {
    getAllUsages: async () => {
      const betaUsages = await kvDb.betaCode.getAllUsages()
      const eventUsages = await kvDb.event.getAllUsages()
      return [...betaUsages, ...eventUsages]
    },
    
    getAll: async () => {
      const betaCodes = await kvDb.betaCode.findMany()
      const events = await kvDb.event.findMany()
      return { betaCodes, events }
    }
  }
}
