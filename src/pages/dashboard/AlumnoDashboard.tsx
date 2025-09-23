import { useQuery } from '@tanstack/react-query'
import { academicApi, assignmentApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { 
  FiBook,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiActivity
} from 'react-icons/fi'
import { PageLoadingState, EmptyState } from '../../components/common'

export function AlumnoDashboard() {
  const { user } = useAuthStore()
  
  // Obtener asignaciones del estudiante
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: () => assignmentApi.getAssignments().then(res => res.data),
    enabled: !!user
  })

  // Obtener temas de la sección del estudiante
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['student-topics', user?.section?.id],
    queryFn: async () => {
      if (!user?.section?.id) return []
      try {
        const response = await academicApi.getTopics()
        return response.data || []
      } catch {
        return []
      }
    },
    enabled: !!user?.section?.id
  })

  const isLoading = assignmentsLoading || topicsLoading

  if (isLoading) {
    return <PageLoadingState message="Cargando dashboard del estudiante..." />
  }

  
  // Obtener asignaciones próximas a vencer (próximos 7 días)
  const upcomingAssignments = assignments?.filter(assignment => {
    if (!assignment.days_until_due) return false
    return assignment.days_until_due <= 7 && assignment.days_until_due >= 0
  }).slice(0, 3) || []

  // Calcular estadísticas
  const completedAssignments = assignments?.filter(a => a.is_completed).length || 0
  const pendingAssignments = assignments?.filter(a => !a.is_completed).length || 0
  const totalTopics = topics?.length || 0

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
        <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
          <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
            Dashboard del Estudiante
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Bienvenido a tu espacio de aprendizaje
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-success-100 rounded-lg flex-shrink-0">
              <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Actividades Completadas</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{completedAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-warning-100 rounded-lg flex-shrink-0">
              <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Actividades Pendientes</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{pendingAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-secondary-100 rounded-lg flex-shrink-0">
              <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Temas Disponibles</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{totalTopics}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mi Sección */}
      <div className="card p-3 sm:p-4">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-base-content">Mi Sección</h2>
        </div>
        
        {user?.section ? (
          <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-base sm:text-lg text-base-content truncate flex-1 min-w-0 mr-2">
                {user.section.course_name || user.section.name}
              </h3>
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success flex-shrink-0">
                <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                Activo
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <FiAward className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-base-content/70 truncate">
                  <span className="font-medium">Sección:</span> {user.section.name}
                </span>
              </div>
              {topics && topics.length > 0 && (
                <div className="flex items-start space-x-2">
                  <FiBook className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-base-content/70 truncate">
                    <span className="font-medium">Temas disponibles:</span> {topics.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState 
            title="No tienes sección asignada"
            description="Contacta a tu profesor o director para que te asigne una sección. Una vez asignado, podrás acceder a tus materiales y actividades."
            icon={<FiUsers className="w-full h-full text-base-content/40" />}
          />
        )}
      </div>

      {/* Actividad Reciente */}
      <div className="card p-3 sm:p-4">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <FiActivity className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-base-content">Actividad Reciente</h2>
        </div>
        
        {assignments && assignments.length > 0 ? (
          <div className="space-y-3">
            {assignments.slice(0, 5).map((assignment) => (
              <div key={assignment.id} className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${assignment.is_completed ? 'bg-success' : 'bg-warning'}`}></div>
                    <span className="text-sm sm:text-base font-medium text-base-content">
                      {assignment.activity_title}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    assignment.is_completed 
                      ? 'bg-success-100 text-success' 
                      : 'bg-warning-100 text-warning'
                  }`}>
                    {assignment.is_completed ? 'Completada' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-base-content/70">
                    {assignment.is_completed && assignment.completed_at 
                      ? `Completada el ${new Date(assignment.completed_at).toLocaleDateString('es-ES')}`
                      : assignment.days_until_due !== undefined 
                        ? `${assignment.days_until_due} días restantes`
                        : 'Sin fecha límite'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No hay actividades recientes"
            description="No tienes actividades asignadas aún. Revisa con tu profesor para obtener nuevas tareas."
            icon={<FiActivity className="w-full h-full text-base-content/40" />}
          />
        )}
      </div>

      {/* Próximas Asignaciones */}
      {upcomingAssignments.length > 0 && (
        <div className="card p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-base-content">Próximas Asignaciones</h2>
          </div>
          
          <div className="space-y-3">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm sm:text-base font-medium text-base-content">
                    {assignment.activity_title}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    (assignment.days_until_due ?? 0) === 0 
                      ? 'bg-error-100 text-error' 
                      : (assignment.days_until_due ?? 0) <= 2 
                        ? 'bg-warning-100 text-warning'
                        : 'bg-info-100 text-info'
                  }`}>
                    {(assignment.days_until_due ?? 0) === 0 
                      ? 'Hoy' 
                      : (assignment.days_until_due ?? 0) === 1 
                        ? 'Mañana'
                        : `En ${assignment.days_until_due ?? 0} días`
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-base-content/70">
                    Vence en {assignment.days_until_due} días
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
