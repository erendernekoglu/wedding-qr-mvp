// Memory database - Vercel KV ile değiştirilecek
interface Album {
  id: string
  code: string
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface File {
  id: string
  fileId: string
  name: string
  size: number
  mimeType: string
  albumId: string
  createdAt: Date
}

// Memory storage
const albums: Map<string, Album> = new Map()
const files: Map<string, File> = new Map()

export const memoryDb = {
  // Album operations
  album: {
    create: async (data: Omit<Album, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const album: Album = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      albums.set(id, album)
      return album
    },
    
    findUnique: async (where: { code: string }) => {
      for (const album of albums.values()) {
        if (album.code === where.code) {
          return album
        }
      }
      return null
    }
  },
  
  // File operations
  file: {
    create: async (data: Omit<File, 'id' | 'createdAt'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const file: File = {
        ...data,
        id,
        createdAt: new Date()
      }
      files.set(id, file)
      return file
    },
    
    findMany: async (where: { albumId: string }) => {
      return Array.from(files.values()).filter(file => file.albumId === where.albumId)
    }
  }
}
