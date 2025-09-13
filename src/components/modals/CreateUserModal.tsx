import { useState, useEffect } from 'react'
import { directorApi } from '../../api/endpoints'
import { VALIDATION } from '../../utils/constants'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => Promise<void>
  loading: boolean
  userType: 'PROFESOR' | 'ALUMNO'
}

interface FormErrors {
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  password?: string
  specialty?: string
  assigned_sections_ids?: string
  general?: string
  duplicate_username?: string
  duplicate_email?: string
}

export function CreateUserModal({ 
  isOpen, 
  onClose, 
  onSave, 
  loading,
  userType
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: userType,
    assigned_sections_ids: [] as number[],
    specialty: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [sections, setSections] = useState<Array<{
    id: number
    name: string
    grade_level_name?: string
    professor_name?: string
    term_name?: string
  }>>([])

  // Cargar secciones disponibles
  useEffect(() => {
    if (isOpen) {
      const loadSections = async () => {
        try {
          const response = await directorApi.getSections()
          setSections(response.data)
        } catch (error) {
          // Error loading sections
        }
      }
      loadSections()
    }
  }, [isOpen])

  // Reset form when userType changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      role: userType,
      assigned_sections_ids: [],
      specialty: userType === 'PROFESOR' ? prev.specialty : ''
    }))
    setErrors({})
    setTouched({})
  }, [userType])

  // Función para verificar duplicados
  const checkForDuplicates = async (username: string, email: string): Promise<{username?: string, email?: string}> => {
    try {
      setIsCheckingDuplicates(true)
      
      // Obtener lista de usuarios existentes
      const response = await directorApi.getUsers()
      const existingUsers = response.data
      
      const duplicates: {username?: string, email?: string} = {}
      
      // Verificar username duplicado
      const usernameExists = existingUsers.some(user => 
        user.username.toLowerCase() === username.toLowerCase()
      )
      if (usernameExists) {
        duplicates.username = 'Este nombre de usuario ya está registrado en el sistema'
      }
      
      // Verificar email duplicado
      const emailExists = existingUsers.some(user => 
        user.email.toLowerCase() === email.toLowerCase()
      )
      if (emailExists) {
        duplicates.email = 'Este correo electrónico ya está registrado en el sistema'
      }
      
      return duplicates
    } catch (error) {
      console.error('Error checking duplicates:', error)
      return {}
    } finally {
      setIsCheckingDuplicates(false)
    }
  }

  // Función específica para validar email con casos comunes de error
  const validateEmailFormat = (email: string): string => {
    const trimmedEmail = email.trim()
    
    // Casos comunes de error con mensajes específicos
    if (trimmedEmail.includes(' ')) {
      return 'El correo electrónico no puede contener espacios'
    }
    
    if (!trimmedEmail.includes('@')) {
      return 'El correo electrónico debe contener el símbolo @'
    }
    
    if (trimmedEmail.indexOf('@') !== trimmedEmail.lastIndexOf('@')) {
      return 'El correo electrónico solo puede contener un símbolo @'
    }
    
    if (trimmedEmail.startsWith('@')) {
      return 'El correo electrónico no puede comenzar con @'
    }
    
    if (trimmedEmail.endsWith('@')) {
      return 'El correo electrónico no puede terminar con @'
    }
    
    const [localPart, domainPart] = trimmedEmail.split('@')
    
    if (!localPart || localPart.length === 0) {
      return 'El correo electrónico debe tener una parte local antes del @'
    }
    
    if (!domainPart || domainPart.length === 0) {
      return 'El correo electrónico debe tener un dominio después del @'
    }
    
    if (!domainPart.includes('.')) {
      return 'El dominio del correo electrónico debe contener al menos un punto'
    }
    
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
      return 'El dominio no puede comenzar o terminar con punto'
    }
    
    if (domainPart.includes('..')) {
      return 'El dominio no puede contener puntos consecutivos'
    }
    
    // Validación con regex más estricta
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(trimmedEmail)) {
      return 'El formato del correo electrónico no es válido. Ejemplo: usuario@ejemplo.com'
    }
    
    return ''
  }

  // Función de validación de campos
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'username':
        if (!value || value.trim() === '') {
          return 'El nombre de usuario es obligatorio'
        }
        if (value.length < VALIDATION.USERNAME_MIN_LENGTH) {
          return `El nombre de usuario debe tener al menos ${VALIDATION.USERNAME_MIN_LENGTH} caracteres`
        }
        if (value.length > VALIDATION.USERNAME_MAX_LENGTH) {
          return `El nombre de usuario no puede exceder ${VALIDATION.USERNAME_MAX_LENGTH} caracteres`
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return 'El nombre de usuario solo puede contener letras, números y guiones bajos'
        }
        return ''

      case 'email':
        if (!value || value.trim() === '') {
          return 'El correo electrónico es obligatorio'
        }
        
        // Validación de longitud máxima
        if (value.length > 254) {
          return 'El correo electrónico no puede exceder 254 caracteres'
        }
        
        // Usar la función de validación específica
        const emailError = validateEmailFormat(value)
        if (emailError) {
          return emailError
        }
        
        return ''

      case 'first_name':
        if (!value || value.trim() === '') {
          return 'El nombre es obligatorio'
        }
        if (value.length < VALIDATION.NAME_MIN_LENGTH) {
          return `El nombre debe tener al menos ${VALIDATION.NAME_MIN_LENGTH} caracteres`
        }
        if (value.length > VALIDATION.NAME_MAX_LENGTH) {
          return `El nombre no puede exceder ${VALIDATION.NAME_MAX_LENGTH} caracteres`
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'El nombre solo puede contener letras y espacios'
        }
        return ''

      case 'last_name':
        if (!value || value.trim() === '') {
          return 'El apellido es obligatorio'
        }
        if (value.length < VALIDATION.NAME_MIN_LENGTH) {
          return `El apellido debe tener al menos ${VALIDATION.NAME_MIN_LENGTH} caracteres`
        }
        if (value.length > VALIDATION.NAME_MAX_LENGTH) {
          return `El apellido no puede exceder ${VALIDATION.NAME_MAX_LENGTH} caracteres`
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'El apellido solo puede contener letras y espacios'
        }
        return ''

      case 'password':
        if (!value || value.trim() === '') {
          return 'La contraseña es obligatoria'
        }
        if (value.length < VALIDATION.PASSWORD_MIN_LENGTH) {
          return `La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`
        }
        if (value.length > VALIDATION.PASSWORD_MAX_LENGTH) {
          return `La contraseña no puede exceder ${VALIDATION.PASSWORD_MAX_LENGTH} caracteres`
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'
        }
        return ''

      case 'specialty':
        if (userType === 'PROFESOR' && (!value || value.trim() === '')) {
          return 'La especialidad es obligatoria para profesores'
        }
        return ''

      case 'assigned_sections_ids':
        if (value.length === 0) {
          return 'Debe seleccionar al menos una sección'
        }
        return ''

      default:
        return ''
    }
  }

  // Validar todo el formulario
  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {}
    let isValid = true

    // Validar campos obligatorios
    const requiredFields = ['username', 'email', 'first_name', 'last_name', 'password']
    if (userType === 'PROFESOR') {
      requiredFields.push('specialty')
    }

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) {
        newErrors[field as keyof FormErrors] = error
        isValid = false
      }
    })

    // Validar secciones
    const sectionsError = validateField('assigned_sections_ids', formData.assigned_sections_ids)
    if (sectionsError) {
      newErrors.assigned_sections_ids = sectionsError
      isValid = false
    }

    // Si hay errores de validación básica, no verificar duplicados
    if (!isValid) {
      setErrors(newErrors)
      return false
    }

    // Verificar duplicados solo si la validación básica pasó
    const duplicates = await checkForDuplicates(formData.username, formData.email)
    if (duplicates.username) {
      newErrors.duplicate_username = duplicates.username
      isValid = false
    }
    if (duplicates.email) {
      newErrors.duplicate_email = duplicates.email
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newValue = e.target.type === 'number' ? parseInt(value) : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }))

    // Marcar el campo como tocado
    setTouched(prev => ({ ...prev, [name]: true }))

    // Limpiar errores de duplicados cuando el usuario cambie username o email
    if (name === 'username' || name === 'email') {
      setErrors(prev => ({
        ...prev,
        [`duplicate_${name}`]: undefined
      }))
    }

    // Validar el campo en tiempo real si ya fue tocado
    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSectionToggle = (sectionId: number) => {
    const newSections = formData.assigned_sections_ids.includes(sectionId)
      ? formData.assigned_sections_ids.filter(id => id !== sectionId)
      : [...formData.assigned_sections_ids, sectionId]

    setFormData(prev => ({
      ...prev,
      assigned_sections_ids: newSections
    }))

    // Marcar secciones como tocadas
    setTouched(prev => ({ ...prev, assigned_sections_ids: true }))

    // Validar secciones
    const error = validateField('assigned_sections_ids', newSections)
    setErrors(prev => ({
      ...prev,
      assigned_sections_ids: error
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos los campos como tocados
    const allTouched = {
      username: true,
      email: true,
      first_name: true,
      last_name: true,
      password: true,
      specialty: true,
      assigned_sections_ids: true
    }
    setTouched(allTouched)

    // Validar formulario completo (incluyendo verificación de duplicados)
    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({ ...formData, role: userType })
      
      // Mostrar estado de éxito
      setIsSuccess(true)
      setSuccessMessage(
        userType === 'PROFESOR' 
          ? `¡Profesor ${formData.first_name} ${formData.last_name} registrado exitosamente!`
          : `¡Estudiante ${formData.first_name} ${formData.last_name} registrado exitosamente!`
      )
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        handleClose()
      }, 2000)
      
    } catch (error: any) {
      console.error('Error creating user:', error)
      
      // Manejar errores del servidor (duplicados detectados en el backend)
      if (error.response?.data) {
        const serverErrors: FormErrors = {}
        
        if (error.response.data.username) {
          serverErrors.duplicate_username = 'Este nombre de usuario ya está registrado en el sistema'
        }
        if (error.response.data.email) {
          serverErrors.duplicate_email = 'Este correo electrónico ya está registrado en el sistema'
        }
        
        if (Object.keys(serverErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...serverErrors }))
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      role: userType,
      assigned_sections_ids: [],
      specialty: ''
    })
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setIsSuccess(false)
    setSuccessMessage('')
    onClose()
  }

  if (!isOpen) return null

  const isProfessor = userType === 'PROFESOR'
  const title = isProfessor ? 'Crear Profesor' : 'Crear Estudiante'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          // Pantalla de éxito
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Registro Exitoso!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {successMessage}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <p className="text-sm text-green-800">
                El {isProfessor ? 'profesor' : 'estudiante'} ha sido agregado a la lista y ya está disponible en el sistema.
              </p>
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
            <h2 className="text-xl font-bold mb-4">
              {title}
            </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.username || errors.duplicate_username
                  ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="usuario123"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
            {errors.duplicate_username && (
              <div className="mt-1 flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 font-medium">{errors.duplicate_username}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email || errors.duplicate_email
                  ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="profesor@institucion.edu"
            />
            {errors.email && (
              <div className="mt-1 flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{errors.email}</p>
              </div>
            )}
            {errors.duplicate_email && (
              <div className="mt-1 flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 font-medium">{errors.duplicate_email}</p>
              </div>
            )}
            {!errors.email && !errors.duplicate_email && formData.email && (
              <div className="mt-1 flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-600">Formato de correo válido</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.first_name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Juan"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.last_name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Pérez"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número
            </p>
          </div>

          {isProfessor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad <span className="text-red-500">*</span>
              </label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.specialty 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Seleccionar especialidad</option>
                <option value="MATEMATICAS">Matemáticas</option>
                <option value="CIENCIAS">Ciencias Naturales</option>
                <option value="LENGUAJE">Lenguaje y Literatura</option>
                <option value="HISTORIA">Historia y Geografía</option>
                <option value="EDUCACION_FISICA">Educación Física</option>
                <option value="ARTES">Artes</option>
                <option value="MUSICA">Música</option>
                <option value="TECNOLOGIA">Tecnología</option>
                <option value="INGLES">Inglés</option>
                <option value="FRANCES">Francés</option>
                <option value="FILOSOFIA">Filosofía</option>
                <option value="PSICOLOGIA">Psicología</option>
                <option value="ADMINISTRACION">Administración</option>
                <option value="CONTABILIDAD">Contabilidad</option>
                <option value="INFORMATICA">Informática</option>
                <option value="OTRO">Otro</option>
              </select>
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-600">{errors.specialty}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isProfessor ? 'Secciones Asignadas' : 'Secciones de Matrícula'} <span className="text-red-500">*</span>
            </label>
            <div className={`max-h-32 overflow-y-auto border rounded-md p-2 ${
              errors.assigned_sections_ids 
                ? 'border-red-500' 
                : 'border-gray-300'
            }`}>
              {sections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id={`create-section-${section.id}`}
                    checked={formData.assigned_sections_ids.includes(section.id)}
                    onChange={() => handleSectionToggle(section.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`create-section-${section.id}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {section.name} ({section.grade_level_name || 'Sin grado'})
                  </label>
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-sm text-gray-500">No hay secciones disponibles</p>
              )}
            </div>
            {errors.assigned_sections_ids && (
              <p className="mt-1 text-sm text-red-600">{errors.assigned_sections_ids}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isProfessor 
                ? 'Selecciona las secciones donde impartirá clases'
                : 'Selecciona las secciones donde estará matriculado'
              }
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting || isCheckingDuplicates}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading || isSubmitting 
                ? 'Creando...' 
                : isCheckingDuplicates 
                  ? 'Verificando...' 
                  : `Crear ${isProfessor ? 'Profesor' : 'Estudiante'}`
              }
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  )
}
