import { useState, useEffect } from 'react'
import { directorApi, User } from '../api/endpoints'

export const useDirectorUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const loadUsers = async () => {
    if (loading || loaded) return // Prevent multiple requests
    
    try {
      setLoading(true)
      setError(null)
      const response = await directorApi.getUsers()
      setUsers(response.data || [])
      setLoaded(true)
    } catch (err: any) {
      console.error('Error loading users:', err)
      setError(err.response?.data?.detail || 'Error al cargar usuarios')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: Partial<User> & { password: string }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await directorApi.createUser(userData)
      setUsers(prev => [...prev, response.data])
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear usuario')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)
      const response = await directorApi.updateUser(id, userData)
      setUsers(prev => prev.map(user => user.id === id ? response.data : user))
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar usuario')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await directorApi.deleteUser(id)
      setUsers(prev => prev.filter(user => user.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar usuario')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refreshUsers = () => {
    setLoaded(false)
    loadUsers()
  }

  // Load users only once on mount
  useEffect(() => {
    if (!loaded && !loading) {
      loadUsers()
    }
  }, [loaded, loading])

  return {
    users,
    loading,
    error,
    loaded,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
  }
}
