import { useState } from 'react'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
  }

  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        {isSuccess ? (
          // Pantalla de confirmación de éxito
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Asignación Exitosa!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              El curso <strong>{course.name}</strong> ha sido asignado exitosamente a los salones seleccionados.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                Salones Asignados ({assignedSections.length}):
              </h4>
              <div className="space-y-1">
                {assignedSections.map((section) => (
                  <div key={section.id} className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-green-700">🏫 Salón {section.name}</span>
                    {section.grade_level && (
                      <span className="text-xs text-green-600">({section.grade_level.name})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="inline-flex items-center text-sm text-gray-500">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cerrando automáticamente...
              </div>
            </div>
          </div>
        ) : (
          // Formulario normal
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Asignar Curso: {course.name}
            </h3>
            <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Salones</label>
              <p className="text-xs text-gray-500 mb-2">Selecciona los salones (A, B, C, etc.) donde se impartirá este curso</p>
              <div className="mt-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {sections && sections.length > 0 ? (
                  sections.map((section) => (
                    <label key={section.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.section_ids.includes(section.id)}
                        onChange={(e) => handleSectionChange(section.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">Salón {section.name}</span>
                      {section.grade_level && (
                        <span className="text-xs text-gray-500">({section.grade_level.name})</span>
                      )}
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-2">No tienes salones asignados</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting || formData.section_ids.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading || isSubmitting ? 'Asignando...' : 'Asignar a Salones'}
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  )
}
