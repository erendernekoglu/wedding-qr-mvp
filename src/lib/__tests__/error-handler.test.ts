// Error handler tests
import { AppError, ERROR_CODES, formatErrorResponse, createErrorResponse } from '../error-handler'

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Test error', 400)
      
      expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('AppError')
    })
    
    it('should default statusCode to 500', () => {
      const error = new AppError(ERROR_CODES.INTERNAL_ERROR, 'Test error')
      
      expect(error.statusCode).toBe(500)
    })
  })
  
  describe('formatErrorResponse', () => {
    it('should format AppError correctly', () => {
      const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Test error', 400, { field: 'test' })
      const response = formatErrorResponse(error)
      
      expect(response).toEqual({
        error: 'Test error',
        code: ERROR_CODES.VALIDATION_ERROR,
        statusCode: 400,
        details: { field: 'test' }
      })
    })
    
    it('should format generic Error correctly', () => {
      const error = new Error('Generic error')
      const response = formatErrorResponse(error)
      
      expect(response.error).toBe('Internal server error')
      expect(response.code).toBe(ERROR_CODES.INTERNAL_ERROR)
      expect(response.statusCode).toBe(500)
    })
  })
  
  describe('createErrorResponse', () => {
    it('should create Response with correct status and headers', () => {
      const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Test error', 400)
      const response = createErrorResponse(error)
      
      expect(response.status).toBe(400)
      expect(response.headers.get('content-type')).toBe('application/json')
    })
  })
})
