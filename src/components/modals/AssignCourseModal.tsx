import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface Course {
  id: number
  name: string
  code: string
  description?: string
  institution: number
  created_at: string
}

interface Section {
  id: number
  name: string
  course?: {
    id: number
    name: string
    code: string
  }
  grade_level?: {
    id: number
    name: string
    level: number
  }
  term?: {
    id: number
    name: string
    is_active: boolean
  }
}

interface AssignCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    section_ids: number[]
  }) => Promise<void>
  loading: boolean
  course: Course | null
  sections: Section[]
}

export function AssignCourseModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  course,
  sections
}: AssignCourseModalProps) {
  const [formData, setFormData] = useState({
    section_ids: [] as number[]
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [assignedSections, setAssignedSections] = useState<Section[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.section_ids.length === 0) {
      setError('Debes seleccionar al menos un salón')
      return
    }

    setError(null)
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      
      // Obtener las secciones asignadas para mostrar en la confirmación
      const selectedSections = sections.filter(section => 
        formData.section_ids.includes(section.id)
      )
      setAssignedSections(selectedSections)
      
      // Mostrar pantalla de éxito
      setIsSuccess(true)
      
      // Cerrar el modal después de 3 segundos
      setTimeout(() => {
        handleClose()
      }, 3000)
      
    } catch (error) {
      console.error('Error assigning course:', error)
      setError('Error al asignar el curso. Por favor, intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      section_ids: []
    })
    setIsSuccess(false)
    setAssignedSections([])
    setIsSubmitting(false)
    setError(null)
    onClose()
  }

  const handleSectionChange = (sectionId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        section_ids: [...prev.section_ids, sectionId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        section_ids: prev.section_ids.filter(id => id !== sectionId)
      }))
    }
    // Limpiar error cuando se selecciona algo
    if (error) {
      setError(null)
    }
  }

  if (!isOpen || !course) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? "Asignación Exitosa" : `Asignar Curso: ${course.name}`}
      size="md"
    >
      {isSuccess ? (
        // Pantalla de confirmación de éxito
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-4">
            <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">
            ¡Asignación Exitosa!
          </h3>
          <p className="text-sm text-base-content/70 mb-4">
            El curso <strong>{course.name}</strong> ha sido asignado exitosamente a los salones seleccionados.
          </p>
          
          <div className="bg-success-50 border border-success-200 rounded-md p-4 mb-4">
            <h4 className="text-sm font-medium text-success mb-2">
              Salones Asignados ({assignedSections.length}):
            </h4>
            <div className="space-y-1">
              {assignedSections.map((section) => (
                <div key={section.id} className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-success">🏫 Salón {section.name}</span>
                  {section.grade_level && (
                    <span className="text-xs text-success/70">({section.grade_level.name})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="inline-flex items-center text-sm text-base-content/70">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cerrando automáticamente...
            </div>
          </div>
        </div>
      ) : (
        // Formulario normal
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Seleccionar Salones
            </label>
            <p className="text-xs text-base-content/70 mb-3">
              Selecciona los salones donde se impartirá este curso
            </p>
            
            {error && (
              <div className="mb-3 p-3 bg-error-50 border border-error-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-error mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-error">{error}</span>
                </div>
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto border border-base-300 rounded-md p-3 bg-base-100">
              {sections && sections.length > 0 ? (
                <div className="space-y-2">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center space-x-3 p-2 hover:bg-base-200 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.section_ids.includes(section.id)}
                        onChange={(e) => handleSectionChange(section.id, e.target.checked)}
                        disabled={loading || isSubmitting}
                        className="checkbox checkbox-primary"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-base-content">
                          Salón {section.name}
                        </span>
                        {section.grade_level && (
                          <span className="text-xs text-base-content/70 ml-2">
                            ({section.grade_level.name})
                          </span>
                        )}
                        {section.term && (
                          <span className="text-xs text-base-content/70 ml-2">
                            - {section.term.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-base-content/70">No tienes salones asignados</p>
                </div>
              )}
            </div>
            
            {formData.section_ids.length > 0 && (
              <div className="mt-2 text-xs text-success">
                ✓ {formData.section_ids.length} salón{formData.section_ids.length !== 1 ? 'es' : ''} seleccionado{formData.section_ids.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={loading || isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={loading || isSubmitting || formData.section_ids.length === 0}
            >
              {isSubmitting ? 'Asignando...' : 'Asignar a Salones'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}