import { useState, useEffect } from 'react'
import { User, directorApi } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

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
        } catch {
          // Handle error silently
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuario"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
            <Input
              label="Apellido"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Select
            label="Rol"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'ALUMNO', label: 'Alumno' },
              { value: 'PROFESOR', label: 'Profesor' },
              { value: 'DIRECTOR', label: 'Director' }
            ]}
          />

          {formData.role === 'PROFESOR' && (
            <>
              <Select
                label="Especialidad"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Seleccionar especialidad' },
                  ...specialtyOptions
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Secciones Asignadas
                </label>
                <div className="max-h-32 overflow-y-auto border border-base-300 rounded-md p-2 bg-base-100">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`section-${section.id}`}
                        checked={formData.assigned_sections_ids.includes(section.id)}
                        onChange={() => handleSectionToggle(section.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-base-300 rounded"
                      />
                      <label 
                        htmlFor={`section-${section.id}`}
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
              </div>
            </>
          )}

          {formData.role === 'ALUMNO' && (
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                Sección Asignada
              </label>
              <div className="max-h-32 overflow-y-auto border border-base-300 rounded-md p-2 bg-base-100">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      id={`student-section-${section.id}`}
                      checked={formData.assigned_sections_ids.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                      className="h-4 w-4 text-primary focus:ring-primary border-base-300 rounded"
                    />
                    <label 
                      htmlFor={`student-section-${section.id}`}
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
              <p className="text-xs text-base-content/70 mt-1">
                Selecciona la sección donde estará matriculado el estudiante
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
    </Modal>
  )
}
