import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/'

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
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor para manejar errores de autenticación
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors for non-auth endpoints
    if (error.response?.status === 401 && !error.config.url?.includes('/login')) {
      // Clear tokens first
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      
      // Dispatch custom event for token expiry
      window.dispatchEvent(new CustomEvent('tokenExpired'))
    }
    return Promise.reject(error)
  }
)