import { useState, useCallback, useEffect } from 'react'
import { authApi, User } from '../api/endpoints'

export const useProfessor = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener información del profesor actual
  const loadProfessorInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.me()
      setUser(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar información del profesor')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfessorInfo()
  }, [loadProfessorInfo])

  return {
    user,
    loading,
    error,
    loadProfessorInfo,
  }
}
