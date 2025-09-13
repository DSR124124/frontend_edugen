import { useState, useEffect } from 'react'
import { Topic, academicApi } from '../../api/endpoints'

interface TopicModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; description?: string; course: number; order?: number }) => Promise<void>
  topic?: Topic | null
  courses: Array<{ id: number; name: string; code: string }>
  loading?: boolean
}

interface FormErrors {
  name: string
  course: string
  duplicate_name: string
}

export function TopicModal({ isOpen, onClose, onSave, topic, courses, loading = false }: TopicModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course: 0
  })
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    course: '',
    duplicate_name: ''
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        description: topic.description || '',
        course: topic.course
      })
    } else {
      setFormData({
        name: '',
        description: '',
        course: courses.length > 0 ? courses[0].id : 0
      })
    }
    setErrors({
      name: '',
      course: '',
      duplicate_name: ''
    })
    setTouched({})
    setIsSubmitting(false)
    setIsCheckingDuplicates(false)
  }, [topic, courses])

  const checkForDuplicateName = async (name: string, courseId: number): Promise<string> => {
    if (!name.trim() || !courseId) return ''
    
    try {
      setIsCheckingDuplicates(true)
      const response = await academicApi.getTopicsByCourse(courseId)
      const existingTopics = response.data || []
      
      // Verificar si existe un tema con el mismo nombre (case-insensitive)
      const duplicateTopic = existingTopics.find(existingTopic => 
        existingTopic.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        existingTopic.id !== topic?.id // Excluir el tema actual si estamos editando
      )
      
      if (duplicateTopic) {
        return `Ya existe un tema con el nombre "${duplicateTopic.name}" en este curso`
      }
      
      return ''
    } catch (error) {
      console.error('Error checking duplicate topic name:', error)
      return ''
    } finally {
      setIsCheckingDuplicates(false)
    }
  }

  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'name':
        if (!value || !value.trim()) {
          return 'El nombre del tema es requerido'
        }
        if (value.trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres'
        }
        return ''
      case 'course':
        if (!value || value === 0) {
          return 'Debe seleccionar un curso'
        }
        return ''
      default:
        return ''
    }
  }

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {
      name: validateField('name', formData.name),
      course: validateField('course', formData.course),
      duplicate_name: ''
    }

    // Verificar duplicados si el nombre y curso son válidos
    if (!newErrors.name && !newErrors.course && formData.name.trim() && formData.course) {
      const duplicateError = await checkForDuplicateName(formData.name, formData.course)
      newErrors.duplicate_name = duplicateError
    }

    setErrors(newErrors)
    setTouched({
      name: true,
      course: true
    })

    return !newErrors.name && !newErrors.course && !newErrors.duplicate_name
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        course: formData.course
      })
      onClose()
    } catch (error) {
      console.error('Error saving topic:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'course' ? Number(value) : value
    }))
    
    // Marcar campo como tocado
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    
    // Validar campo en tiempo real
    const fieldError = validateField(name, name === 'course' ? Number(value) : value)
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
      // Limpiar error de duplicado cuando se cambia el nombre o curso
      duplicate_name: (name === 'name' || name === 'course') ? '' : prev.duplicate_name
    }))
  }

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    
    const fieldError = validateField(name, name === 'course' ? Number(value) : value)
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }))
    
    // Verificar duplicados cuando se termina de escribir el nombre y hay un curso seleccionado
    if (name === 'name' && formData.course && !fieldError) {
      const duplicateError = await checkForDuplicateName(value, formData.course)
      setErrors(prev => ({
        ...prev,
        duplicate_name: duplicateError
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {topic ? 'Editar Tema' : 'Crear Tema'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Tema <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.name && touched.name
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Ej: Introducción a las Matemáticas"
              disabled={loading || isSubmitting}
            />
            {errors.name && touched.name && (
              <div className="mt-1 flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{errors.name}</p>
              </div>
            )}
            {errors.duplicate_name && (
              <div className="mt-1 flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{errors.duplicate_name}</p>
              </div>
            )}
            {!errors.name && !errors.duplicate_name && touched.name && formData.name.trim() && (
              <div className="mt-1 flex items-center space-x-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-600">Nombre válido</p>
              </div>
            )}
            {isCheckingDuplicates && (
              <div className="mt-1 flex items-center space-x-1">
                <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-blue-600">Verificando disponibilidad...</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Descripción detallada del tema (opcional)"
              disabled={loading || isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Proporciona una descripción detallada del tema para ayudar a los estudiantes
            </p>
          </div>

          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
              Curso <span className="text-red-500">*</span>
            </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.course && touched.course
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              disabled={loading || isSubmitting}
            >
              <option value={0}>Seleccionar curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
            {errors.course && touched.course && (
              <div className="mt-1 flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{errors.course}</p>
              </div>
            )}
            {!errors.course && touched.course && formData.course !== 0 && (
              <div className="mt-1 flex items-center space-x-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-600">Curso seleccionado</p>
              </div>
            )}
          </div>

          {/* Información sobre orden automático */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El orden de los temas se asigna automáticamente. 
              Los temas se mostrarán en el orden en que fueron creados.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading || isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              disabled={loading || isSubmitting || isCheckingDuplicates || !formData.name.trim() || formData.course === 0 || !!errors.duplicate_name}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : isCheckingDuplicates ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>{topic ? 'Actualizar' : 'Crear'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
