import { useQuery } from '@tanstack/react-query'
import { academicApi, assignmentApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { 
  Book,
  Users,
  FileText,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  Activity,
  GraduationCap,
  Sparkles,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

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

  // Obtener asignaciones próximas a vencer (próximos 7 días)
  const upcomingAssignments = assignments?.filter(assignment => {
    if (!assignment.days_until_due) return false
    return assignment.days_until_due <= 7 && assignment.days_until_due >= 0
  }).slice(0, 3) || []

  // Calcular estadísticas
  const completedAssignments = assignments?.filter(a => a.is_completed).length || 0
  const pendingAssignments = assignments?.filter(a => !a.is_completed).length || 0
  const totalTopics = topics?.length || 0
  const totalAssignments = assignments?.length || 0

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 min-h-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
          <div className="flex items-center p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>Dashboard del Estudiante</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Tu espacio personal de aprendizaje
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 sm:py-12">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Cargando dashboard</h3>
              <p className="text-xs sm:text-sm text-gray-600">Obteniendo tu información académica...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
        <div className="flex items-center p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Dashboard del Estudiante</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Bienvenido {user?.first_name}, aquí está tu progreso académico
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Completadas</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{completedAssignments}</p>
              <p className="text-xs text-green-600 font-medium">Actividades</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Pendientes</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{pendingAssignments}</p>
              <p className="text-xs text-orange-600 font-medium">Por hacer</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Temas</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalTopics}</p>
              <p className="text-xs text-blue-600 font-medium">Disponibles</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalAssignments}</p>
              <p className="text-xs text-purple-600 font-medium">Actividades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mi Sección */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Mi Sección</h2>
              <p className="text-xs sm:text-sm text-gray-600">Información de tu sección actual</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          {user?.section ? (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate flex-1 min-w-0 mr-2">
                  {user.section.course_name || user.section.name}
                </h3>
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Activo
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Award className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 truncate">
                    <span className="font-medium">Sección:</span> {user.section.name}
                  </span>
                </div>
                {topics && topics.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <BookOpen className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 truncate">
                      <span className="font-medium">Temas disponibles:</span> {topics.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No tienes sección asignada</h3>
                  <p className="text-sm text-gray-600">Contacta a tu profesor o director para que te asigne una sección.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Actividad Reciente</h2>
              <p className="text-xs sm:text-sm text-gray-600">Tus últimas actividades académicas</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          {assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${assignment.is_completed ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {assignment.activity_title}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      assignment.is_completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {assignment.is_completed ? 'Completada' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600">
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
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No hay actividades recientes</h3>
                  <p className="text-sm text-gray-600">No tienes actividades asignadas aún. Revisa con tu profesor para obtener nuevas tareas.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Próximas Asignaciones */}
      {upcomingAssignments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Próximas Asignaciones</h2>
                <p className="text-xs sm:text-sm text-gray-600">Actividades que vencen pronto</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                      {assignment.activity_title}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      (assignment.days_until_due ?? 0) === 0 
                        ? 'bg-red-100 text-red-800' 
                        : (assignment.days_until_due ?? 0) <= 2 
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
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
                    <Calendar className="w-3 h-3 text-orange-600 flex-shrink-0" />
                    <span className="text-xs text-orange-700">
                      Vence en {assignment.days_until_due} días
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
