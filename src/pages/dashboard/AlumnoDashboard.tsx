import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../api/endpoints'
import { KPICard } from '../../components/kpi/KPICard'

export function AlumnoDashboard() {
  const { isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getDashboard().then(res => res.data),
  })

  if (isLoading) {
    return <div className="text-center py-8">Cargando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="headline-2xl text-base-content">Mi Dashboard</h1>
        <p className="text-lg text-base-content/70">Bienvenido a tu espacio de aprendizaje</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Cursos Inscritos"
          value={4}
          icon="📚"
          color="blue"
        />
        <KPICard
          title="Tareas Pendientes"
          value={3}
          icon="📝"
          color="orange"
        />
        <KPICard
          title="Promedio General"
          value="8.5"
          icon="⭐"
          color="green"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Tarea de Matemáticas completada</span>
            </div>
            <span className="text-xs text-gray-500">Hace 2 horas</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Nueva evaluación de Ciencias</span>
            </div>
            <span className="text-xs text-gray-500">Hace 1 día</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Calificación recibida en Historia</span>
            </div>
            <span className="text-xs text-gray-500">Hace 2 días</span>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Mis Cursos</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Matemáticas Avanzadas</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Activo</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Ciencias Naturales</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Activo</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Historia Universal</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Activo</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Próximas Evaluaciones</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Examen de Matemáticas</span>
              <span className="text-xs text-orange-600">Mañana</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Proyecto de Ciencias</span>
              <span className="text-xs text-orange-600">En 3 días</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Ensayo de Historia</span>
              <span className="text-xs text-orange-600">En 1 semana</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
