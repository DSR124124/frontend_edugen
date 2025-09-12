import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../api/endpoints'
import { KPICard } from '../../components/kpi/KPICard'
import { BarChart } from '../../components/charts/BarChart'

export function DirectorDashboard() {
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
        <h1 className="headline-2xl text-base-content">Dashboard del Director</h1>
        <p className="text-lg text-base-content/70">Vista general de la institución educativa</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total de Cursos"
          value={dashboardData?.stats.total_courses || 0}
          icon="📚"
          color="blue"
        />
        <KPICard
          title="Total de Estudiantes"
          value={dashboardData?.stats.total_students || 0}
          icon="👥"
          color="green"
        />
        <KPICard
          title="Total de Profesores"
          value={dashboardData?.stats.total_professors || 0}
          icon="👨‍🏫"
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="headline-xl mb-4">Distribución de Estudiantes por Curso</h3>
          <BarChart data={[]} />
        </div>
        <div className="card">
          <h3 className="headline-xl mb-4">Rendimiento Académico</h3>
          <div className="text-center text-base-content/60 py-8">
            Gráfico de rendimiento (próximamente)
          </div>
        </div>
      </div>
    </div>
  )
}
