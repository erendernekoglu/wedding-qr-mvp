// Security utilities tests
import { 
  sanitizeInput, 
  validateFile, 
  validatePasswordStrength, 
  validateUploadSecurity,
  escapeHTML,
  escapeSQL
} from '../security'

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })
    
    it('should remove javascript protocol', () => {
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")')
    })
    
    it('should remove event handlers', () => {
      expect(sanitizeInput('onclick="alert(1)"')).toBe('"alert(1)"')
    })
    
    it('should limit length to 1000 characters', () => {
      const longInput = 'a'.repeat(1500)
      expect(sanitizeInput(longInput).length).toBe(1000)
    })
  })
  
  describe('validateFile', () => {
    const mockFile = (name: string, size: number, type: string) => ({
      name,
      size,
      type
    } as File)
    
    it('should validate file size', () => {
      const file = mockFile('test.jpg', 100 * 1024 * 1024, 'image/jpeg') // 100MB
      
      expect(() => validateFile(file, { maxSize: 50 })).toThrow('File too large')
    })
    
    it('should validate file type', () => {
      const file = mockFile('test.txt', 1024, 'text/plain')
      
      expect(() => validateFile(file, { allowedTypes: ['image/'] })).toThrow('Invalid file type')
    })
    
    it('should validate file extension', () => {
      const file = mockFile('test.exe', 1024, 'application/octet-stream')
      
      expect(() => validateFile(file, { allowedExtensions: ['jpg', 'png'] })).toThrow('Invalid file extension')
    })
    
    it('should reject malicious file names', () => {
      const maliciousFiles = [
        mockFile('../../../etc/passwd', 1024, 'text/plain'),
        mockFile('test<script>', 1024, 'text/plain'),
        mockFile('CON.txt', 1024, 'text/plain'),
        mockFile('test.exe', 1024, 'application/octet-stream')
      ]
      
      maliciousFiles.forEach(file => {
        expect(() => validateFile(file)).toThrow('Invalid file name')
      })
    })
  })
  
  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = validatePasswordStrength('StrongPass123!')
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBe(5)
      expect(result.feedback).toHaveLength(0)
    })
    
    it('should reject weak password', () => {
      const result = validatePasswordStrength('weak')
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBeLessThan(4)
      expect(result.feedback.length).toBeGreaterThan(0)
    })
  })
  
  describe('escapeHTML', () => {
    it('should escape HTML characters', () => {
      expect(escapeHTML('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    })
  })
  
  describe('escapeSQL', () => {
    it('should escape SQL injection attempts', () => {
      expect(escapeSQL("'; DROP TABLE users; --")).toBe("''; DROP TABLE users; ")
    })
  })
})
