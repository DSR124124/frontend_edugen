import { useState, useCallback, useRef } from 'react'
import { directorApi, User } from '../api/endpoints'

export const useDirectorApi = () => {
  const [users, setUsers] = useState<User[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Refs to prevent multiple simultaneous requests
  const usersLoadingRef = useRef(false)
  const sectionsLoadingRef = useRef(false)

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (usersLoadingRef.current) return
    
    try {
      usersLoadingRef.current = true
      setLoading(true)
      setError(null)
      const response = await directorApi.getUsers()
      setUsers(response.data || [])
    } catch (err: any) {
      console.error('Error loading users:', err)
      setError(err.response?.data?.detail || 'Error al cargar usuarios')
      setUsers([])
    } finally {
      setLoading(false)
      usersLoadingRef.current = false
    }
  }, [])

  // Cargar secciones
  const loadSections = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (sectionsLoadingRef.current) return
    
    try {
      sectionsLoadingRef.current = true
      setLoading(true)
      setError(null)
      const response = await directorApi.getSections()
      setSections(response.data || [])
    } catch (err: any) {
      console.error('Error loading sections:', err)
      setError(err.response?.data?.detail || 'Error al cargar secciones')
      setSections([])
    } finally {
      setLoading(false)
      sectionsLoadingRef.current = false
    }
  }, [])

  // Crear usuario
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

  // Actualizar usuario
  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)
      const response = await directorApi.updateUser(id, userData)
      
      // Recargar usuarios para obtener datos actualizados (especialmente assigned_sections)
      try {
        const updatedResponse = await directorApi.getUsers()
        setUsers(updatedResponse.data || [])
      } catch (reloadErr) {
        console.error('Error reloading users:', reloadErr)
        // Si falla la recarga, al menos actualizar con la respuesta original
        setUsers(prev => prev.map(user => user.id === id ? response.data : user))
      }
      
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar usuario')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Eliminar usuario
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

  // Crear sección
  const createSection = async (sectionData: any) => {
    try {
      setLoading(true)
      setError(null)
      const response = await directorApi.createSection(sectionData)
      setSections(prev => [...prev, response.data])
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear sección')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    users,
    sections,
    loading,
    error,
    loadUsers,
    loadSections,
    createUser,
    updateUser,
    deleteUser,
    createSection,
  }
}
