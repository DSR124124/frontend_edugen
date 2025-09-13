import { useState, useCallback, useEffect } from 'react'
import { academicApi, Section } from '../api/endpoints'

export const useProfessorSections = () => {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener secciones asignadas al profesor
  const loadSections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicApi.getSections()
      
      // Intentar ambos formatos
      const sectionsData = response.data?.results || response.data || []
      setSections(sectionsData)
    } catch (err: unknown) {
      console.error('Error loading professor sections:', err)
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar secciones'
        : 'Error al cargar secciones'
      setError(errorMessage)
      setSections([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSections()
  }, [loadSections])

  return {
    sections,
    loading,
    error,
    loadSections,
  }
}
