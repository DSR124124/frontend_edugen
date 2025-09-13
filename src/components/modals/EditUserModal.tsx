import { useState, useEffect } from 'react'
import { User, directorApi } from '../../api/endpoints'

interface EditUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (userData: Partial<User>) => void
  loading?: boolean
}

export function EditUserModal({ user, isOpen, onClose, onSave, loading = false }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    role: 'ALUMNO' as 'DIRECTOR' | 'PROFESOR' | 'ALUMNO',
    specialty: '',
    assigned_sections_ids: [] as number[],
  })
  
  const [sections, setSections] = useState<Array<{id: number, name: string, grade_level_name?: string, term_name?: string}>>([])

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        role: user.role || 'ALUMNO',
        specialty: user.specialty || '',
        assigned_sections_ids: user.assigned_sections?.map(s => s.id) || [],
      })
    }
  }, [user])

  // Cargar secciones cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const loadSections = async () => {
        try {
          const response = await directorApi.getSections()
          setSections(response.data)
        } catch (error) {
        }
      }
      loadSections()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

  const specialtyOptions = [
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
    { value: 'OTRO', label: 'Otro' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Editar Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALUMNO">Alumno</option>
              <option value="PROFESOR">Profesor</option>
              <option value="DIRECTOR">Director</option>
            </select>
          </div>

          {formData.role === 'PROFESOR' && (
            <>
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                  Especialidad
                </label>
                <select
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar especialidad</option>
                  {specialtyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secciones Asignadas
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`section-${section.id}`}
                        checked={formData.assigned_sections_ids.includes(section.id)}
                        onChange={() => handleSectionToggle(section.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label 
                        htmlFor={`section-${section.id}`}
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
              </div>
            </>
          )}

          {formData.role === 'ALUMNO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sección Asignada
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      id={`student-section-${section.id}`}
                      checked={formData.assigned_sections_ids.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                      htmlFor={`student-section-${section.id}`}
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
                Selecciona la sección donde estará matriculado el estudiante
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
