import axios from 'axios'

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const API_URL = import.meta.env.VITE_API_URL || (isDevelopment ? '/api/v1/' : 'https://edugen-backend-zailce-3c26d2-154-38-186-149.traefik.me/api/v1/') 

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
          const response = await axios.post(`${API_URL}accounts/token/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = response.data
          localStorage.setItem('access_token', access)
          
          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return http(originalRequest)
        } catch (refreshError) {
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