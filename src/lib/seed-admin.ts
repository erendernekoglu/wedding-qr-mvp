import { kvDb } from './kv-db'

export async function seedAdminUser() {
  try {
    // Admin kullanıcısının var olup olmadığını kontrol et
    const existingAdmin = await kvDb.user.findByEmail('admin@momento.com')
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut')
      return existingAdmin
    }

    // Admin kullanıcısı oluştur
    const adminUser = await kvDb.user.create({
      email: 'admin@momento.com',
      name: 'Admin User',
      passwordHash: 'admin123', // Gerçek uygulamada hash'lenmeli
      isAdmin: true,
      createdAt: new Date().toISOString()
    })

    console.log('Admin kullanıcısı oluşturuldu:', adminUser.email)
    return adminUser
  } catch (error) {
    console.error('Admin kullanıcısı oluşturulurken hata:', error)
    throw error
  }
}

// Eğer bu dosya doğrudan çalıştırılırsa admin kullanıcısını oluştur
if (require.main === module) {
  seedAdminUser()
    .then(() => {
      console.log('Admin kullanıcısı başarıyla oluşturuldu')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Hata:', error)
      process.exit(1)
    })
}
