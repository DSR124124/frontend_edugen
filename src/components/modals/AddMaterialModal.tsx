import { useState, useEffect } from 'react'
import { Student } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { 
  FiFile, 
  FiVideo, 
  FiMusic, 
  FiImage, 
  FiLink, 
  FiFileText,
  FiBook,
  FiUser,
  FiUsers,
  FiUpload
} from 'react-icons/fi'

interface AddMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    description?: string
    material_type: string
    file?: File
    url?: string
    topic: number
    is_shared: boolean
    assigned_students?: number[]
  }) => Promise<void>
  topic: {
    id: number
    name: string
    course_name: string
  } | null
  students: Student[]
  loading?: boolean
}

interface FormErrors {
  name: string
  material_type: string
  file: string
  url: string
  assigned_students: string
}

const MATERIAL_TYPES = [
  { 
    value: 'DOCUMENT', 
    label: 'Documento', 
    description: 'PDF, Word, PowerPoint, etc.',
    icon: FiFileText,
    color: 'primary',
    borderColor: '#005CFF',
    bgColor: '#E6F2FF',
    textColor: '#005CFF'
  },
  { 
    value: 'VIDEO', 
    label: 'Video', 
    description: 'MP4, AVI, MOV, etc.',
    icon: FiVideo,
    color: 'error',
    borderColor: '#FF3A24',
    bgColor: '#FFEBE8',
    textColor: '#FF3A24'
  },
  { 
    value: 'AUDIO', 
    label: 'Audio', 
    description: 'MP3, WAV, etc.',
    icon: FiMusic,
    color: 'success',
    borderColor: '#00BF4A',
    bgColor: '#E8F8F0',
    textColor: '#00BF4A'
  },
  { 
    value: 'IMAGE', 
    label: 'Imagen', 
    description: 'JPG, PNG, GIF, etc.',
    icon: FiImage,
    color: 'warning',
    borderColor: '#F7A325',
    bgColor: '#FEF7E8',
    textColor: '#F7A325'
  },
  { 
    value: 'LINK', 
    label: 'Enlace', 
    description: 'URL externa',
    icon: FiLink,
    color: 'secondary',
    borderColor: '#A142F5',
    bgColor: '#F3E8FF',
    textColor: '#A142F5'
  },
  { 
    value: 'OTHER', 
    label: 'Otro', 
    description: 'Cualquier otro tipo de archivo',
    icon: FiFile,
    color: 'info',
    borderColor: '#0074EE',
    bgColor: '#E6F2FF',
    textColor: '#0074EE'
  }
]


