import { useState, useEffect } from 'react'
import { Topic, academicApi } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={topic ? 'Editar Tema' : 'Crear Tema'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Tema"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          name="name"
          placeholder="Ej: Introducción a las Matemáticas"
          required
          error={errors.name && touched.name ? errors.name : undefined}
          disabled={loading || isSubmitting}
        />
        
        {errors.duplicate_name && (
          <div className="mt-1 flex items-center space-x-1">
            <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-error">{errors.duplicate_name}</p>
          </div>
        )}
        
        {!errors.name && !errors.duplicate_name && touched.name && formData.name.trim() && (
          <div className="mt-1 flex items-center space-x-1">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-success">Nombre válido</p>
          </div>
        )}
        
        {isCheckingDuplicates && (
          <div className="mt-1 flex items-center space-x-1">
            <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-primary">Verificando disponibilidad...</p>
          </div>
        )}

        <Textarea
          label="Descripción (opcional)"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          name="description"
          rows={3}
          placeholder="Descripción detallada del tema (opcional)"
          helperText="Proporciona una descripción detallada del tema para ayudar a los estudiantes"
          disabled={loading || isSubmitting}
        />

        <Select
          label="Curso"
          value={formData.course}
          onChange={handleChange}
          onBlur={handleBlur}
          name="course"
          required
          error={errors.course && touched.course ? errors.course : undefined}
          disabled={loading || isSubmitting}
          placeholder="Seleccionar curso"
          options={[
            { value: 0, label: 'Seleccionar curso', disabled: true },
            ...courses.map((course) => ({
              value: course.id,
              label: `${course.name} (${course.code})`
            }))
          ]}
        />
        
        {!errors.course && touched.course && formData.course !== 0 && (
          <div className="mt-1 flex items-center space-x-1">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-success">Curso seleccionado</p>
          </div>
        )}

        {/* Información sobre orden automático */}
        <div className="bg-primary-50 border border-primary-200 p-3 rounded-md">
          <p className="text-sm text-primary">
            <strong>Nota:</strong> El orden de los temas se asigna automáticamente. 
            Los temas se mostrarán en el orden en que fueron creados.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || isCheckingDuplicates}
            disabled={loading || isSubmitting || isCheckingDuplicates || !formData.name.trim() || formData.course === 0 || !!errors.duplicate_name}
          >
            {isSubmitting ? 'Guardando...' : isCheckingDuplicates ? 'Verificando...' : (topic ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
