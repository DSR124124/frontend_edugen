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
    // En desarrollo, apuntar explícitamente al backend local de Django
    // para evitar que axios use la URL del frontend (5173)
    return 'http://127.0.0.1:8000/api/v1/'
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

/**
 * Asegura que una URL use HTTPS si la página actual está en HTTPS
 * Esto previene errores de "Mixed Content" en producción
 */
export const ensureHttps = (url: string): string => {
  // Si la página está en HTTPS, forzar HTTPS en todas las URLs
  if (window.location.protocol === 'https:') {
    return url.replace(/^http:/, 'https:')
  }
  return url
}

/**
 * Construye una URL completa para un archivo, asegurando HTTPS si es necesario
 */
export const buildFileUrl = (filePath: string): string => {
  const apiUrl = getApiUrl()
  let apiRoot = apiUrl.replace(/\/?api\/v1\/?$/, '')
  apiRoot = ensureHttps(apiRoot)
  
  // Si ya es una URL completa, asegurar HTTPS
  if (filePath.startsWith('http')) {
    return ensureHttps(filePath)
  }
  
  // Si la URL relativa comienza con /, usar el origen completo
  if (filePath.startsWith('/')) {
    return `${window.location.protocol}//${window.location.host}${filePath}`
  }
  
  // Construir URL relativa usando apiRoot
  return `${apiRoot}${filePath}`
}
