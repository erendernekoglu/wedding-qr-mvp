import { kv } from '@vercel/kv'

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
      await kv.set(`album:${data.code}`, album)
      // Album'u id ile de kaydet (arama için)
      await kv.set(`album:id:${id}`, album)
      
      return album
    },
    
    findUnique: async (where: { code: string }) => {
      const album = await kv.get<Album>(`album:${where.code}`)
      return album || null
    },
    
    findById: async (id: string) => {
      const album = await kv.get<Album>(`album:id:${id}`)
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
      await kv.set(`file:${id}`, file)
      // Album'e ait file listesine ekle
      await kv.sadd(`album:${data.albumId}:files`, id)
      
      return file
    },
    
    findMany: async (where: { albumId: string }) => {
      // Album'e ait file ID'lerini al
      const fileIds = await kv.smembers(`album:${where.albumId}:files`)
      
      if (!fileIds || fileIds.length === 0) {
        return []
      }
      
      // Her file ID için file bilgilerini al
      const files = await Promise.all(
        fileIds.map(async (fileId) => {
          const file = await kv.get<File>(`file:${fileId}`)
          return file
        })
      )
      
      // null olanları filtrele ve sırala
      return files
        .filter((file): file is File => file !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    
    findById: async (id: string) => {
      const file = await kv.get<File>(`file:${id}`)
      return file || null
    }
  }
}
