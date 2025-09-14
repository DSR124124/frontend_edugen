import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
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

      {/* Materials Access */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Materiales de Estudio</h3>
          <Link
            to="/my-materials"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Ver Materiales</span>
          </Link>
        </div>
        <p className="text-gray-600 mb-4">
          Accede a todos los materiales de estudio de tu sección. Haz clic en los temas para ver sus materiales.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Documentos</h4>
                <p className="text-sm text-blue-700">PDFs, presentaciones</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-red-900">Videos</h4>
                <p className="text-sm text-red-700">Clases grabadas</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-900">Audio</h4>
                <p className="text-sm text-green-700">Podcasts, grabaciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
