import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, STORAGE_KEYS } from '../utils/constants'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - Simplified to avoid loops
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only handle 401 errors for non-auth endpoints
        if (error.response?.status === 401 && !error.config.url?.includes('/login')) {
          // NO limpiar tokens inmediatamente - solo disparar evento
          window.dispatchEvent(new CustomEvent('tokenExpired'))
        }
        return Promise.reject(error)
      }
    )
  }

  // private async refreshToken(refreshToken: string) {
  //   return this.client.post('/accounts/token/refresh/', {
  //     refresh: refreshToken,
  //   })
  // }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config)
  }

  // Utility methods
  setBaseURL(baseURL: string) {
    this.client.defaults.baseURL = baseURL
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.Authorization = `Bearer ${token}`
  }

  removeAuthToken() {
    delete this.client.defaults.headers.Authorization
  }

  // Retry mechanism
  async retry<T>(requestFn: () => Promise<T>, maxRetries = API_CONFIG.RETRY_ATTEMPTS): Promise<T> {
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error as Error
        
        if (i === maxRetries - 1) {
          throw lastError
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }

    throw lastError!
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient
