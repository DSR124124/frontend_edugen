import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { 
  FiEye, 
  FiUsers, 
  FiClock, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiBarChart,
  FiActivity
} from 'react-icons/fi'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DailyStats {
  date: string
  views: number
  unique_viewers: number
  duration: number
}

interface WeeklyStats {
  week: string
  views: number
  unique_viewers: number
  duration: number
}

interface StudentDetail {
  student_id: number
  student_name: string
  section_name: string
  grade_level: string
  total_duration: number
  sessions_count: number
  completion_rate: number
  last_viewed: string
}

interface AnalyticsData {
  material_id: number
  material_name: string
  material_type: string
  total_views: number
  unique_viewers: number
  total_duration: number
  average_duration: number
  completion_rate: number
  daily_stats: DailyStats[]
  weekly_stats: WeeklyStats[]
  student_details: StudentDetail[]
}

interface AnalyticsChartsProps {
  data: AnalyticsData | null
  loading: boolean
}

export function AnalyticsCharts({ data, loading }: AnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-6 bg-base-100 border border-base-300">
            <div className="animate-pulse">
              <div className="h-4 bg-base-300 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-base-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card p-8 bg-base-100 border border-base-300 text-center">
        <div className="p-4 bg-info-100 rounded-full w-fit mx-auto mb-4">
          <FiBarChart className="w-8 h-8 text-info" />
        </div>
        <p className="text-base-content/70">Selecciona un material para ver los gráficos</p>
      </div>
    )
  }

  // Preparar datos para gráfico de barras - Interacciones por día
  const dailyViewsData = {
    labels: data.daily_stats.map(stat => {
      const date = new Date(stat.date)
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Visualizaciones',
        data: data.daily_stats.map(stat => stat.views),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Usuarios Únicos',
        data: data.daily_stats.map(stat => stat.unique_viewers),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      }
    ]
  }

  // Preparar datos para gráfico de líneas - Duración promedio por día
  const durationData = {
    labels: data.daily_stats.map(stat => {
      const date = new Date(stat.date)
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Duración Promedio (min)',
        data: data.daily_stats.map(stat => {
          // Calcular duración promedio en minutos basada en datos reales
          return stat.views > 0 ? Math.round((stat.duration / stat.views) / 60) : 0
        }),
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }


  // Preparar datos para gráfico de barras - Rendimiento por estudiante
  const studentPerformanceData = {
    labels: data.student_details.map(student => student.student_name.split(' ')[0]), // Solo primer nombre
    datasets: [
      {
        label: 'Sesiones',
        data: data.student_details.map(student => student.sessions_count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
      {
        label: 'Tasa de Finalización (%)',
        data: data.student_details.map(student => student.completion_rate),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Análisis de Interacciones'
      },
    },
  }

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Tasa de Finalización (%)'
        }
      }
    }
  }

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad'
        }
      }
    }
  }

  const studentChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Sesiones'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Tasa de Finalización (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 bg-primary-50 border border-primary-200">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiEye className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-3">
              <p className="text-small font-medium text-primary">Total Visualizaciones</p>
              <p className="headline-xl text-primary">{data.total_views}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-success-50 border border-success-200">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-success" />
            </div>
            <div className="ml-3">
              <p className="text-small font-medium text-success">Usuarios Únicos</p>
              <p className="headline-xl text-success">{data.unique_viewers}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-info-50 border border-info-200">
          <div className="flex items-center">
            <div className="p-2 bg-info-100 rounded-lg">
              <FiClock className="w-6 h-6 text-info" />
            </div>
            <div className="ml-3">
              <p className="text-small font-medium text-info">Duración Promedio</p>
              <p className="headline-xl text-info">
                {Math.floor(data.average_duration / 60)}m {Math.floor(data.average_duration % 60)}s
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-warning-50 border border-warning-200">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-warning" />
            </div>
            <div className="ml-3">
              <p className="text-small font-medium text-warning">Tasa de Finalización</p>
              <p className="headline-xl text-warning">{data.completion_rate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Comparativa por Alumno */}
      <div className="card p-6 bg-base-100 border border-base-300">
        <div className="flex items-center space-x-2 mb-6">
          <FiUsers className="w-5 h-5 text-primary" />
          <h3 className="headline-lg text-base-content">Comparativa por Alumno</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th className="text-base-content font-semibold">Alumno</th>
                <th className="text-base-content font-semibold">Sección</th>
                <th className="text-base-content font-semibold">Grado</th>
                <th className="text-base-content font-semibold">Sesiones</th>
                <th className="text-base-content font-semibold">Duración Total</th>
                <th className="text-base-content font-semibold">Duración Promedio</th>
                <th className="text-base-content font-semibold">Tasa de Finalización</th>
                <th className="text-base-content font-semibold">Última Visualización</th>
              </tr>
            </thead>
            <tbody>
              {data.student_details.map((student) => (
                <tr key={student.student_id} className="hover:bg-base-50">
                  <td className="font-medium text-base-content">
                    {student.student_name}
                  </td>
                  <td className="text-base-content/70">
                    {student.section_name}
                  </td>
                  <td className="text-base-content/70">
                    {student.grade_level}
                  </td>
                  <td className="text-center">
                    <span className="badge badge-primary badge-sm">
                      {student.sessions_count}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="text-info font-medium">
                      {Math.floor(student.total_duration / 60)}m {student.total_duration % 60}s
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="text-warning font-medium">
                      {student.sessions_count > 0 ? Math.floor((student.total_duration / student.sessions_count) / 60) : 0}m
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-16 bg-base-300 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            student.completion_rate >= 80 ? 'bg-success' :
                            student.completion_rate >= 60 ? 'bg-info' :
                            student.completion_rate >= 40 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${Math.min(student.completion_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        student.completion_rate >= 80 ? 'text-success' :
                        student.completion_rate >= 60 ? 'text-info' :
                        student.completion_rate >= 40 ? 'text-warning' : 'text-error'
                      }`}>
                        {student.completion_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-base-content/70 text-sm">
                    {student.last_viewed ? 
                      new Date(student.last_viewed).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      'Nunca'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.student_details.length === 0 && (
          <div className="text-center py-8">
            <div className="p-4 bg-info-100 rounded-full w-fit mx-auto mb-4">
              <FiUsers className="w-8 h-8 text-info" />
            </div>
            <p className="text-base-content/70">No hay datos de estudiantes disponibles</p>
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Visualizaciones diarias */}
        <div className="card p-6 bg-base-100 border border-base-300">
          <div className="flex items-center space-x-2 mb-4">
            <FiBarChart className="w-5 h-5 text-primary" />
            <h3 className="headline-lg text-base-content">Visualizaciones Diarias</h3>
          </div>
          <div className="h-64">
            <Bar data={dailyViewsData} options={barChartOptions} />
          </div>
        </div>

        {/* Gráfico de líneas - Duración promedio */}
        <div className="card p-6 bg-base-100 border border-base-300">
          <div className="flex items-center space-x-2 mb-4">
            <FiTrendingUp className="w-5 h-5 text-info" />
            <h3 className="headline-lg text-base-content">Duración Promedio por Día</h3>
          </div>
          <div className="h-64">
            <Line data={durationData} options={lineChartOptions} />
          </div>
        </div>


        {/* Gráfico de barras - Rendimiento por estudiante */}
        <div className="card p-6 bg-base-100 border border-base-300">
          <div className="flex items-center space-x-2 mb-4">
            <FiActivity className="w-5 h-5 text-warning" />
            <h3 className="headline-lg text-base-content">Rendimiento por Estudiante</h3>
          </div>
          <div className="h-64">
            <Bar data={studentPerformanceData} options={studentChartOptions} />
          </div>
        </div>
      </div>

    </div>
  )
}
