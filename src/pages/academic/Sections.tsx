import { useQuery } from '@tanstack/react-query'
import { academicApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'

export function Sections() {
  const { user } = useAuthStore()
  
  // Para estudiantes, usar la sección que viene en el objeto user
  const studentSection = user?.role === 'ALUMNO' ? user?.section : null
  const loadingStudentSection = false // No necesita loading porque viene del user

  // Para directores y profesores, obtener todas las secciones
  const { data: allSections, isLoading: loadingAllSections } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicApi.getSections().then(res => res.data),
    enabled: user?.role !== 'ALUMNO'
  })

  const isLoading = user?.role === 'ALUMNO' ? loadingStudentSection : loadingAllSections
  const sections = user?.role === 'ALUMNO' ? (studentSection ? [studentSection] : []) : allSections?.results

  if (isLoading) {
    return <div className="text-center py-8">Cargando secciones...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-base-content)' }}>
            {user?.role === 'ALUMNO' ? 'Mi Sección' : 'Secciones'}
          </h1>
          <p style={{ color: 'var(--color-base-content)' }}>
            {user?.role === 'DIRECTOR' 
              ? 'Gestiona las secciones de los cursos' 
              : user?.role === 'PROFESOR'
              ? 'Visualiza las secciones asignadas'
              : 'Visualiza tu sección asignada'
            }
          </p>
        </div>
        {user?.role === 'DIRECTOR' && (
          <button 
            className="px-4 py-2 rounded-md transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-content)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-focus)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
          >
            Nueva Sección
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y" style={{ borderColor: 'var(--color-base-300)' }}>
          {sections?.length > 0 ? sections.map((section: any) => (
            <li key={section.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium" style={{ color: 'var(--color-base-content)' }}>
                    {section.name}
                  </h3>
                  {user?.role === 'ALUMNO' ? (
                    // Para estudiantes, mostrar información de la sección del user
                    <>
                      {section.course_name && (
                        <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                          <span className="font-medium">Curso:</span> {section.course_name}
                        </p>
                      )}
                      {section.grade_level_name && (
                        <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                          <span className="font-medium">Grado:</span> {section.grade_level_name}
                        </p>
                      )}
                      {section.term_name && (
                        <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                          <span className="font-medium">Período:</span> {section.term_name}
                        </p>
                      )}
                    </>
                  ) : (
                    // Para otros roles, mostrar información completa de la sección
                    <>
                      {section.course && (
                        <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                          <span className="font-medium">Curso:</span> {section.course.name}
                        </p>
                      )}
                      {section.grade_level && (
                        <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                          <span className="font-medium">Grado:</span> {section.grade_level.name}
                        </p>
                      )}
                      {section.term && (
                        <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                          <span className="font-medium">Período:</span> {section.term.name}
                        </p>
                      )}
                      {section.professors && section.professors.length > 0 && (
                        <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                          <span className="font-medium">Profesor(es):</span> {section.professors.map((p: any) => `${p.first_name} ${p.last_name}`).join(', ')}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {user?.role !== 'ALUMNO' && (
                    <span className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                      Capacidad: {section.capacity} estudiantes
                    </span>
                  )}
                  <button 
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-focus)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </li>
          )) : (
            <li className="px-6 py-8 text-center" style={{ color: 'var(--color-base-content)' }}>
              {user?.role === 'ALUMNO' 
                ? 'No tienes una sección asignada' 
                : 'No hay secciones disponibles'
              }
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
