import { useQuery } from '@tanstack/react-query'
import { academicApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { 
  FiUsers, 
  FiBook, 
  FiCalendar, 
  FiUser, 
  FiPlus,
  FiEye,
  FiAward,
  FiInfo
} from 'react-icons/fi'
import { LoadingState } from '../../components/common'

interface Section {
  id: number
  name: string
  capacity: number
  course_name?: string
  grade_level_name?: string
  term_name?: string
  course?: { name: string }
  grade_level?: { name: string }
  term?: { name: string }
  professors?: Array<{ first_name: string; last_name: string }>
}

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
    return <LoadingState message="Cargando secciones..." />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiUsers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="headline-2xl text-base-content">
                {user?.role === 'ALUMNO' ? 'Mi Sección' : 'Secciones'}
              </h1>
              <p className="text-small text-base-content/70">
                {user?.role === 'DIRECTOR' 
                  ? 'Gestiona las secciones de los cursos' 
                  : user?.role === 'PROFESOR'
                  ? 'Visualiza las secciones asignadas'
                  : 'Visualiza tu sección asignada'
                }
              </p>
            </div>
          </div>
        </div>
        {user?.role === 'DIRECTOR' && (
          <button className="btn-primary flex items-center space-x-2 px-4 py-2">
            <FiPlus className="w-4 h-4" />
            <span>Nueva Sección</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections?.length > 0 ? sections.map((section: Section) => (
          <div key={section.id} className="card hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiUsers className="w-4 h-4 text-primary" />
                </div>
                <h3 className="headline-xl text-base-content">
                  {section.name}
                </h3>
              </div>
              <button className="p-1 text-primary hover:text-primary-focus transition-colors">
                <FiEye className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {user?.role === 'ALUMNO' ? (
                // Para estudiantes, mostrar información de la sección del user
                <>
                  {section.course_name && (
                    <div className="flex items-center space-x-2 text-small text-base-content/70">
                      <FiBook className="w-3 h-3 text-primary" />
                      <span><strong>Curso:</strong> {section.course_name}</span>
                    </div>
                  )}
                  {section.grade_level_name && (
                    <div className="flex items-center space-x-2 text-small text-base-content/70">
                      <FiAward className="w-3 h-3 text-primary" />
                      <span><strong>Grado:</strong> {section.grade_level_name}</span>
                    </div>
                  )}
                  {section.term_name && (
                    <div className="flex items-center space-x-2 text-small text-base-content/70">
                      <FiCalendar className="w-3 h-3 text-primary" />
                      <span><strong>Período:</strong> {section.term_name}</span>
                    </div>
                  )}
                </>
              ) : (
                // Para otros roles, mostrar información completa de la sección
                <>
                  {section.course && (
                    <div className="flex items-center space-x-2 text-small text-base-content/70">
                      <FiBook className="w-3 h-3 text-primary" />
                      <span><strong>Curso:</strong> {section.course.name}</span>
                    </div>
                  )}
                  {section.grade_level && (
                    <div className="flex items-center space-x-2 text-small text-base-content/70">
                      <FiAward className="w-3 h-3 text-primary" />
                      <span><strong>Grado:</strong> {section.grade_level.name}</span>
                    </div>
                  )}
                  {section.term && (
                    <div className="flex items-center space-x-2 text-small text-base-content/70">
                      <FiCalendar className="w-3 h-3 text-primary" />
                      <span><strong>Período:</strong> {section.term.name}</span>
                    </div>
                  )}
                  {section.professors && section.professors.length > 0 && (
                    <div className="flex items-center space-x-2 text-small text-base-content/70">
                      <FiUser className="w-3 h-3 text-primary" />
                      <span><strong>Profesor(es):</strong> {section.professors.map((p) => `${p.first_name} ${p.last_name}`).join(', ')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-base-300">
              <div className="flex items-center justify-between">
                {user?.role !== 'ALUMNO' && (
                  <div className="flex items-center space-x-1 text-extra-small text-base-content/60">
                    <FiUsers className="w-3 h-3" />
                    <span>Capacidad: {section.capacity} estudiantes</span>
                  </div>
                )}
                <button className="btn-secondary text-small px-3 py-1">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full">
            <div className="card text-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-base-200 rounded-full">
                  <FiInfo className="w-6 h-6 text-base-content/40" />
                </div>
                <div>
                  <h3 className="headline-xl text-base-content mb-1">
                    {user?.role === 'ALUMNO' 
                      ? 'No tienes una sección asignada' 
                      : 'No hay secciones disponibles'
                    }
                  </h3>
                  <p className="text-small text-base-content/70">
                    {user?.role === 'ALUMNO' 
                      ? 'Contacta a tu administrador para asignarte una sección'
                      : 'Crea una nueva sección para comenzar'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
