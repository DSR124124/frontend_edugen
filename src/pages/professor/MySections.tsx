import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useNavigate } from 'react-router-dom'

export function MySections() {
  const { sections, loading, error, loadSections } = useProfessorSections()
  const navigate = useNavigate()

  const handleViewStudents = (sectionId: number) => {
    navigate(`/professor/students?section=${sectionId}`)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando secciones...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={loadSections}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Reintentar
            </button>
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
            Mis Secciones
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las secciones que tienes asignadas
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Secciones</p>
              <p className="text-2xl font-semibold text-gray-900">{sections?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Secciones */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Secciones Asignadas</h2>
          </div>

          <div className="p-6">
            {sections && sections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activa
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {section.course && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Curso</p>
                          <p className="text-sm text-gray-900">{section.course.name}</p>
                          <p className="text-xs text-gray-500">Código: {section.course.code}</p>
                        </div>
                      )}
                      
                      {section.grade_level && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Grado</p>
                          <p className="text-sm text-gray-900">{section.grade_level.name}</p>
                        </div>
                      )}
                      
                      {section.term && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Período</p>
                          <p className="text-sm text-gray-900">{section.term.name}</p>
                          <p className="text-xs text-gray-500">
                            {section.term.is_active ? 'Activo' : 'Inactivo'}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Capacidad</p>
                        <p className="text-sm text-gray-900">{section.capacity} estudiantes</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewStudents(section.id)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Ver Estudiantes
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">No tienes secciones asignadas</p>
                <p className="text-gray-400 text-sm">Contacta al director para que te asigne secciones</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
