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
  
  const [sections, setSections] = useState<Array<{
    id: number
    name: string
    grade_level?: { id: number; name: string }
    grade_level_name?: string
    grade_level_id?: number
    term_name?: string
  }>>([])
  const [gradeLevels, setGradeLevels] = useState<Array<{id: number, name: string}>>([])
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('')

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
      
      // Si el usuario tiene secciones asignadas, pre-seleccionar el grado
      // Esto se hará después de cargar los grados en el useEffect siguiente
    }
  }, [user])

  // Cargar grados y secciones cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [sectionsResponse, gradeLevelsResponse] = await Promise.all([
            directorApi.getSections(),
            directorApi.getGradeLevels()
          ])
          setSections(sectionsResponse.data)
          setGradeLevels(gradeLevelsResponse.data)
          
          // Después de cargar los grados, si el usuario tiene secciones, seleccionar el grado
          if (user && user.assigned_sections && user.assigned_sections.length > 0) {
            const firstSection = user.assigned_sections[0]
            if (firstSection.grade_level_name) {
              // Buscar el grado por nombre
              const gradeLevel = gradeLevelsResponse.data.find(gl => gl.name === firstSection.grade_level_name)
              if (gradeLevel) {
                setSelectedGradeLevel(gradeLevel.id.toString())
              }
            }
          }
        } catch {
          // Handle error silently
        }
      }
      loadData()
    } else {
      // Resetear el grado seleccionado cuando se cierra el modal
      setSelectedGradeLevel('')
    }
  }, [isOpen, user])

  // Filtrar secciones por grado seleccionado
  const filteredSections = selectedGradeLevel 
    ? sections.filter(section => {
        // Primero intentar usar grade_level.id (estructura completa)
        if (section.grade_level?.id) {
          return section.grade_level.id.toString() === selectedGradeLevel
        }
        // Si no, usar grade_level_id (estructura plana)
        if (section.grade_level_id) {
          return section.grade_level_id.toString() === selectedGradeLevel
        }
        // Como último recurso, usar grade_level_name
        const gradeLevel = gradeLevels.find(gl => gl.id.toString() === selectedGradeLevel)
        return section.grade_level_name === gradeLevel?.name
      })
    : sections

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

  // Determinar el título del modal según el rol del usuario
  const getModalTitle = () => {
    if (user) {
      if (user.role === 'ALUMNO') return 'Editar Estudiante'
      if (user.role === 'PROFESOR') return 'Editar Profesor'
      if (user.role === 'DIRECTOR') return 'Editar Director'
    }
    return 'Editar Usuario'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
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

          {/* Solo mostrar el campo de rol si es un director (para permitir cambios de rol) */}
          {formData.role === 'DIRECTOR' && (
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
          )}

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

              <Select
                label="Grado"
                name="grade_level"
                value={selectedGradeLevel}
                onChange={(e) => setSelectedGradeLevel(e.target.value)}
                options={[
                  { value: '', label: 'Seleccionar grado' },
                  ...gradeLevels.map(gl => ({ value: gl.id.toString(), label: gl.name }))
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Secciones Asignadas
                </label>
                <div className="max-h-32 overflow-y-auto border border-base-300 rounded-md p-2 bg-base-100">
                  {selectedGradeLevel ? (
                    filteredSections.length > 0 ? (
                      filteredSections.map((section) => (
                        <div key={section.id} className="flex items-start space-x-2 py-2 border-b border-base-300 last:border-b-0">
                          <input
                            type="checkbox"
                            id={`section-${section.id}`}
                            checked={formData.assigned_sections_ids.includes(section.id)}
                            onChange={() => handleSectionToggle(section.id)}
                            className="h-4 w-4 text-primary focus:ring-primary border-base-300 rounded mt-0.5"
                          />
                          <label 
                            htmlFor={`section-${section.id}`}
                            className="flex-1 text-sm text-base-content cursor-pointer"
                          >
                            <div className="font-medium">Sección: {section.name}</div>
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-base-content/70">No hay secciones disponibles para este grado</p>
                    )
                  ) : (
                    <p className="text-sm text-base-content/70">Por favor, selecciona un grado primero</p>
                  )}
                </div>
              </div>
            </>
          )}

          {formData.role === 'ALUMNO' && (
            <>
              <Select
                label="Grado"
                name="grade_level"
                value={selectedGradeLevel}
                onChange={(e) => setSelectedGradeLevel(e.target.value)}
                options={[
                  { value: '', label: 'Seleccionar grado' },
                  ...gradeLevels.map(gl => ({ value: gl.id.toString(), label: gl.name }))
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Sección
                </label>
                <div className="max-h-32 overflow-y-auto border border-base-300 rounded-md p-2 bg-base-100">
                  {selectedGradeLevel ? (
                    filteredSections.length > 0 ? (
                      filteredSections.map((section) => (
                        <div key={section.id} className="flex items-start space-x-2 py-2 border-b border-base-300 last:border-b-0">
                          <input
                            type="checkbox"
                            id={`student-section-${section.id}`}
                            checked={formData.assigned_sections_ids.includes(section.id)}
                            onChange={() => handleSectionToggle(section.id)}
                            className="h-4 w-4 text-primary focus:ring-primary border-base-300 rounded mt-0.5"
                          />
                          <label 
                            htmlFor={`student-section-${section.id}`}
                            className="flex-1 text-sm text-base-content cursor-pointer"
                          >
                            <div className="font-medium">Sección: {section.name}</div>
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-base-content/70">No hay secciones disponibles para este grado</p>
                    )
                  ) : (
                    <p className="text-sm text-base-content/70">Por favor, selecciona un grado primero</p>
                  )}
                </div>
                <p className="text-xs text-base-content/70 mt-1">
                  Selecciona la sección donde estará matriculado el estudiante
                </p>
              </div>
            </>
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
