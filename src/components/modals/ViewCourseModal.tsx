// import React from 'react'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Detalles del Curso</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Información básica del curso */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Información General</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nombre</label>
                <p className="mt-1 text-sm text-gray-900">{course.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Código</label>
                <p className="mt-1 text-sm text-gray-900">{course.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Créditos</label>
                <p className="mt-1 text-sm text-gray-900">{course.credits}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Institución</label>
                <p className="mt-1 text-sm text-gray-900">{course.institution_name || 'N/A'}</p>
              </div>
            </div>
            {course.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">Descripción</label>
                <p className="mt-1 text-sm text-gray-900">{course.description}</p>
              </div>
            )}
          </div>

          {/* Secciones asignadas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Secciones Asignadas</h4>
            {courseSections.length > 0 ? (
              <div className="space-y-2">
                {courseSections.map((section) => (
                  <div key={section.id} className="bg-white rounded-md p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{section.name}</p>
                        {section.grade_level && (
                          <p className="text-xs text-gray-500">
                            Grado: {section.grade_level.name} (Nivel {section.grade_level.level})
                          </p>
                        )}
                        {section.term && (
                          <p className="text-xs text-gray-500">
                            Período: {section.term.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay secciones asignadas a este curso.</p>
            )}
          </div>

          {/* Fechas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Fechas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Creado</label>
                <p className="mt-1 text-sm text-gray-900">
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
                <label className="block text-sm font-medium text-gray-500">Última actualización</label>
                <p className="mt-1 text-sm text-gray-900">
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
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
