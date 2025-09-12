import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../api/endpoints'
import { KPICard } from '../../components/kpi/KPICard'

export function ProfesorDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getDashboard().then(res => res.data),
  })

  if (isLoading) {
    return <div className="text-center py-8">Cargando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="headline-2xl text-base-content">Dashboard del Profesor</h1>
        <p className="text-lg text-base-content/70">Gestiona tus cursos y estudiantes</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Mis Cursos"
          value={5}
          icon="📚"
          color="blue"
        />
        <KPICard
          title="Estudiantes Activos"
          value={120}
          icon="👥"
          color="green"
        />
        <KPICard
          title="Evaluaciones Pendientes"
          value={8}
          icon="📝"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="headline-xl mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">Crear Evaluación</div>
            <div className="text-sm text-gray-500">Nueva tarea o examen</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Ver Calificaciones</div>
            <div className="text-sm text-gray-500">Revisar notas</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-medium">Mensajes</div>
            <div className="text-sm text-gray-500">Comunicación</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">📁</div>
            <div className="font-medium">Recursos</div>
            <div className="text-sm text-gray-500">Materiales</div>
          </button>
        </div>
      </div>
    </div>
  )
}
