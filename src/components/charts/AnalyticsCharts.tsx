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
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Análisis de Interacciones',
        font: {
          size: window.innerWidth < 768 ? 14 : 16,
        },
      },
      tooltip: {
        titleFont: {
          size: window.innerWidth < 768 ? 10 : 12,
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 10 : 12,
        },
        padding: window.innerWidth < 768 ? 8 : 12,
      },
    },
  }

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
        },
        grid: {
          display: window.innerWidth >= 768,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Tasa de Finalización (%)',
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
        },
      }
    }
  }

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
        },
        grid: {
          display: window.innerWidth >= 768,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad',
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
        },
      }
    }
  }

  const studentChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
        },
        grid: {
          display: window.innerWidth >= 768,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Sesiones',
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Tasa de Finalización (%)',
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-h-screen sm:max-h-none overflow-y-auto sm:overflow-y-visible">
      {/* Resumen de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="card p-3 sm:p-4 bg-primary-50 border border-primary-200">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <FiEye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-primary truncate">Total Visualizaciones</p>
              <p className="text-lg sm:text-xl font-bold text-primary">{data.total_views}</p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-4 bg-success-50 border border-success-200">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg flex-shrink-0">
              <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-success truncate">Usuarios Únicos</p>
              <p className="text-lg sm:text-xl font-bold text-success">{data.unique_viewers}</p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-4 bg-info-50 border border-info-200">
          <div className="flex items-center">
            <div className="p-2 bg-info-100 rounded-lg flex-shrink-0">
              <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-info truncate">Duración Promedio</p>
              <p className="text-lg sm:text-xl font-bold text-info">
                {Math.floor(data.average_duration / 60)}m {Math.floor(data.average_duration % 60)}s
              </p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-4 bg-warning-50 border border-warning-200">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg flex-shrink-0">
              <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-warning truncate">Tasa de Finalización</p>
              <p className="text-lg sm:text-xl font-bold text-warning">{data.completion_rate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Comparativa por Alumno */}
      <div className="card p-3 sm:p-6 bg-base-100 border border-base-300">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h3 className="text-sm sm:text-lg font-bold text-base-content">Comparativa por Alumno</h3>
          </div>
          <div className="text-xs sm:text-sm text-base-content/70">
            {data.student_details.length} estudiante{data.student_details.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {data.student_details.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-info-100 rounded-full w-fit mx-auto mb-4">
              <FiUsers className="w-8 h-8 text-info" />
            </div>
            <p className="text-base-content/70">No hay datos de estudiantes disponibles</p>
          </div>
        ) : (
          <>
            {/* Vista de escritorio - Tabla completa */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-sm text-base-content font-semibold px-2">Alumno</th>
                    <th className="text-sm text-base-content font-semibold px-2">Sección</th>
                    <th className="text-sm text-base-content font-semibold px-2">Grado</th>
                    <th className="text-sm text-base-content font-semibold px-2">Sesiones</th>
                    <th className="text-sm text-base-content font-semibold px-2">Duración Total</th>
                    <th className="text-sm text-base-content font-semibold px-2">Duración Promedio</th>
                    <th className="text-sm text-base-content font-semibold px-2">Tasa de Finalización</th>
                    <th className="text-sm text-base-content font-semibold px-2">Última Visualización</th>
                  </tr>
                </thead>
                <tbody>
                  {data.student_details.map((student) => (
                    <tr key={student.student_id} className="hover:bg-base-50">
                      <td className="text-sm font-medium text-base-content px-2">
                        {student.student_name}
                      </td>
                      <td className="text-sm text-base-content/70 px-2">
                        {student.section_name}
                      </td>
                      <td className="text-sm text-base-content/70 px-2">
                        {student.grade_level}
                      </td>
                      <td className="text-center px-2">
                        <span className="badge badge-primary badge-sm">
                          {student.sessions_count}
                        </span>
                      </td>
                      <td className="text-center px-2">
                        <span className="text-sm text-info font-medium">
                          {Math.floor(student.total_duration / 60)}m {student.total_duration % 60}s
                        </span>
                      </td>
                      <td className="text-center px-2">
                        <span className="text-sm text-warning font-medium">
                          {student.sessions_count > 0 ? Math.floor((student.total_duration / student.sessions_count) / 60) : 0}m
                        </span>
                      </td>
                      <td className="text-center px-2">
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
                      <td className="text-sm text-base-content/70 px-2">
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

            {/* Vista móvil - Cards */}
            <div className="lg:hidden">
              <div className="text-xs text-base-content/70 mb-2 text-center">
                Desliza para ver más estudiantes
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.student_details.map((student) => (
                <div key={student.student_id} className="card p-4 bg-base-50 border border-base-200">
                  <div className="space-y-3">
                    {/* Header del estudiante */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-base-content truncate">
                          {student.student_name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-base-content/70">{student.section_name}</span>
                          <span className="text-xs text-base-content/50">•</span>
                          <span className="text-xs text-base-content/70">{student.grade_level}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="badge badge-primary badge-sm">
                          {student.sessions_count} sesiones
                        </span>
                      </div>
                    </div>

                    {/* Métricas principales */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-info-50 rounded-lg">
                        <div className="text-xs text-info font-medium">Duración Total</div>
                        <div className="text-sm font-bold text-info">
                          {Math.floor(student.total_duration / 60)}m {student.total_duration % 60}s
                        </div>
                      </div>
                      <div className="text-center p-2 bg-warning-50 rounded-lg">
                        <div className="text-xs text-warning font-medium">Promedio</div>
                        <div className="text-sm font-bold text-warning">
                          {student.sessions_count > 0 ? Math.floor((student.total_duration / student.sessions_count) / 60) : 0}m
                        </div>
                      </div>
                    </div>

                    {/* Tasa de finalización */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-base-content">Tasa de Finalización</span>
                        <span className={`text-sm font-bold ${
                          student.completion_rate >= 80 ? 'text-success' :
                          student.completion_rate >= 60 ? 'text-info' :
                          student.completion_rate >= 40 ? 'text-warning' : 'text-error'
                        }`}>
                          {student.completion_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            student.completion_rate >= 80 ? 'bg-success' :
                            student.completion_rate >= 60 ? 'bg-info' :
                            student.completion_rate >= 40 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${Math.min(student.completion_rate, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Última visualización */}
                    <div className="pt-2 border-t border-base-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-base-content/70">Última Visualización</span>
                        <span className="text-xs text-base-content/70">
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
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 max-h-screen sm:max-h-none overflow-y-auto sm:overflow-y-visible">
        {/* Gráfico de barras - Visualizaciones diarias */}
        <div className="card p-3 sm:p-6 bg-base-100 border border-base-300">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <FiBarChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h3 className="text-sm sm:text-lg font-bold text-base-content truncate">Visualizaciones Diarias</h3>
          </div>
          <div className="h-40 sm:h-64 w-full overflow-hidden">
            <Bar data={dailyViewsData} options={barChartOptions} />
          </div>
        </div>

        {/* Gráfico de líneas - Duración promedio */}
        <div className="card p-3 sm:p-6 bg-base-100 border border-base-300">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-info flex-shrink-0" />
            <h3 className="text-sm sm:text-lg font-bold text-base-content truncate">Duración Promedio por Día</h3>
          </div>
          <div className="h-40 sm:h-64 w-full overflow-hidden">
            <Line data={durationData} options={lineChartOptions} />
          </div>
        </div>

        {/* Gráfico de barras - Rendimiento por estudiante */}
        <div className="card p-3 sm:p-6 bg-base-100 border border-base-300 xl:col-span-2">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <FiActivity className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
            <h3 className="text-sm sm:text-lg font-bold text-base-content truncate">Rendimiento por Estudiante</h3>
          </div>
          <div className="h-40 sm:h-64 w-full overflow-hidden">
            <Bar data={studentPerformanceData} options={studentChartOptions} />
          </div>
        </div>
      </div>

    </div>
  )
}
