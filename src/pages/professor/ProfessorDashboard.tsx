import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useProfessor } from '../../hooks/useProfessor'
import { useProfessorMaterials } from '../../hooks/useProfessorMaterials'
import { useActiveStudents } from '../../hooks/useActiveStudents'
import { KPICard } from '../../components/kpi/KPICard'
import { Link } from 'react-router-dom'

// Professor Dashboard Component

export function ProfessorDashboard() {
  const { user: professor, loading: professorLoading, error: professorError } = useProfessor()
  const { sections: professorSections, loading: sectionsLoading, error: sectionsError } = useProfessorSections()
  const { data: materials, isLoading: materialsLoading, error: materialsError } = useProfessorMaterials()
  const { data: activeStudents, isLoading: studentsLoading, error: studentsError } = useActiveStudents()


  if (professorLoading || sectionsLoading || materialsLoading || studentsLoading) {
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

  if (professorError || sectionsError || materialsError || studentsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">Error: {professorError || sectionsError || materialsError?.message || studentsError?.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard del Profesor
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus secciones y estudiantes
          </p>
        </div>

        {/* Información del Profesor */}
        {professor && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Información</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-lg text-gray-900">{professor.first_name} {professor.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Especialidad</p>
                <p className="text-lg text-gray-900">{professor.specialty_display || 'Sin especialidad'}</p>
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Mis Secciones"
            value={professorSections?.length || 0}
            icon="📚"
            color="blue"
          />
          <KPICard
            title="Estudiantes Activos"
            value={activeStudents || 0}
            icon="👥"
            color="green"
          />
          <KPICard
            title="Materiales"
            value={materials?.length || 0}
            icon="📚"
            color="purple"
          />
        </div>

        {/* Secciones Asignadas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Secciones Asignadas</h2>
          {professorSections && professorSections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professorSections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                  </div>
                  <div className="space-y-1">
                    {section.course && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Curso:</span> {section.course.name}
                      </p>
                    )}
                    {section.grade_level && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Grado:</span> {section.grade_level.name}
                      </p>
                    )}
                    {section.term && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Período:</span> {section.term.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Capacidad:</span> {section.capacity} estudiantes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg">No tienes secciones asignadas</p>
              <p className="text-gray-400 text-sm">Contacta al director para que te asigne secciones</p>
            </div>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Crear Evaluación</div>
              <div className="text-sm text-gray-500">Nueva tarea o examen</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Ver Calificaciones</div>
              <div className="text-sm text-gray-500">Revisar notas</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium">Mensajes</div>
              <div className="text-sm text-gray-500">Comunicación</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <div className="text-2xl mb-2">📁</div>
              <div className="font-medium">Recursos</div>
              <div className="text-sm text-gray-500">Materiales</div>
            </button>
            <Link 
              to="/material-analytics"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors block"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium">Analytics</div>
              <div className="text-sm text-gray-500">Ver métricas</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
