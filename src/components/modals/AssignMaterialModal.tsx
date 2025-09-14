import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Section, Topic } from '../../api/endpoints'
import { GeneratedContent } from '../../api/endpoints'

interface AssignMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (data: {
    sectionId: number
    title: string
    description?: string
    format: 'SCORM' | 'PDF' | 'HTML'
    assignmentType: 'general' | 'personalized'
    selectedStudents?: number[]
  }) => void
  content: GeneratedContent | null
  sections?: Section[]
  topics?: Topic[]
}

export function AssignMaterialModal({ isOpen, onClose, onAssign, content, sections = [] }: AssignMaterialModalProps) {
  const [formData, setFormData] = useState({
    sectionId: 0,
    title: '',
    description: '',
    format: 'SCORM' as 'SCORM' | 'PDF' | 'HTML',
    assignmentType: 'general' as 'general' | 'personalized',
    selectedStudents: [] as number[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Usar secciones pasadas como props
  const loadingSections = false

  // Obtener estudiantes de la sección seleccionada
  const { data: sectionStudents, isLoading: loadingStudents, error: studentsError } = useQuery({
    queryKey: ['section-students', formData.sectionId, formData.assignmentType],
    queryFn: () => academicApi.getStudentsBySection(formData.sectionId),
    enabled: isOpen && formData.sectionId > 0 && formData.assignmentType === 'personalized'
  })



  // Inicializar datos del formulario
  useEffect(() => {
    if (content && isOpen) {
      setFormData({
        sectionId: 0,
        title: content.title || '',
        description: '',
        format: 'SCORM',
        assignmentType: 'general',
        selectedStudents: []
      })
    }
  }, [content, isOpen])

  // Limpiar estudiantes seleccionados cuando cambia el tipo de asignación
  useEffect(() => {
    if (formData.assignmentType === 'general') {
      setFormData(prev => ({
        ...prev,
        selectedStudents: []
      }))
    }
  }, [formData.assignmentType])

  const validateField = (name: string, value: string | number | number[]) => {
    switch (name) {
      case 'sectionId':
        return value === 0 ? 'Debe seleccionar una sección' : ''
      case 'title':
        return !value || (value as string).trim() === '' ? 'El título es obligatorio' : ''
      case 'format':
        return !value ? 'Debe seleccionar un formato' : ''
      case 'selectedStudents':
        if (formData.assignmentType === 'personalized') {
          return (value as number[]).length === 0 ? 'Debe seleccionar al menos un estudiante' : ''
        }
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validar campo en tiempo real
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleStudentToggle = (studentId: number) => {
    setFormData(prev => {
      const newSelectedStudents = prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
      
      // Validar estudiantes seleccionados
      const error = validateField('selectedStudents', newSelectedStudents)
      setErrors(prevErrors => ({ ...prevErrors, selectedStudents: error }))
      
      return { ...prev, selectedStudents: newSelectedStudents }
    })
  }

  const handleSelectAllStudents = () => {
    if (sectionStudents?.data?.students) {
      const allStudentIds = sectionStudents.data.students.map((student: any) => student.id)
      setFormData(prev => ({ ...prev, selectedStudents: allStudentIds }))
      setErrors(prev => ({ ...prev, selectedStudents: '' }))
    }
  }

  const handleDeselectAllStudents = () => {
    setFormData(prev => ({ ...prev, selectedStudents: [] }))
    setErrors(prev => ({ ...prev, selectedStudents: 'Debe seleccionar al menos un estudiante' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos los campos
    const newErrors: Record<string, string> = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) newErrors[key] = error
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onAssign({
        sectionId: formData.sectionId,
        title: formData.title,
        description: formData.description,
        format: formData.format,
        assignmentType: formData.assignmentType,
        selectedStudents: formData.assignmentType === 'personalized' ? formData.selectedStudents : undefined
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              📤 Asignar Material a Sección
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Asigna este contenido generado con IA a una sección específica
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información del Contenido */}
        {content && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Contenido a Asignar</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Título:</strong> {content.title || 'Sin título'}</p>
              <p><strong>ID:</strong> {content.id}</p>
              <p><strong>Fecha de creación:</strong> {new Date(content.created_at).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de Sección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sección <span className="text-red-500">*</span>
            </label>
            {loadingSections ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
            ) : (
              <select
                name="sectionId"
                value={formData.sectionId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.sectionId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value={0}>Seleccionar sección...</option>
                {sections?.map((section: any) => (
                  <option key={section.id} value={section.id}>
                    {section.name} - {section.course?.name} (Capacidad: {section.capacity})
                  </option>
                ))}
              </select>
            )}
            {errors.sectionId && (
              <p className="mt-1 text-sm text-red-600">{errors.sectionId}</p>
            )}
          </div>

          {/* Tipo de Asignación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Asignación <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="assignmentType"
                  value="general"
                  checked={formData.assignmentType === 'general'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">🌐 Asignación General</div>
                  <div className="text-sm text-gray-600">
                    El material se asignará a todos los estudiantes de la sección
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="assignmentType"
                  value="personalized"
                  checked={formData.assignmentType === 'personalized'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">👥 Asignación Personalizada</div>
                  <div className="text-sm text-gray-600">
                    Selecciona estudiantes específicos para recibir el material
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Título del Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Material <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese el título del material"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción opcional del material"
            />
          </div>

          {/* Formato de Envío */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato de Envío <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="SCORM"
                  checked={formData.format === 'SCORM'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>SCORM</strong> - Formato estándar para LMS (Recomendado)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="PDF"
                  checked={formData.format === 'PDF'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>PDF</strong> - Documento estático
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="HTML"
                  checked={formData.format === 'HTML'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>HTML</strong> - Página web interactiva
                </span>
              </label>
            </div>
            {errors.format && (
              <p className="mt-1 text-sm text-red-600">{errors.format}</p>
            )}
          </div>

          {/* Selección de Estudiantes (solo para asignación personalizada) */}
          {formData.assignmentType === 'personalized' && formData.sectionId > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Estudiantes <span className="text-red-500">*</span>
              </label>
              
              {loadingStudents ? (
                <div className="animate-pulse bg-gray-200 h-32 rounded-md"></div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {studentsError ? (
                    <div className="text-center py-4 text-red-600">
                      <p>Error al cargar estudiantes: {studentsError.message}</p>
                    </div>
                  ) : sectionStudents?.data?.students && sectionStudents.data.students.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          {formData.selectedStudents.length} de {sectionStudents.data.students.length} estudiantes seleccionados
                        </span>
                        <div className="space-x-2">
                          <button
                            type="button"
                            onClick={handleSelectAllStudents}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Seleccionar todos
                          </button>
                          <button
                            type="button"
                            onClick={handleDeselectAllStudents}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Deseleccionar todos
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {sectionStudents.data.students.map((student: any) => (
                          <label key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.selectedStudents.includes(student.id)}
                              onChange={() => handleStudentToggle(student.id)}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">
                                {student.first_name && student.last_name 
                                  ? `${student.first_name} ${student.last_name}`
                                  : student.username || 'Sin nombre'
                                }
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.email}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No hay estudiantes en esta sección
                    </div>
                  )}
                </div>
              )}
              
              {errors.selectedStudents && (
                <p className="mt-1 text-sm text-red-600">{errors.selectedStudents}</p>
              )}
            </div>
          )}

          {/* Información Adicional */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">ℹ️ Información Importante</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              {formData.assignmentType === 'general' ? (
                <>
                  <li>• El material se enviará a <strong>TODOS</strong> los estudiantes de la sección</li>
                  <li>• Los estudiantes podrán acceder al material desde su portafolio</li>
                  <li>• El formato SCORM permite seguimiento de progreso y calificaciones</li>
                  <li>• Una vez asignado, el material estará disponible inmediatamente</li>
                </>
              ) : (
                <>
                  <li>• El material se enviará <strong>SOLO</strong> a los estudiantes seleccionados</li>
                  <li>• Los estudiantes seleccionados podrán acceder al material desde su portafolio</li>
                  <li>• El formato SCORM permite seguimiento de progreso y calificaciones</li>
                  <li>• Una vez asignado, el material estará disponible inmediatamente</li>
                  <li>• Puedes cambiar la selección de estudiantes antes de confirmar</li>
                </>
              )}
            </ul>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              {formData.assignmentType === 'general' 
                ? '📤 Asignar a Toda la Sección' 
                : `📤 Asignar a ${formData.selectedStudents.length} Estudiante${formData.selectedStudents.length !== 1 ? 's' : ''}`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
