// Centralized error handling utilities
export interface IAppError {
  code: string
  message: string
  statusCode: number
  details?: any
}

export class AppError extends Error implements IAppError {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: any

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Common error codes
export const ERROR_CODES = {
  // Authentication & Authorization
  INVALID_BETA_CODE: 'INVALID_BETA_CODE',
  INVALID_EVENT_CODE: 'INVALID_EVENT_CODE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  
  // Resource Management
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  BETA_CODE_NOT_FOUND: 'BETA_CODE_NOT_FOUND',
  FILE_LIMIT_REACHED: 'FILE_LIMIT_REACHED',
  
  // External Services
  GOOGLE_DRIVE_ERROR: 'GOOGLE_DRIVE_ERROR',
  REDIS_ERROR: 'REDIS_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const

// Error response formatter
export function formatErrorResponse(error: AppError | Error) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    }
  }

  // Log unexpected errors
  console.error('Unexpected error:', error)
  
  return {
    error: 'Internal server error',
    code: ERROR_CODES.INTERNAL_ERROR,
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  }
}

// API response helper
export function createErrorResponse(error: AppError | Error) {
  const errorResponse = formatErrorResponse(error)
  
  return new Response(
    JSON.stringify(errorResponse),
    {
      status: errorResponse.statusCode,
      headers: { 'content-type': 'application/json' }
    }
  )
}

// Validation error helper
export function createValidationError(message: string, details?: any) {
  return new AppError(
    ERROR_CODES.VALIDATION_ERROR,
    message,
    400,
    details
  )
}

// Environment validation
export function validateEnvironment() {
  const requiredEnvs = {
    // Google Drive
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    DRIVE_ROOT_FOLDER_ID: process.env.DRIVE_ROOT_FOLDER_ID,
    
    // Redis
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    
    // App
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
  }

  const missingEnvs = Object.entries(requiredEnvs)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingEnvs.length > 0) {
    throw new AppError(
      ERROR_CODES.CONFIGURATION_ERROR,
      `Missing required environment variables: ${missingEnvs.join(', ')}`,
      500
    )
  }
}

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000) {
  const now = Date.now()
  const key = identifier
  const current = rateLimitMap.get(key)

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    throw new AppError(
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded. Please try again later.',
      429
    )
  }

  current.count++
  return true
}
