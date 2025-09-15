import { useQuery } from '@tanstack/react-query'
import { academicApi, assignmentApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'

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
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  
  // Obtener asignaciones próximas a vencer (próximos 7 días)
  const upcomingAssignments = assignments?.filter(assignment => {
    if (!assignment.days_until_due) return false
    return assignment.days_until_due <= 7 && assignment.days_until_due >= 0
  }).slice(0, 3) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="headline-2xl text-base-content">Mi Dashboard</h1>
        <p className="text-lg text-base-content/70">Bienvenido a tu espacio de aprendizaje</p>
      </div>


      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {assignments && assignments.length > 0 ? (
            assignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${assignment.is_completed ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-sm">
                    {assignment.is_completed ? 'Completada' : 'Pendiente'}: {assignment.activity_title}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {assignment.is_completed && assignment.completed_at 
                    ? new Date(assignment.completed_at).toLocaleDateString('es-ES')
                    : assignment.days_until_due !== undefined 
                      ? `${assignment.days_until_due} días restantes`
                      : 'Sin fecha'
                  }
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No hay actividades recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Mi Sección</h3>
          <div className="space-y-2">
            {user?.section ? (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">{user.section.course_name || user.section.name}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Activo</span>
              </div>
            ) : (
              <div className="text-center py-2 text-gray-500">
                <p>No hay sección asignada</p>
              </div>
            )}
            {topics && topics.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Temas disponibles:</h4>
                <div className="space-y-1">
                  {topics.slice(0, 3).map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-600">{topic.name}</span>
                      <span className="text-xs text-blue-600">{topic.course_name}</span>
                    </div>
                  ))}
                  {topics.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{topics.length - 3} temas más
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Próximas Asignaciones</h3>
          <div className="space-y-2">
            {upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between py-2">
                  <span className="text-sm">{assignment.activity_title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    (assignment.days_until_due ?? 0) === 0 
                      ? 'bg-red-100 text-red-600' 
                      : (assignment.days_until_due ?? 0) <= 2 
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                  }`}>
                    {(assignment.days_until_due ?? 0) === 0 
                      ? 'Hoy' 
                      : (assignment.days_until_due ?? 0) === 1 
                        ? 'Mañana'
                        : `En ${assignment.days_until_due ?? 0} días`
                    }
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-2 text-gray-500">
                <p>No hay asignaciones próximas</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
