import { useState, useCallback } from 'react'
import { academicApi } from '../api/endpoints'

export interface Student {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  enrolled_at: string
  is_active: boolean
}

export interface SectionStudents {
  section: {
    id: number
    name: string
    course_name?: string
    grade_level_name?: string
    term_name?: string
  }
  students: Student[]
  total_students: number
}

export const useStudentsBySection = () => {
  const [data, setData] = useState<SectionStudents | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStudentsBySection = useCallback(async (sectionId: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicApi.getStudentsBySection(sectionId)
      setData(response.data)
    } catch (err: unknown) {
      console.error('Error loading students by section:', err)
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al cargar estudiantes'
        : 'Error al cargar estudiantes'
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    data,
    loading,
    error,
    getStudentsBySection,
  }
}
