// Security utilities and validation

import { NextRequest } from 'next/server'

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000) // Limit length
}

// File validation
export function validateFile(file: File, options: {
  maxSize?: number // in MB
  allowedTypes?: string[]
  allowedExtensions?: string[]
} = {}) {
  const { maxSize = 50, allowedTypes = [], allowedExtensions = [] } = options
  
  // Size validation
  if (file.size > maxSize * 1024 * 1024) {
    throw new Error(`File too large. Maximum size: ${maxSize}MB`)
  }
  
  // Type validation
  if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.startsWith(type))) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
  }
  
  // Extension validation
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`)
    }
  }
  
  // Malicious file name check
  const maliciousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
    /\.(exe|bat|cmd|com|scr|pif|vbs|js|jar|php|asp|aspx|jsp)$/i // Executable files
  ]
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(file.name)) {
      throw new Error('Invalid file name')
    }
  }
  
  return true
}

// Rate limiting by IP
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const key = identifier
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// IP address extraction
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (remoteAddr) {
    return remoteAddr
  }
  
  return 'unknown'
}

// CSRF protection
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64
}

// Content Security Policy headers
export function getCSPHeaders() {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://apis.google.com https://www.googleapis.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block'
  }
}

// SQL injection prevention (for dynamic queries)
export function escapeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
}

// XSS prevention
export function escapeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return input.replace(/[&<>"']/g, (m) => map[m])
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }
  
  if (!/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number')
  } else {
    score += 1
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Password must contain at least one special character')
  } else {
    score += 1
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

// Admin password validation
export function validateAdminPassword(password: string): boolean {
  // In production, this should be more sophisticated
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin2024'
  return password === adminPassword
}

// Session validation
export function validateSession(sessionData: any): boolean {
  if (!sessionData) return false
  
  const now = Date.now()
  const sessionExpiry = sessionData.expiresAt || (now + 24 * 60 * 60 * 1000) // 24 hours default
  
  return now < sessionExpiry
}

// File upload security
export function validateUploadSecurity(file: File, request: NextRequest): boolean {
  // Check file size
  if (file.size > 100 * 1024 * 1024) { // 100MB limit
    return false
  }
  
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return false
  }
  
  // Check for malicious file names
  const maliciousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
  ]
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(file.name)) {
      return false
    }
  }
  
  return true
}
