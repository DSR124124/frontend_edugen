import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { 
  FiFileText, 
  FiTrendingUp, 
  FiMonitor, 
  FiBookOpen, 
  FiEdit3, 
  FiTarget,
  FiUsers,
  FiBook,
  FiCpu,
  FiInfo
} from 'react-icons/fi'

interface GenerateAIMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (params: {
    topic: number
    topicName: string
    courseName: string
    educationalLevel: string
    resourceType: string
    additionalRequirements?: string
  }) => void
  topic: {
    id: number
    name: string
    course_name: string
  } | null
  loading?: boolean
}

interface FormErrors {
  educationalLevel: string
  resourceType: string
}

const EDUCATIONAL_LEVELS = [
  { value: 'SECUNDARIA_1', label: '1° Secundaria', description: 'Primer año' },
  { value: 'SECUNDARIA_2', label: '2° Secundaria', description: 'Segundo año' },
  { value: 'SECUNDARIA_3', label: '3° Secundaria', description: 'Tercer año' },
  { value: 'SECUNDARIA_4', label: '4° Secundaria', description: 'Cuarto año' },
  { value: 'SECUNDARIA_5', label: '5° Secundaria', description: 'Quinto año' }
]

const RESOURCE_TYPES = [
  { 
    value: 'LECTURE_NOTES', 
    label: 'Apuntes de Clase', 
    description: 'Notas estructuradas del tema',
    icon: FiFileText,
    borderColor: '#005CFF',
    bgColor: '#E6F2FF',
    textColor: '#005CFF'
  },
  { 
    value: 'EXERCISES', 
    label: 'Ejercicios', 
    description: 'Problemas y actividades prácticas',
    icon: FiTrendingUp,
    borderColor: '#00BF4A',
    bgColor: '#E8F8F0',
    textColor: '#00BF4A'
  },
  { 
    value: 'PRESENTATION', 
    label: 'Presentación', 
    description: 'Diapositivas para exposición',
    icon: FiMonitor,
    borderColor: '#A142F5',
    bgColor: '#F3E8FF',
    textColor: '#A142F5'
  },
  { 
    value: 'STUDY_GUIDE', 
    label: 'Guía de Estudio', 
    description: 'Resumen y conceptos clave',
    icon: FiBookOpen,
    borderColor: '#F7A325',
    bgColor: '#FEF7E8',
    textColor: '#F7A325'
  },
  { 
    value: 'ASSESSMENT', 
    label: 'Evaluación', 
    description: 'Examen o prueba del tema',
    icon: FiEdit3,
    borderColor: '#FF3A24',
    bgColor: '#FFEBE8',
    textColor: '#FF3A24'
  },
  { 
    value: 'ACTIVITY', 
    label: 'Actividad', 
    description: 'Ejercicio interactivo o proyecto',
    icon: FiTarget,
    borderColor: '#0074EE',
    bgColor: '#E6F2FF',
    textColor: '#0074EE'
  }
]

