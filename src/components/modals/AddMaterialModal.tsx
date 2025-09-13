import { useState, useEffect } from 'react'
import { Student } from '../../api/endpoints'

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
  { value: 'DOCUMENT', label: '📄 Documento', description: 'PDF, Word, PowerPoint, etc.' },
  { value: 'VIDEO', label: '🎥 Video', description: 'MP4, AVI, MOV, etc.' },
  { value: 'AUDIO', label: '🎵 Audio', description: 'MP3, WAV, etc.' },
  { value: 'IMAGE', label: '🖼️ Imagen', description: 'JPG, PNG, GIF, etc.' },
  { value: 'LINK', label: '🔗 Enlace', description: 'URL externa' },
  { value: 'OTHER', label: '📎 Otro', description: 'Cualquier otro tipo de archivo' }
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
    }
  }, [isOpen])

  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'name':
        if (!value || !value.trim()) {
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
        if (formData.material_type === 'LINK' && (!value || !value.trim())) {
          return 'Debe proporcionar una URL'
        }
        if (formData.material_type === 'LINK' && value && !isValidUrl(value.trim())) {
          return 'Debe proporcionar una URL válida'
        }
        return ''
      case 'assigned_students':
        if (!formData.is_shared && (!value || value.length === 0)) {
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
      onClose()
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              📚 Agregar Material
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Tema: <span className="font-medium">{topic.name}</span> - {topic.course_name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading || isSubmitting}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Material <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MATERIAL_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.material_type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : errors.material_type && touched.material_type
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="material_type"
                    value={type.value}
                    checked={formData.material_type === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">{type.label.split(' ')[0]}</div>
                    <div className="text-sm font-medium text-gray-900">{type.label.split(' ').slice(1).join(' ')}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.material_type && touched.material_type && (
              <p className="mt-1 text-sm text-red-600">{errors.material_type}</p>
            )}
          </div>

          {/* Nombre del Material */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Material <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.name && touched.name
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Ej: Guía de ejercicios de matemáticas"
              disabled={loading || isSubmitting}
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Descripción detallada del material"
              disabled={loading || isSubmitting}
            />
          </div>

          {/* Archivo o URL */}
          {formData.material_type === 'LINK' ? (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL del Material <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.url && touched.url
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="https://ejemplo.com/material"
                disabled={loading || isSubmitting}
              />
              {errors.url && touched.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Archivo <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                accept={getFileAccept(formData.material_type)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.file && touched.file
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                disabled={loading || isSubmitting}
              />
              {errors.file && touched.file && (
                <p className="mt-1 text-sm text-red-600">{errors.file}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tamaño máximo: 10MB. Formatos permitidos: {getFileTypes(formData.material_type)}
              </p>
            </div>
          )}

          {/* Tipo de Distribución */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Distribución
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="is_shared"
                  checked={formData.is_shared}
                  onChange={() => {
                    setFormData(prev => ({ ...prev, is_shared: true }))
                    // Validar estudiantes cuando se cambia a compartido
                    const studentError = validateField('assigned_students', [])
                    setErrors(prev => ({ ...prev, assigned_students: studentError }))
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">📚 Material de Clase</div>
                  <div className="text-sm text-gray-600">
                    Se compartirá automáticamente con todos los estudiantes del curso en sus portafolios
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="is_shared"
                  checked={!formData.is_shared}
                  onChange={() => {
                    setFormData(prev => ({ ...prev, is_shared: false }))
                    // Validar estudiantes cuando se cambia a personalizado
                    const studentError = validateField('assigned_students', formData.assigned_students)
                    setErrors(prev => ({ ...prev, assigned_students: studentError }))
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">👤 Material Personalizado</div>
                  <div className="text-sm text-gray-600">
                    Selecciona estudiantes específicos para agregar a sus portafolios
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Selección de Estudiantes (solo para materiales personalizados) */}
          {!formData.is_shared && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estudiantes con este curso en su portafolio <span className="text-red-500">*</span>
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                {students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.assigned_students.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              @{student.username}
                            </span>
                          </div>
                          {student.section && (
                            <div className="text-xs text-gray-500">
                              📚 {student.section.name}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Total: {students.length} estudiante{students.length !== 1 ? 's' : ''} con este curso
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No hay estudiantes con este curso en su portafolio</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Los estudiantes deben tener este curso asignado a su portafolio para aparecer aquí
                    </p>
                  </div>
                )}
              </div>
              {errors.assigned_students && touched.assigned_students && (
                <p className="mt-1 text-sm text-red-600">{errors.assigned_students}</p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading || isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <span>Agregar Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
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
