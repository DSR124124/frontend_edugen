import { useQuery } from '@tanstack/react-query'
import { academicApi, assignmentApi, portfolioApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { useMyMaterialsWithAnalytics } from '../../hooks/useMaterialAnalytics'
import { 
  Users,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  GraduationCap,
  Sparkles,
  BookOpen,
  Target,
  Book,
  RefreshCw
} from 'lucide-react'

export function AlumnoDashboard() {
  const { user } = useAuthStore()
  
  // Configuración de auto-refresh: actualizar cada 30 segundos
  const refetchInterval = 30000 // 30 segundos
  
  // Obtener asignaciones del estudiante (con auto-refresh)
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: () => assignmentApi.getAssignments().then(res => res.data),
    enabled: !!user,
    refetchInterval,
    refetchIntervalInBackground: true
  })

  // Obtener portafolios del estudiante para derivar cursos (con auto-refresh)
  const { data: myPortfolios = [], isLoading: loadingPortfolios } = useQuery({
    queryKey: ['my-portfolios'],
    queryFn: () => portfolioApi.getPortfolios().then(res => res.data as any[]),
    enabled: !!user?.section,
    refetchInterval,
    refetchIntervalInBackground: true
  })

  // Obtener información completa de los cursos (con auto-refresh)
  const { data: allCourses } = useQuery({
    queryKey: ['student-courses'],
    queryFn: () => academicApi.getCourses().then(res => res.data),
    enabled: !!user?.section,
    refetchInterval,
    refetchIntervalInBackground: true
  })

  // Obtener materiales con analytics (con auto-refresh)
  const { data: materialsWithAnalytics } = useMyMaterialsWithAnalytics()

  // Obtener temas de la sección del estudiante (con auto-refresh)
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
    enabled: !!user?.section?.id,
    refetchInterval,
    refetchIntervalInBackground: true
  })

  const isLoading = assignmentsLoading || topicsLoading || loadingPortfolios

  // Derivar cursos desde portafolios
  const courses = (() => {
    const courseMap = new Map<number, any>()
    
    for (const p of myPortfolios) {
      for (const pc of (p.courses || [])) {
        if (!courseMap.has(pc.course)) {
          const fullCourse = allCourses?.results?.find((c: any) => c.id === pc.course)
          courseMap.set(pc.course, {
            id: pc.course,
            name: pc.course_name,
            code: pc.course_code,
            description: fullCourse?.description || undefined,
            section_id: p.section,
            professor_name: fullCourse?.professor_name || undefined,
          })
        }
      }
    }
    
    // Calcular progreso para cada curso
    if (materialsWithAnalytics) {
      for (const [courseId, course] of courseMap.entries()) {
        const courseMaterials = materialsWithAnalytics.filter((m: any) => 
          m.course_id === courseId
        )
        const completedMaterials = courseMaterials.filter((m: any) => 
          m.analytics?.completion_rate >= 100
        )
        const progress = courseMaterials.length > 0 
          ? Math.round((completedMaterials.length / courseMaterials.length) * 100)
          : 0
        
        course.progress = progress
        course.total_materials = courseMaterials.length
        course.completed_materials = completedMaterials.length
      }
    }
    
    return Array.from(courseMap.values())
  })()

  // Obtener todas las actividades pendientes
  const pendingAssignmentsList = assignments?.filter(a => !a.is_completed) || []

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
    <div className="space-y-3 sm:space-y-4 min-h-0" data-tour="student-dashboard">
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
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-xs text-gray-500">Actualización automática (30s)</span>
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 sm:mb-6">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Mi Sección</h2>
              <p className="text-xs sm:text-sm text-gray-600">Información de tu sección y curso</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          {user?.section ? (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">
                    Sección: {user.section.name}
                  </h3>
                  {user.section.grade_level_name && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Grado:</span> {user.section.grade_level_name}
                    </p>
                  )}
                  {user.section.term_name && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Período:</span> {user.section.term_name}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Activo
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Temas disponibles</p>
                    <p className="text-sm font-semibold text-gray-900">{topics?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Book className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Cursos asignados</p>
                    <p className="text-sm font-semibold text-gray-900">{courses.length}</p>
                  </div>
                </div>
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

      {/* Cursos Asignados */}
      {courses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 sm:mb-6">
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                <Book className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Mis Cursos</h2>
                <p className="text-xs sm:text-sm text-gray-600">Cursos en los que estás inscrito</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {courses.map((course: any) => (
                <div key={course.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base text-gray-900 truncate flex-1 mr-2">
                      {course.name}
                    </h3>
                    {course.progress !== undefined && (
                      <span className="text-xs font-bold text-green-600 flex-shrink-0">
                        {course.progress}%
                      </span>
                    )}
                  </div>
                  {course.code && (
                    <p className="text-xs text-gray-600 mb-2">Código: {course.code}</p>
                  )}
                  {course.professor_name && (
                    <p className="text-xs text-gray-600 mb-3">
                      Prof. {course.professor_name}
                    </p>
                  )}
                  {course.progress !== undefined && (
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {course.total_materials !== undefined && course.total_materials > 0 && (
                    <p className="text-xs text-gray-600">
                      {course.completed_materials || 0} de {course.total_materials} materiales completados
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actividades Pendientes */}
      {pendingAssignmentsList.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 sm:mb-6">
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Actividades Pendientes</h2>
                <p className="text-xs sm:text-sm text-gray-600">Tareas y actividades por completar</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            <div className="space-y-3">
              {pendingAssignmentsList.slice(0, 10).map((assignment: any) => {
                const daysUntilDue = assignment.days_until_due ?? null
                const isOverdue = daysUntilDue !== null && daysUntilDue < 0
                const isUrgent = daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue >= 0
                
                return (
                  <div key={assignment.id} className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${
                    isOverdue 
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' 
                      : isUrgent
                        ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-2">
                        <span className="text-sm font-medium text-gray-900 block truncate">
                          {assignment.activity_title || assignment.title || 'Sin título'}
                        </span>
                        {assignment.course_name && (
                          <span className="text-xs text-gray-600 mt-1 block">
                            Curso: {assignment.course_name}
                          </span>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                        isOverdue
                          ? 'bg-red-100 text-red-800' 
                          : isUrgent
                            ? 'bg-orange-100 text-orange-800'
                            : daysUntilDue !== null && daysUntilDue <= 7
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isOverdue 
                          ? `Vencida hace ${Math.abs(daysUntilDue)} días`
                          : daysUntilDue === null
                            ? 'Sin fecha límite'
                            : daysUntilDue === 0 
                              ? 'Hoy' 
                              : daysUntilDue === 1 
                                ? 'Mañana'
                                : daysUntilDue <= 7
                                  ? `En ${daysUntilDue} días`
                                  : 'Pendiente'
                        }
                      </span>
                    </div>
                    {daysUntilDue !== null && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className={`w-3 h-3 flex-shrink-0 ${
                          isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                        <span className={`text-xs ${
                          isOverdue ? 'text-red-700' : isUrgent ? 'text-orange-700' : 'text-blue-700'
                        }`}>
                          {isOverdue 
                            ? `Vencida hace ${Math.abs(daysUntilDue)} días`
                            : `Vence en ${daysUntilDue} ${daysUntilDue === 1 ? 'día' : 'días'}`
                          }
                        </span>
                      </div>
                    )}
                    {assignment.points && (
                      <div className="mt-2 flex items-center space-x-2">
                        <Award className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                        <span className="text-xs text-gray-600">
                          {assignment.points} puntos
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {pendingAssignmentsList.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Mostrando 10 de {pendingAssignmentsList.length} actividades pendientes
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
