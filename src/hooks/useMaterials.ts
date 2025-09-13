import { useState, useCallback } from 'react'
import { academicApi, Material } from '../api/endpoints'

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicApi.getMaterials()
      setMaterials(response.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar materiales'
        : 'Error al cargar materiales'
      setError(errorMessage)
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMaterialsByTopic = useCallback(async (topicId: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await academicApi.getMaterialsByTopic(topicId)
      setMaterials(response.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar materiales'
        : 'Error al cargar materiales'
      setError(errorMessage)
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createMaterial = useCallback(async (data: {
    name: string
    description?: string
    material_type: string
    file?: File
    url?: string
    topic: number
    is_shared: boolean
    assigned_students?: number[]
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      // Crear FormData para manejar archivos
      const formData = new FormData()
      formData.append('name', data.name)
      if (data.description) formData.append('description', data.description)
      formData.append('material_type', data.material_type)
      formData.append('topic', data.topic.toString())
      formData.append('is_shared', data.is_shared.toString())
      
      if (data.file) {
        formData.append('file', data.file)
      }
      
      if (data.url) {
        formData.append('url', data.url)
      }
      
      if (data.assigned_students && data.assigned_students.length > 0) {
        data.assigned_students.forEach(studentId => {
          formData.append('assigned_students', studentId.toString())
        })
      }


      // Usar el endpoint original con autenticación
      const response = await academicApi.createMaterial(formData)
      setMaterials(prev => [...prev, response.data])
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al crear material'
        : 'Error al crear material'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMaterial = useCallback(async (id: number, data: {
    name?: string
    description?: string
    material_type?: string
    file?: File
    url?: string
    is_shared?: boolean
    assigned_students?: number[]
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      // Crear FormData para manejar archivos
      const formData = new FormData()
      if (data.name) formData.append('name', data.name)
      if (data.description) formData.append('description', data.description)
      if (data.material_type) formData.append('material_type', data.material_type)
      if (data.is_shared !== undefined) formData.append('is_shared', data.is_shared.toString())
      
      if (data.file) {
        formData.append('file', data.file)
      }
      
      if (data.url) {
        formData.append('url', data.url)
      }
      
      if (data.assigned_students && data.assigned_students.length > 0) {
        data.assigned_students.forEach(studentId => {
          formData.append('assigned_students', studentId.toString())
        })
      }

      const response = await academicApi.updateMaterial(id, formData)
      setMaterials(prev => prev.map(material => 
        material.id === id ? response.data : material
      ))
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al actualizar material'
        : 'Error al actualizar material'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteMaterial = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await academicApi.deleteMaterial(id)
      setMaterials(prev => prev.filter(material => material.id !== id))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al eliminar material'
        : 'Error al eliminar material'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    materials,
    loading,
    error,
    loadMaterials,
    loadMaterialsByTopic,
    createMaterial,
    updateMaterial,
    deleteMaterial
  }
}
