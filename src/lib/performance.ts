// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 1000 // Keep only last 1000 metrics

  startTimer(operation: string) {
    const startTime = performance.now()
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime
        this.recordMetric({
          operation,
          duration,
          timestamp: Date.now(),
          metadata
        })
        return duration
      }
    }
  }

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow operations
    if (metric.duration > 1000) { // > 1 second
      console.warn(`[PERFORMANCE] Slow operation: ${metric.operation} took ${metric.duration.toFixed(2)}ms`, metric.metadata)
    }
  }

  getMetrics(operation?: string) {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation)
    }
    return this.metrics
  }

  getAverageDuration(operation: string) {
    const operationMetrics = this.getMetrics(operation)
    if (operationMetrics.length === 0) return 0
    
    const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0)
    return totalDuration / operationMetrics.length
  }

  getSlowOperations(threshold: number = 1000) {
    return this.metrics.filter(m => m.duration > threshold)
  }

  clear() {
    this.metrics = []
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Utility functions for common performance patterns
export function withPerformanceMonitoring<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const timer = performanceMonitor.startTimer(operation)
  
  return fn().then(
    (result) => {
      timer.end(metadata)
      return result
    },
    (error) => {
      timer.end({ ...metadata, error: error.message })
      throw error
    }
  )
}

// Image optimization utilities
export function getOptimizedImageUrl(
  fileId: string,
  width?: number,
  height?: number,
  quality: number = 80
) {
  const baseUrl = `https://drive.google.com/thumbnail?id=${fileId}`
  const params = new URLSearchParams()
  
  if (width) params.set('sz', width.toString())
  if (height) params.set('sz', `${width || height}x${height}`)
  params.set('q', quality.toString())
  
  return `${baseUrl}?${params.toString()}`
}

// Lazy loading helper
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  if (typeof window === 'undefined') return null
  
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver(callback, defaultOptions)
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window === 'undefined') return null
  
  const memory = (performance as any).memory
  if (!memory) return null
  
  return {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
  }
}

// Bundle size monitoring
export function logBundleSize() {
  if (typeof window === 'undefined') return
  
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  
  console.log('[BUNDLE] Scripts:', scripts.length)
  console.log('[BUNDLE] Stylesheets:', styles.length)
  
  // Log large resources
  scripts.forEach(script => {
    const src = (script as HTMLScriptElement).src
    if (src.includes('chunk') || src.includes('bundle')) {
      console.log('[BUNDLE] Script:', src)
    }
  })
}
