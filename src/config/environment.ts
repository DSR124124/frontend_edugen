// Environment configuration
export const getApiUrl = (): string => {
  // Check if we're in development mode
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Default URLs based on environment
  if (isDevelopment) {
    return '/api/v1/'
  }
  
  // Production URL
  return 'https://edugen-backend.brianuceda.xyz/api/v1/'
}

export const isDevelopment = (): boolean => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export const isProduction = (): boolean => {
  return !isDevelopment()
}
