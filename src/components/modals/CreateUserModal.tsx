import { useState, useEffect } from 'react'
import { directorApi } from '../../api/endpoints'
import { VALIDATION } from '../../utils/constants'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: {
    username: string
    email: string
    first_name: string
    last_name: string
    password: string
    role: 'PROFESOR' | 'ALUMNO'
    assigned_sections_ids: number[]
    specialty?: string
  }) => Promise<void>
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
        } catch {
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
  const validateField = (name: string, value: string | number[]): string => {
    switch (name) {
      case 'username':
        if (typeof value !== 'string' || !value || value.trim() === '') {
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
        if (typeof value !== 'string' || !value || value.trim() === '') {
          return 'El correo electrónico es obligatorio'
        }
        
        // Validación de longitud máxima
        if (value.length > 254) {
          return 'El correo electrónico no puede exceder 254 caracteres'
        }
        
        // Usar la función de validación específica
        {
          const emailError = validateEmailFormat(value)
          if (emailError) {
            return emailError
          }
        }
        
        return ''

      case 'first_name':
        if (typeof value !== 'string' || !value || value.trim() === '') {
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
        if (typeof value !== 'string' || !value || value.trim() === '') {
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
        if (typeof value !== 'string' || !value || value.trim() === '') {
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
        if (userType === 'PROFESOR' && (typeof value !== 'string' || !value || value.trim() === '')) {
          return 'La especialidad es obligatoria para profesores'
        }
        return ''

      case 'assigned_sections_ids':
        if (!Array.isArray(value) || value.length === 0) {
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
      const error = validateField(name, newValue as string | number[])
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
      
    } catch (error: unknown) {
      console.error('Error creating user:', error)
      
      // Manejar errores del servidor (duplicados detectados en el backend)
      if (error && typeof error === 'object' && 'response' in error) {
        const serverError = error as { response?: { data?: { username?: string; email?: string } } }
        const serverErrors: FormErrors = {}
        
        if (serverError.response?.data?.username) {
          serverErrors.duplicate_username = 'Este nombre de usuario ya está registrado en el sistema'
        }
        if (serverError.response?.data?.email) {
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

  const isProfessor = userType === 'PROFESOR'
  const title = isProfessor ? 'Crear Profesor' : 'Crear Estudiante'

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
    >
      {isSuccess ? (
        // Pantalla de éxito
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-4">
            <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">
            ¡Registro Exitoso!
          </h3>
          <p className="text-sm text-base-content/70 mb-4">
            {successMessage}
          </p>
          <div className="bg-success-50 border border-success-200 rounded-md p-3 mb-4">
            <p className="text-sm text-success">
              El {isProfessor ? 'profesor' : 'estudiante'} ha sido agregado a la lista y ya está disponible en el sistema.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="inline-flex items-center text-sm text-base-content/70">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-base-content/70" fill="none" viewBox="0 0 24 24">
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
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="usuario123"
            required
            error={errors.username || errors.duplicate_username}
            helperText={errors.duplicate_username}
          />

          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="profesor@institucion.edu"
            required
            error={errors.email || errors.duplicate_email}
            helperText={errors.duplicate_email || (!errors.email && !errors.duplicate_email && formData.email ? 'Formato de correo válido' : undefined)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Juan"
              required
              error={errors.first_name}
            />
            <Input
              label="Apellido"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Pérez"
              required
              error={errors.last_name}
            />
          </div>

          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="••••••••"
            required
            error={errors.password}
            helperText="Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número"
          />

          {isProfessor && (
            <Select
              label="Especialidad"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.specialty}
              options={[
                { value: '', label: 'Seleccionar especialidad' },
                { value: 'MATEMATICAS', label: 'Matemáticas' },
                { value: 'CIENCIAS', label: 'Ciencias Naturales' },
                { value: 'LENGUAJE', label: 'Lenguaje y Literatura' },
                { value: 'HISTORIA', label: 'Historia y Geografía' },
                { value: 'EDUCACION_FISICA', label: 'Educación Física' },
                { value: 'ARTES', label: 'Artes' },
                { value: 'MUSICA', label: 'Música' },
                { value: 'TECNOLOGIA', label: 'Tecnología' },
                { value: 'INGLES', label: 'Inglés' },
                { value: 'FRANCES', label: 'Francés' },
                { value: 'FILOSOFIA', label: 'Filosofía' },
                { value: 'PSICOLOGIA', label: 'Psicología' },
                { value: 'ADMINISTRACION', label: 'Administración' },
                { value: 'CONTABILIDAD', label: 'Contabilidad' },
                { value: 'INFORMATICA', label: 'Informática' },
                { value: 'OTRO', label: 'Otro' }
              ]}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              {isProfessor ? 'Secciones Asignadas' : 'Secciones de Matrícula'} <span className="text-error">*</span>
            </label>
            <div className={`max-h-32 overflow-y-auto border rounded-md p-2 bg-base-100 ${
              errors.assigned_sections_ids 
                ? 'border-error' 
                : 'border-base-300'
            }`}>
              {sections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id={`create-section-${section.id}`}
                    checked={formData.assigned_sections_ids.includes(section.id)}
                    onChange={() => handleSectionToggle(section.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-base-300 rounded"
                  />
                  <label 
                    htmlFor={`create-section-${section.id}`}
                    className="text-sm text-base-content cursor-pointer"
                  >
                    {section.name} ({section.grade_level_name || 'Sin grado'})
                  </label>
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-sm text-base-content/70">No hay secciones disponibles</p>
              )}
            </div>
            {errors.assigned_sections_ids && (
              <p className="mt-1 text-sm text-error">{errors.assigned_sections_ids}</p>
            )}
            <p className="text-xs text-base-content/70 mt-1">
              {isProfessor 
                ? 'Selecciona las secciones donde impartirá clases'
                : 'Selecciona las secciones donde estará matriculado'
              }
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || isSubmitting || isCheckingDuplicates}
              loading={loading || isSubmitting}
            >
              {loading || isSubmitting 
                ? 'Creando...' 
                : isCheckingDuplicates 
                  ? 'Verificando...' 
                  : `Crear ${isProfessor ? 'Profesor' : 'Estudiante'}`
              }
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
