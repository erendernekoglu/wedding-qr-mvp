// Beta kullanıcı yönetimi
export const BETA_USERS = [
  'user1@example.com',
  'user2@example.com',
  'user3@example.com',
  // Arkadaşlarınızın email adreslerini buraya ekleyin
]

export const isBetaUser = (email: string): boolean => {
  return BETA_USERS.includes(email.toLowerCase())
}

export const getBetaAccessCode = (): string => {
  // Basit bir beta access code
  return 'BETA2024'
}
