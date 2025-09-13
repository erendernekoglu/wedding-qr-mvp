// Basit analytics ve monitoring
export const trackEvent = (event: string, data?: any) => {
  // Production'da gerçek analytics servisi kullanılabilir
  if (process.env.NODE_ENV === 'production') {
    console.log(`[Analytics] ${event}:`, data)
    // Google Analytics, Mixpanel, vs. entegrasyonu buraya eklenebilir
  }
}

export const trackError = (error: Error, context?: string) => {
  console.error(`[Error] ${context || 'Unknown'}:`, error)
  // Error tracking servisi entegrasyonu (Sentry, vs.)
}

export const trackUserAction = (action: string, albumCode?: string) => {
  trackEvent('user_action', {
    action,
    albumCode,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
  })
}
