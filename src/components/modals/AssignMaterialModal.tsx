import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Section, Topic } from '../../api/endpoints'
import { GeneratedContent } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { FiUpload, FiGlobe, FiUserCheck, FiInfo } from 'react-icons/fi'

interface AssignMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (data: {
    sectionId: number
    title: string
    description?: string
    assignmentType: 'general' | 'personalized'
    selectedStudents?: number[]
  }) => void
  content: GeneratedContent | null
  sections?: Section[]
  topics?: Topic[]
}

export function AssignMaterialModal({ 
  isOpen, 
  onClose, 
  onAssign, 
  content, 
  sections = [] 
}: AssignMaterialModalProps) {
  const [formData, setFormData] = useState({
    sectionId: 0,
    title: '',
    description: '',
    assignmentType: 'general' as 'general' | 'personalized',
    selectedStudents: [] as number[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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
        assignmentType: 'general',
        selectedStudents: []
      })
    }
    // Limpiar errores y estado tocado
    setErrors({})
    setTouched({})
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
    
    // Marcar campo como tocado
    setTouched(prev => ({ ...prev, [name]: true }))
    
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
      const allStudentIds = sectionStudents.data.students.map((student: { id: number }) => student.id)
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
    setTouched({
      sectionId: true,
      title: true,
      selectedStudents: formData.assignmentType === 'personalized'
    })

    if (Object.keys(newErrors).length === 0) {
      onAssign({
        sectionId: formData.sectionId,
        title: formData.title,
        description: formData.description,
        assignmentType: formData.assignmentType,
        selectedStudents: formData.assignmentType === 'personalized' ? formData.selectedStudents : undefined
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Material"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información del Contenido */}
        {content && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                <FiUpload className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-primary mb-2">Contenido a Asignar</h4>
                <div className="text-sm text-primary/80 space-y-1">
                  <p><strong>Título:</strong> {content.title || 'Sin título'}</p>
                  <p><strong>Fecha de creación:</strong> {new Date(content.created_at).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de Sección */}
          <Select
            label="Sección"
            value={formData.sectionId}
            onChange={handleChange}
            name="sectionId"
            required
            error={errors.sectionId && touched.sectionId ? errors.sectionId : undefined}
            placeholder="Seleccionar sección..."
            options={[
              { value: 0, label: 'Seleccionar sección...' },
              ...sections.map((section: Section) => ({
                value: section.id,
                label: `${section.name} - ${section.course?.name} (${section.grade_level?.name || 'Sin grado'} - Nivel ${section.grade_level?.level || 'N/A'})`
              }))
            ]}
          />

          {/* Tipo de Asignación */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-3">
              Tipo de Asignación <span className="text-error">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-4 border border-base-300 rounded-lg hover:bg-base-200 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="assignmentType"
                  value="general"
                  checked={formData.assignmentType === 'general'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiGlobe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-base-content">Asignación General</div>
                    <div className="text-sm text-base-content/70">
                      El material se asignará a todos los estudiantes de la sección
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border border-base-300 rounded-lg hover:bg-base-200 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="assignmentType"
                  value="personalized"
                  checked={formData.assignmentType === 'personalized'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-secondary-100 rounded-lg">
                    <FiUserCheck className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium text-base-content">Asignación Personalizada</div>
                    <div className="text-sm text-base-content/70">
                      Selecciona estudiantes específicos para recibir el material
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Título del Material */}
          <Input
            label="Título del Material"
            value={formData.title}
            onChange={handleChange}
            name="title"
            placeholder="Ingrese el título del material"
            required
            error={errors.title && touched.title ? errors.title : undefined}
          />

          {/* Descripción */}
          <Textarea
            label="Descripción"
            value={formData.description}
            onChange={handleChange}
            name="description"
            rows={3}
            placeholder="Descripción opcional del material"
          />


          {/* Selección de Estudiantes (solo para asignación personalizada) */}
          {formData.assignmentType === 'personalized' && formData.sectionId > 0 && (
            <div>
              <label className="block text-sm font-medium text-base-content mb-3">
                Seleccionar Estudiantes <span className="text-error">*</span>
              </label>
              
              {loadingStudents ? (
                <div className="animate-pulse bg-base-200 h-32 rounded-lg"></div>
              ) : (
                <div className="border border-base-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-base-100">
                  {studentsError ? (
                    <div className="text-center py-4 text-error">
                      <p>Error al cargar estudiantes: {studentsError.message}</p>
                    </div>
                  ) : sectionStudents?.data?.students && sectionStudents.data.students.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-base-300">
                        <span className="text-sm font-medium text-base-content">
                          {formData.selectedStudents.length} de {sectionStudents.data.students.length} estudiantes seleccionados
                        </span>
                        <div className="space-x-2">
                          <Button
                            type="button"
                            onClick={handleSelectAllStudents}
                            variant="ghost"
                            size="sm"
                          >
                            Seleccionar todos
                          </Button>
                          <Button
                            type="button"
                            onClick={handleDeselectAllStudents}
                            variant="ghost"
                            size="sm"
                          >
                            Deseleccionar todos
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {sectionStudents.data.students.map((student: { id: number; first_name?: string; last_name?: string; username?: string; email: string }) => (
                          <label key={student.id} className="flex items-center space-x-3 p-2 hover:bg-base-200 rounded cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.selectedStudents.includes(student.id)}
                              onChange={() => handleStudentToggle(student.id)}
                              className="checkbox checkbox-primary"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-base-content">
                                {student.first_name && student.last_name 
                                  ? `${student.first_name} ${student.last_name}`
                                  : student.username || 'Sin nombre'
                                }
                              </div>
                              <div className="text-xs text-base-content/70">
                                {student.email}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-base-content/70 py-4">
                      No hay estudiantes en esta sección
                    </div>
                  )}
                </div>
              )}
              
              {errors.selectedStudents && (
                <p className="mt-1 text-sm text-error">{errors.selectedStudents}</p>
              )}
            </div>
          )}

          {/* Información Adicional */}
          <div className="bg-info-50 border border-info-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-info-100 rounded-lg flex-shrink-0">
                <FiInfo className="w-4 h-4 text-info" />
              </div>
              <div>
                <h4 className="font-medium text-info mb-2">Información Importante</h4>
                <ul className="text-sm text-info/80 space-y-1">
                  {formData.assignmentType === 'general' ? (
                    <>
                      <li>• El material se enviará a <strong>TODOS</strong> los estudiantes de la sección</li>
                      <li>• Los estudiantes podrán acceder al material desde su portafolio</li>
                      <li>• Una vez asignado, el material estará disponible inmediatamente</li>
                    </>
                  ) : (
                    <>
                      <li>• El material se enviará <strong>SOLO</strong> a los estudiantes seleccionados</li>
                      <li>• Los estudiantes seleccionados podrán acceder al material desde su portafolio</li>
                      <li>• Una vez asignado, el material estará disponible inmediatamente</li>
                      <li>• Puedes cambiar la selección de estudiantes antes de confirmar</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<FiUpload className="w-4 h-4" />}
            >
              {formData.assignmentType === 'general' 
                ? 'Asignar a Toda la Sección' 
                : `Asignar a ${formData.selectedStudents.length} Estudiante${formData.selectedStudents.length !== 1 ? 's' : ''}`
              }
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}