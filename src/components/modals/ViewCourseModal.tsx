import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface Course {
  id: number
  name: string
  code: string
  description: string
  credits: number
  institution: number
  institution_name?: string
  created_at: string
  updated_at: string
}

interface Section {
  id: number
  name: string
  course?: {
    id: number
    name: string
    code: string
  }
  grade_level?: {
    id: number
    name: string
    level: number
  }
  term?: {
    id: number
    name: string
    is_active: boolean
  }
}

interface ViewCourseModalProps {
  isOpen: boolean
  onClose: () => void
  course: Course | null
  sections: Section[]
}

export function ViewCourseModal({
  isOpen,
  onClose,
  course,
  sections
}: ViewCourseModalProps) {
  if (!isOpen || !course) return null

  // Filtrar secciones que pertenecen a este curso
  const courseSections = sections.filter(section => section.course?.id === course.id)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Curso"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información básica del curso */}
        <div className="bg-base-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-base-content mb-3">Información General</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-base-content/70">Nombre</label>
              <p className="mt-1 text-sm text-base-content">{course.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content/70">Código</label>
              <p className="mt-1 text-sm text-base-content font-mono bg-base-300 px-2 py-1 rounded">
                {course.code}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content/70">Créditos</label>
              <p className="mt-1 text-sm text-base-content">{course.credits}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content/70">Institución</label>
              <p className="mt-1 text-sm text-base-content">{course.institution_name || 'N/A'}</p>
            </div>
          </div>
          {course.description && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-base-content/70">Descripción</label>
              <p className="mt-1 text-sm text-base-content">{course.description}</p>
            </div>
          )}
        </div>

        {/* Secciones asignadas */}
        <div className="bg-base-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-base-content mb-3">Secciones Asignadas</h4>
          {courseSections.length > 0 ? (
            <div className="space-y-2">
              {courseSections.map((section) => (
                <div key={section.id} className="bg-base-100 rounded-md p-3 border border-base-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-base-content">{section.name}</p>
                      {section.grade_level && (
                        <p className="text-xs text-base-content/70">
                          Grado: {section.grade_level.name} (Nivel {section.grade_level.level})
                        </p>
                      )}
                      {section.term && (
                        <p className="text-xs text-base-content/70">
                          Período: {section.term.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-content/70">No hay secciones asignadas a este curso.</p>
          )}
        </div>

        {/* Fechas */}
        <div className="bg-base-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-base-content mb-3">Fechas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-base-content/70">Creado</label>
              <p className="mt-1 text-sm text-base-content">
                {new Date(course.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content/70">Última actualización</label>
              <p className="mt-1 text-sm text-base-content">
                {new Date(course.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
