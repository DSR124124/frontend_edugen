import { useState, useEffect } from 'react'
import { directorApi } from '../../api/endpoints'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => Promise<void>
  loading: boolean
  userType: 'PROFESOR' | 'ALUMNO'
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
  }, [userType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value,
    })
  }

  const handleSectionToggle = (sectionId: number) => {
    setFormData(prev => ({
      ...prev,
      assigned_sections_ids: prev.assigned_sections_ids.includes(sectionId)
        ? prev.assigned_sections_ids.filter(id => id !== sectionId)
        : [...prev.assigned_sections_ids, sectionId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({ ...formData, role: userType })
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
    onClose()
  }

  if (!isOpen) return null

  const isProfessor = userType === 'PROFESOR'
  const title = isProfessor ? 'Crear Profesor' : 'Crear Estudiante'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {title}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Juan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {isProfessor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isProfessor ? 'Secciones Asignadas' : 'Secciones de Matrícula'}
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : `Crear ${isProfessor ? 'Profesor' : 'Estudiante'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
