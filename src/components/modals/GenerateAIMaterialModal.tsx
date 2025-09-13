import { useState, useEffect } from 'react'

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
  { value: 'LECTURE_NOTES', label: '📝 Apuntes de Clase', description: 'Notas estructuradas del tema' },
  { value: 'EXERCISES', label: '📊 Ejercicios', description: 'Problemas y actividades prácticas' },
  { value: 'PRESENTATION', label: '📽️ Presentación', description: 'Diapositivas para exposición' },
  { value: 'STUDY_GUIDE', label: '📖 Guía de Estudio', description: 'Resumen y conceptos clave' },
  { value: 'ASSESSMENT', label: '📝 Evaluación', description: 'Examen o prueba del tema' },
  { value: 'ACTIVITY', label: '🎯 Actividad', description: 'Ejercicio interactivo o proyecto' }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              🤖 Generar Material con IA
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tema:</span> {topic.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Curso:</span> {topic.course_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading || isGenerating}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nivel Educativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nivel Educativo <span className="text-red-500">*</span>
            </label>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">🏫 Secundaria</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EDUCATIONAL_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`relative flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.educationalLevel === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : errors.educationalLevel && touched.educationalLevel
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="educationalLevel"
                      value={level.value}
                      checked={formData.educationalLevel === level.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{level.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {errors.educationalLevel && touched.educationalLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.educationalLevel}</p>
            )}
          </div>

          {/* Tipo de Recurso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Recurso <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RESOURCE_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.resourceType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : errors.resourceType && touched.resourceType
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="resourceType"
                    value={type.value}
                    checked={formData.resourceType === type.value}
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
            {errors.resourceType && touched.resourceType && (
              <p className="mt-1 text-sm text-red-600">{errors.resourceType}</p>
            )}
          </div>

          {/* Requisitos Adicionales */}
          <div>
            <label htmlFor="additionalRequirements" className="block text-sm font-medium text-gray-700 mb-1">
              Requisitos Adicionales <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="additionalRequirements"
              name="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Describe requisitos específicos, formato deseado, duración, dificultad, etc."
              disabled={loading || isGenerating}
            />
            <p className="mt-1 text-xs text-gray-500">
              Especifica cualquier requisito adicional para personalizar mejor el material generado
            </p>
          </div>

          {/* Información del Proceso */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">
                  🤖 Datos que se enviarán al Chatbot
                </h3>
                <div className="mt-2 text-sm text-purple-700 space-y-1">
                  <p><strong>📚 Tema:</strong> {topic.name}</p>
                  <p><strong>🎓 Curso:</strong> {topic.course_name}</p>
                  <p><strong>📊 Nivel:</strong> {formData.educationalLevel || 'Por seleccionar'}</p>
                  <p><strong>📝 Tipo:</strong> {formData.resourceType || 'Por seleccionar'}</p>
                  {formData.additionalRequirements && (
                    <p><strong>➕ Requisitos:</strong> {formData.additionalRequirements}</p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-600">
                    <strong>Proceso:</strong> Se abrirá el chatbot con estos parámetros preconfigurados para generar el material personalizado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading || isGenerating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              disabled={loading || isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>Generar con IA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
