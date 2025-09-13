import { useState, useCallback, useEffect } from 'react'
import { academicApi, Topic } from '../api/endpoints'

export const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicApi.getTopics()
      setTopics(response.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar temas'
        : 'Error al cargar temas'
      setError(errorMessage)
      setTopics([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTopicsByCourse = useCallback(async (courseId: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicApi.getTopicsByCourse(courseId)
      setTopics(response.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar temas'
        : 'Error al cargar temas'
      setError(errorMessage)
      setTopics([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createTopic = useCallback(async (data: { name: string; description?: string; course: number }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicApi.createTopic(data)
      setTopics(prev => [...prev, response.data])
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al crear tema'
        : 'Error al crear tema'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTopic = useCallback(async (id: number, data: { name?: string; description?: string; order?: number; is_active?: boolean }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicApi.updateTopic(id, data)
      setTopics(prev => prev.map(topic => 
        topic.id === id ? response.data : topic
      ))
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al actualizar tema'
        : 'Error al actualizar tema'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTopic = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await academicApi.deleteTopic(id)
      setTopics(prev => prev.filter(topic => topic.id !== id))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al eliminar tema'
        : 'Error al eliminar tema'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTopics()
  }, [loadTopics])

  return {
    topics,
    loading,
    error,
    loadTopics,
    loadTopicsByCourse,
    createTopic,
    updateTopic,
    deleteTopic,
  }
}
