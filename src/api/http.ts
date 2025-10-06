import axios from 'axios'
import { getApiUrl } from '../config/environment'

export const http = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Configure timeout and other options
  timeout: 10000,
  // Ignore SSL certificate errors in development/staging
  httpsAgent: typeof window === 'undefined' ? undefined : undefined, // Solo para Node.js
})

// Request interceptor para agregar el token JWT
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Si es FormData, no establecer Content-Type para que axios lo maneje automáticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor para manejar errores de autenticación y refresh tokens
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Only handle 401 errors for non-auth endpoints
    if (error.response?.status === 401 && !originalRequest.url?.includes('/login') && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refresh_token')
      
      if (refreshToken) {
        try {
          // Intentar renovar el token
          const response = await axios.post(`${getApiUrl()}accounts/token/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = response.data
          localStorage.setItem('access_token', access)
          
          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return http(originalRequest)
        } catch {
          // Si el refresh falla, NO limpiar tokens inmediatamente
          // Solo disparar el evento para mostrar el modal
          window.dispatchEvent(new CustomEvent('tokenExpired'))
        }
      } else {
        // No hay refresh token, disparar evento para mostrar modal
        window.dispatchEvent(new CustomEvent('tokenExpired'))
      }
    }
    
    return Promise.reject(error)
  }
)