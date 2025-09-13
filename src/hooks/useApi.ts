import { useState, useCallback } from 'react'
// import { API_CONFIG } from '../utils/constants'

export interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface UseApiActions<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
  setData: (data: T | null) => void
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiState<T> & UseApiActions<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error desconocido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  }
}