export function GenerateAIMaterialModal({ 
  isOpen, 
  onClose, 
  onGenerate, 
  topic, 
  loading = false 
}: GenerateAIMaterialModalProps) {
  const [formData, setFormData] = useState({
    educationalLevel: '',
    resourceType: '',
    additionalRequirements: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({
    educationalLevel: '',
    resourceType: ''
  })
  
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        educationalLevel: '',
        resourceType: '',
        additionalRequirements: ''
      })
      setErrors({
        educationalLevel: '',
        resourceType: ''
      })
      setTouched({})
      setIsGenerating(false)
    }
  }, [isOpen])

  const validateField = (fieldName: string, value: string | number): string => {
    switch (fieldName) {
      case 'educationalLevel':
        if (!value) {
          return 'Debe seleccionar un nivel educativo'
        }
        return ''
      case 'resourceType':
        if (!value) {
          return 'Debe seleccionar un tipo de recurso'
        }
        return ''
      default:
        return ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      educationalLevel: validateField('educationalLevel', formData.educationalLevel),
      resourceType: validateField('resourceType', formData.resourceType)
    }

    setErrors(newErrors)
    setTouched({
      educationalLevel: true,
      resourceType: true
    })

    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !topic) {
      return
    }

    setIsGenerating(true)
    try {
      await onGenerate({
        topic: topic.id,
        topicName: topic.name,
        courseName: topic.course_name,
        educationalLevel: formData.educationalLevel,
        resourceType: formData.resourceType,
        additionalRequirements: formData.additionalRequirements.trim() || undefined
      })
      onClose()
    } catch (error) {
      console.error('Error generating AI material:', error)
    } finally {
      setIsGenerating(false)
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
    
    const fieldError = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }))
  }

  const handleClose = () => {
    setFormData({
      educationalLevel: '',
      resourceType: '',
      additionalRequirements: ''
    })
    setErrors({
      educationalLevel: '',
      resourceType: ''
    })
    setTouched({})
    setIsGenerating(false)
    onClose()
  }

  if (!isOpen || !topic) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generar Material con IA"
      size="lg"
    >
      <div className="relative">
      {/* Overlay de carga */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="text-center p-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-primary mb-2">Creando Conversación con IA</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configurando la conversación y enviando requisitos...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
            <p className="text-xs text-gray-500">Esto puede tomar unos segundos, por favor espere...</p>
          </div>
        </div>
      )}
      <div className="mb-3 p-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200/50 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary-100 rounded-md">
            <FiCpu className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-small font-semibold text-primary">Generar Material con IA</h3>
            <p className="text-extra-small text-neutral-600">
              {topic.name} • {topic.course_name}
            </p>
          </div>
        </div>
        
        {/* Indicador de progreso */}
        {isGenerating && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Configurando conversación con IA</p>
                <p className="text-xs text-blue-600">Esto puede tomar unos segundos...</p>
              </div>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nivel Educativo */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <FiUsers className="w-4 h-4 text-primary" />
            <label className="text-small font-semibold text-base-content">
              Nivel Educativo <span className="text-error">*</span>
            </label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
              {EDUCATIONAL_LEVELS.map((level) => {
                const isSelected = formData.educationalLevel === level.value
                const hasError = errors.educationalLevel && touched.educationalLevel
                
                const getLevelStyles = () => {
                  if (isSelected) {
                    return {
                      borderColor: '#005CFF',
                      backgroundColor: '#E6F2FF'
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
                    key={level.value}
                    className={`relative flex flex-col p-2 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary/20' : ''
                    }`}
                    style={getLevelStyles()}
                  >
                    <input
                      type="radio"
                      name="educationalLevel"
                      value={level.value}
                      checked={isSelected}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className={`text-small font-semibold transition-colors duration-200 ${
                        isSelected ? 'text-primary' : 'text-base-content'
                      }`}>
                        {level.label}
                      </div>
                      <div className="text-extra-small text-base-content/60">{level.description}</div>
                      {isSelected && (
                        <div className="mt-1 animate-bounce">
                          <div className="w-1.5 h-1.5 mx-auto rounded-full bg-primary"></div>
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>

          {errors.educationalLevel && touched.educationalLevel && (
            <p className="mt-1 text-sm text-error">{errors.educationalLevel}</p>
          )}
        </div>

        {/* Tipo de Recurso */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <FiTarget className="w-4 h-4 text-primary" />
            <label className="text-small font-semibold text-base-content">
              Tipo de Recurso <span className="text-error">*</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {RESOURCE_TYPES.map((type) => {
              const isSelected = formData.resourceType === type.value
              const hasError = errors.resourceType && touched.resourceType
              
              const getResourceStyles = () => {
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
                  className={`relative flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary/20' : ''
                  }`}
                  style={getResourceStyles()}
                >
                  <input
                    type="radio"
                    name="resourceType"
                    value={type.value}
                    checked={isSelected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div 
                      className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected ? type.bgColor : '#F2F2F2'
                      }}
                    >
                      <type.icon 
                        className={`w-4 h-4 transition-all duration-300 ${
                          isSelected ? 'animate-bounce' : ''
                        }`}
                        style={{ color: isSelected ? type.textColor : '#6B7280' }}
                      />
                    </div>
                    <div className={`text-small font-semibold transition-colors duration-200 ${
                      isSelected ? 'text-primary' : 'text-base-content'
                    }`}>
                      {type.label}
                    </div>
                    <div className="text-extra-small text-base-content/60 leading-tight">{type.description}</div>
                    {isSelected && (
                      <div className="mt-1 animate-bounce">
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
          {errors.resourceType && touched.resourceType && (
            <p className="mt-1 text-extra-small text-error">{errors.resourceType}</p>
          )}
        </div>

        {/* Requisitos Adicionales */}
        <Textarea
          label="Requisitos Adicionales (opcional)"
          value={formData.additionalRequirements}
          onChange={handleChange}
          name="additionalRequirements"
          rows={3}
          placeholder="Describe requisitos específicos, formato deseado, duración, dificultad, etc."
          helperText="Especifica cualquier requisito adicional para personalizar mejor el material generado"
          disabled={loading || isGenerating}
        />

        {/* Información del Proceso */}
        <div className="bg-gradient-to-r from-primary-50/50 to-secondary-50/50 border border-primary-200/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-primary-100 rounded-md">
              <FiInfo className="h-3 w-3 text-primary animate-pulse" />
            </div>
            <h3 className="text-small font-semibold text-primary">
              Resumen de Generación
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 p-1.5 bg-white/50 rounded-md">
              <FiBook className="w-3 h-3 text-primary" />
              <div>
                <p className="text-extra-small text-neutral-600">Tema</p>
                <p className="text-small font-medium text-base-content">{topic.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-1.5 bg-white/50 rounded-md">
              <FiUsers className="w-3 h-3 text-primary" />
              <div>
                <p className="text-extra-small text-neutral-600">Curso</p>
                <p className="text-small font-medium text-base-content">{topic.course_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-1.5 bg-white/50 rounded-md">
              <FiTrendingUp className="w-3 h-3 text-primary" />
              <div>
                <p className="text-extra-small text-neutral-600">Nivel</p>
                <p className="text-small font-medium text-base-content">
                  {formData.educationalLevel ? formData.educationalLevel.replace('_', ' ') : 'Por seleccionar'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-1.5 bg-white/50 rounded-md">
              <FiFileText className="w-3 h-3 text-primary" />
              <div>
                <p className="text-extra-small text-neutral-600">Tipo</p>
                <p className="text-small font-medium text-base-content">
                  {formData.resourceType ? RESOURCE_TYPES.find(t => t.value === formData.resourceType)?.label : 'Por seleccionar'}
                </p>
              </div>
            </div>
          </div>
          
          {formData.additionalRequirements && (
            <div className="mt-2 p-1.5 bg-white/50 rounded-md">
              <div className="flex items-center space-x-2">
                <FiTarget className="w-3 h-3 text-primary" />
                <div>
                  <p className="text-extra-small text-neutral-600">Requisitos Adicionales</p>
                  <p className="text-small font-medium text-base-content">{formData.additionalRequirements}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={loading || isGenerating}
            className="px-4 py-2 transition-all duration-200 hover:scale-105"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isGenerating}
            disabled={loading || isGenerating}
            className="px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Creando conversación...</span>
                  <span className="text-xs opacity-75">Enviando requisitos a la IA</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <FiCpu className="w-4 h-4 animate-pulse" />
                <span>Generar con IA</span>
              </div>
            )}
          </Button>
        </div>
      </form>
      </div>
    </Modal>
  )
}