export function AddMaterialModal({ 
  isOpen, 
  onClose, 
  onSave, 
  topic, 
  students, 
  loading = false 
}: AddMaterialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    material_type: 'DOCUMENT',
    file: null as File | null,
    url: '',
    is_shared: true,
    assigned_students: [] as number[]
  })
  
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    material_type: '',
    file: '',
    url: '',
    assigned_students: ''
  })
  
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        material_type: 'DOCUMENT',
        file: null,
        url: '',
        is_shared: true,
        assigned_students: []
      })
      setErrors({
        name: '',
        material_type: '',
        file: '',
        url: '',
        assigned_students: ''
      })
      setTouched({})
      setIsSubmitting(false)
      setStudentSearch('')
    }
  }, [isOpen])

  // Filtrar estudiantes basado en la búsqueda
  const filteredStudents = students.filter(student => {
    const searchTerm = studentSearch.toLowerCase()
    return (
      student.first_name.toLowerCase().includes(searchTerm) ||
      student.last_name.toLowerCase().includes(searchTerm) ||
      student.username.toLowerCase().includes(searchTerm) ||
      (student.section?.name.toLowerCase().includes(searchTerm) || false)
    )
  })

  const validateField = (fieldName: string, value: unknown): string => {
    switch (fieldName) {
      case 'name':
        if (!value || typeof value !== 'string' || !value.trim()) {
          return 'El nombre del material es requerido'
        }
        if (value.trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres'
        }
        return ''
      case 'material_type':
        if (!value) {
          return 'Debe seleccionar un tipo de material'
        }
        return ''
      case 'file':
        if (formData.material_type !== 'LINK' && !value) {
          return 'Debe seleccionar un archivo'
        }
        return ''
      case 'url':
        if (formData.material_type === 'LINK' && (!value || typeof value !== 'string' || !value.trim())) {
          return 'Debe proporcionar una URL'
        }
        if (formData.material_type === 'LINK' && value && typeof value === 'string' && !isValidUrl(value.trim())) {
          return 'Debe proporcionar una URL válida'
        }
        return ''
      case 'assigned_students':
        if (!formData.is_shared && (!value || !Array.isArray(value) || value.length === 0)) {
          return 'Debe seleccionar al menos un estudiante'
        }
        return ''
      default:
        return ''
    }
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateField('name', formData.name),
      material_type: validateField('material_type', formData.material_type),
      file: validateField('file', formData.file),
      url: validateField('url', formData.url),
      assigned_students: validateField('assigned_students', formData.assigned_students)
    }

    setErrors(newErrors)
    setTouched({
      name: true,
      material_type: true,
      file: true,
      url: true,
      assigned_students: true
    })

    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Mostrar mensaje de error general si hay campos sin completar
      const hasErrors = Object.values(errors).some(error => error !== '')
      if (hasErrors) {
        // El mensaje se mostrará a través de los errores individuales de cada campo
        return
      }
    }

    setIsSubmitting(true)
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        material_type: formData.material_type,
        file: formData.file || undefined,
        url: formData.url.trim() || undefined,
        topic: topic!.id,
        is_shared: formData.is_shared,
        assigned_students: formData.is_shared ? undefined : formData.assigned_students
      })
      // No cerramos el modal aquí. El componente padre decidirá cerrarlo
      // solo cuando la creación haya sido exitosa, manteniéndolo abierto en caso de error.
    } catch (error) {
      console.error('Error saving material:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    
    // Si cambia el tipo de material, validar también archivo y URL
    if (name === 'material_type') {
      const fileError = validateField('file', formData.file)
      const urlError = validateField('url', formData.url)
      
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value),
        file: fileError,
        url: urlError
      }))
    } else {
      const fieldError = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      file
    }))
    
    setTouched(prev => ({
      ...prev,
      file: true
    }))
    
    const fieldError = validateField('file', file)
    setErrors(prev => ({
      ...prev,
      file: fieldError
    }))
  }

  const handleStudentToggle = (studentId: number) => {
    const newStudents = formData.assigned_students.includes(studentId)
      ? formData.assigned_students.filter(id => id !== studentId)
      : [...formData.assigned_students, studentId]
    
    setFormData(prev => ({
      ...prev,
      assigned_students: newStudents
    }))
    
    setTouched(prev => ({
      ...prev,
      assigned_students: true
    }))
    
    const fieldError = validateField('assigned_students', newStudents)
    setErrors(prev => ({
      ...prev,
      assigned_students: fieldError
    }))
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      material_type: 'DOCUMENT',
      file: null,
      url: '',
      is_shared: true,
      assigned_students: []
    })
    setErrors({
      name: '',
      material_type: '',
      file: '',
      url: '',
      assigned_students: ''
    })
    setTouched({})
    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen || !topic) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Material"
      size="lg"
    >
      <div className="mb-3 p-2 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center space-x-2 mb-1">
          <FiBook className="w-4 h-4 text-primary" />
          <span className="text-small font-semibold text-primary">Agregar Material</span>
        </div>
        <p className="text-extra-small text-neutral-600">
          <span className="font-medium text-neutral">Tema:</span> {topic.name} - {topic.course_name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Material */}
        <div>
          <label className="label mb-2">
            Tipo de Material <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {MATERIAL_TYPES.map((type) => {
              const isSelected = formData.material_type === type.value
              const hasError = errors.material_type && touched.material_type
              
              const getCardStyles = () => {
                if (isSelected) {
                  return {
                    borderColor: type.borderColor,
                    backgroundColor: type.bgColor
                  }
                } else if (hasError) {
                  return {
                    borderColor: '#FF3A24',
                    backgroundColor: '#FFEBE8'
                  }
                } else {
                  return {
                    borderColor: '#E5E5E5',
                    backgroundColor: '#FFFFFF'
                  }
                }
              }
              
              return (
                <label
                  key={type.value}
                  className="relative flex flex-col p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm"
                  style={getCardStyles()}
                >
                  <input
                    type="radio"
                    name="material_type"
                    value={type.value}
                    checked={isSelected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div 
                      className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? type.bgColor : '#F2F2F2'
                      }}
                    >
                      <type.icon 
                        className="w-4 h-4" 
                        style={{ color: isSelected ? type.textColor : '#6B7280' }}
                      />
                    </div>
                    <div className="text-small font-semibold text-base-content mb-1">{type.label}</div>
                    <div className="text-extra-small text-base-content/70 leading-tight">{type.description}</div>
                    {isSelected && (
                      <div className="mt-1">
                        <div 
                          className="w-1.5 h-1.5 mx-auto rounded-full"
                          style={{ backgroundColor: type.textColor }}
                        ></div>
                      </div>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
          {errors.material_type && touched.material_type && (
            <p className="mt-1 text-extra-small text-error">{errors.material_type}</p>
          )}
        </div>

        {/* Nombre del Material */}
        <Input
          label={
            <>
              Nombre del Material <span className="text-error">*</span>
            </>
          }
          value={formData.name}
          onChange={handleChange}
          name="name"
          placeholder="Ej: Guía de ejercicios de matemáticas"
          required
          error={errors.name && touched.name ? errors.name : undefined}
          disabled={loading || isSubmitting}
        />

        {/* Descripción */}
        <Textarea
          label="Descripción (opcional)"
          value={formData.description}
          onChange={handleChange}
          name="description"
          rows={3}
          placeholder="Descripción detallada del material"
          disabled={loading || isSubmitting}
        />

        {/* Archivo o URL */}
        {formData.material_type === 'LINK' ? (
          <Input
            label="URL del Material"
            type="url"
            value={formData.url}
            onChange={handleChange}
            name="url"
            placeholder="https://ejemplo.com/material"
            required
            error={errors.url && touched.url ? errors.url : undefined}
            disabled={loading || isSubmitting}
          />
        ) : (
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-base-content mb-1">
              Archivo <span className="text-error">*</span>
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              accept={getFileAccept(formData.material_type)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.file && touched.file
                  ? 'border-error focus:ring-error bg-error-50'
                  : 'border-base-300 focus:ring-primary'
              }`}
              disabled={loading || isSubmitting}
            />
            {errors.file && touched.file && (
              <p className="mt-1 text-extra-small text-error">{errors.file}</p>
            )}
            <p className="mt-1 text-extra-small text-base-content/70">
              Tamaño máximo: 10MB. Formatos permitidos: {getFileTypes(formData.material_type)}
            </p>
          </div>
        )}

        {/* Tipo de Distribución */}
        <div>
          <label className="label mb-2">
            Tipo de Distribución
          </label>
          <div className="space-y-2">
            <label className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
              formData.is_shared 
                ? 'border-primary bg-primary-50' 
                : 'border-base-300 hover:border-primary/50'
            }`}>
              <input
                type="radio"
                name="is_shared"
                checked={formData.is_shared}
                onChange={() => {
                  setFormData(prev => ({ ...prev, is_shared: true }))
                  const studentError = validateField('assigned_students', [])
                  setErrors(prev => ({ ...prev, assigned_students: studentError }))
                }}
                className="mt-1 text-primary focus:ring-primary border-base-300"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formData.is_shared ? 'bg-primary-100' : 'bg-base-200'
                  }`}>
                    <FiBook className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-small font-semibold text-base-content">Material de Clase</div>
                    <div className="text-extra-small text-primary font-medium">Recomendado</div>
                  </div>
                </div>
                <div className="text-extra-small text-base-content/70 leading-tight">
                  Se compartirá automáticamente con todos los estudiantes del curso en sus portafolios
                </div>
                {formData.is_shared && (
                  <div className="mt-1 flex items-center space-x-1 text-extra-small text-primary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Seleccionado</span>
                  </div>
                )}
              </div>
            </label>
            
            <label className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
              !formData.is_shared 
                ? 'border-secondary bg-secondary-50' 
                : 'border-base-300 hover:border-secondary/50'
            }`}>
              <input
                type="radio"
                name="is_shared"
                checked={!formData.is_shared}
                onChange={() => {
                  setFormData(prev => ({ ...prev, is_shared: false }))
                  const studentError = validateField('assigned_students', formData.assigned_students)
                  setErrors(prev => ({ ...prev, assigned_students: studentError }))
                }}
                className="mt-1 text-secondary focus:ring-secondary border-base-300"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    !formData.is_shared ? 'bg-secondary-100' : 'bg-base-200'
                  }`}>
                    <FiUser className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-small font-semibold text-base-content">Material Personalizado</div>
                    <div className="text-extra-small text-secondary font-medium">Avanzado</div>
                  </div>
                </div>
                <div className="text-extra-small text-base-content/70 leading-tight">
                  Selecciona estudiantes específicos para agregar a sus portafolios
                </div>
                {!formData.is_shared && (
                  <div className="mt-1 flex items-center space-x-1 text-extra-small text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span>Seleccionado</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Selección de Estudiantes (solo para materiales personalizados) */}
        {!formData.is_shared && (
          <div>
            <label className="label mb-2">
              Estudiantes específicos <span className="text-error">*</span>
            </label>
            
            {/* Campo de búsqueda */}
            <div className="mb-3">
              <Input
                type="text"
                placeholder="Buscar estudiante por nombre, apellido o usuario..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="input"
                disabled={loading || isSubmitting}
              />
            </div>
            
            <div className="max-h-32 overflow-y-auto border-2 border-base-300 rounded-lg p-3 bg-base-100">
              {filteredStudents.length > 0 ? (
                <div className="space-y-2">
                  {filteredStudents.map((student) => {
                    const isSelected = formData.assigned_students.includes(student.id)
                    return (
                      <label 
                        key={student.id} 
                        className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-sm ${
                          isSelected 
                            ? 'border-secondary bg-secondary-50' 
                            : 'border-base-200 hover:border-secondary/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleStudentToggle(student.id)}
                          className="h-4 w-4 text-secondary focus:ring-secondary border-base-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-extra-small font-semibold ${
                              isSelected ? 'bg-secondary-100 text-secondary' : 'bg-base-200 text-base-content/70'
                            }`}>
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-small font-medium text-base-content">
                                {student.first_name} {student.last_name}
                              </span>
                              <span className="text-extra-small text-base-content/70 ml-1">
                                @{student.username}
                              </span>
                            </div>
                          </div>
                          {student.section && (
                            <div className="mt-1 flex items-center space-x-1 text-extra-small text-base-content/70">
                              <FiBook className="w-3 h-3" />
                              <span>{student.section.name}</span>
                            </div>
                          )}
                          {isSelected && (
                            <div className="mt-1 flex items-center space-x-1 text-extra-small text-secondary">
                              <div className="w-1 h-1 rounded-full bg-secondary"></div>
                              <span>Seleccionado</span>
                            </div>
                          )}
                        </div>
                      </label>
                    )
                  })}
                  <div className="mt-2 pt-2 border-t border-base-300">
                    <div className="flex items-center justify-between text-extra-small">
                      <span className="text-base-content/70">
                        {studentSearch ? `Mostrando ${filteredStudents.length} de ${students.length} estudiantes` : `Total: ${students.length} estudiante${students.length !== 1 ? 's' : ''} con este curso`}
                      </span>
                      <span className="text-secondary font-medium">
                        {formData.assigned_students.length} seleccionado{formData.assigned_students.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-base-content/40 mb-2">
                    <FiUsers className="mx-auto h-8 w-8" />
                  </div>
                  <p className="text-small text-base-content/70 mb-1">
                    {studentSearch ? 'No se encontraron estudiantes con ese criterio de búsqueda' : 'No hay estudiantes con este curso en su portafolio'}
                  </p>
                  <p className="text-extra-small text-base-content/50">
                    {studentSearch ? 'Intenta con otro término de búsqueda' : 'Los estudiantes deben tener este curso asignado a su portafolio para aparecer aquí'}
                  </p>
                </div>
              )}
            </div>
            {errors.assigned_students && touched.assigned_students && (
              <p className="mt-1 text-extra-small text-error">{errors.assigned_students}</p>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-base-300">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={loading || isSubmitting}
            className="btn-secondary px-4 py-2"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={loading || isSubmitting}
            className="btn-primary px-4 py-2"
          >
            {isSubmitting ? 'Agregando...' : (
              <div className="flex items-center space-x-1">
                <FiUpload className="w-4 h-4" />
                <span>Agregar Material</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function getFileAccept(materialType: string): string {
  switch (materialType) {
    case 'DOCUMENT':
      return '.pdf,.doc,.docx,.ppt,.pptx,.txt,.rtf'
    case 'VIDEO':
      return '.mp4,.avi,.mov,.wmv,.flv,.webm'
    case 'AUDIO':
      return '.mp3,.wav,.ogg,.m4a,.aac'
    case 'IMAGE':
      return '.jpg,.jpeg,.png,.gif,.bmp,.svg'
    default:
      return '*'
  }
}

function getFileTypes(materialType: string): string {
  switch (materialType) {
    case 'DOCUMENT':
      return 'PDF, Word, PowerPoint, Texto'
    case 'VIDEO':
      return 'MP4, AVI, MOV, WMV'
    case 'AUDIO':
      return 'MP3, WAV, OGG, M4A'
    case 'IMAGE':
      return 'JPG, PNG, GIF, BMP'
    default:
      return 'Cualquier tipo de archivo'
  }
}
