import { useState, useEffect } from 'react'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { usePortfolios } from '../../hooks/usePortfolios'
import { Portfolio, PortfolioCourse } from '../../api/endpoints'
import { formatDate } from '../../utils/helpers'

export function PortfolioManagement() {
  const { sections: professorSections, loading: sectionsLoading } = useProfessorSections()
  const { portfolios, loading: portfoliosLoading, error: portfoliosError, loadPortfoliosBySection } = usePortfolios()
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<PortfolioCourse | null>(null)

  // Cargar portafolios cuando se selecciona una sección
  useEffect(() => {
    if (selectedSectionId) {
      loadPortfoliosBySection(selectedSectionId)
    }
  }, [selectedSectionId, loadPortfoliosBySection])

  // Seleccionar primera sección por defecto
  useEffect(() => {
    if (professorSections && professorSections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(professorSections[0].id)
    }
  }, [professorSections, selectedSectionId])

  if (sectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando secciones...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!professorSections || professorSections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes secciones asignadas</h3>
            <p className="text-gray-500">Contacta al director para que te asigne secciones.</p>
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
            Gestión de Portafolios
          </h1>
          <p className="text-gray-600 mt-2">
            Revisa y gestiona los portafolios de tus estudiantes
          </p>
        </div>

        {/* Section Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Sección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professorSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedSectionId === section.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">Salón {section.name}</h3>
                <p className="text-sm text-gray-500">
                  {section.grade_level?.name} - {section.term?.name}
                </p>
                {section.course && (
                  <p className="text-sm text-blue-600 font-medium">
                    {section.course.name}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolios List */}
        {selectedSectionId && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Portafolios de la Sección
              </h2>
              <p className="text-sm text-gray-500">
                {portfolios.length} portafolio{portfolios.length !== 1 ? 's' : ''} encontrado{portfolios.length !== 1 ? 's' : ''}
              </p>
            </div>

            {portfoliosLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando portafolios...</p>
              </div>
            ) : portfoliosError ? (
              <div className="p-6 text-center text-red-600">
                <p>Error: {portfoliosError}</p>
              </div>
            ) : portfolios.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay portafolios</h3>
                <p>Los portafolios se crearán automáticamente cuando asignes actividades a los estudiantes.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {portfolios
                  .filter((portfolio, index, self) => 
                    // Eliminar portafolios duplicados basado en el ID
                    index === self.findIndex(p => p.id === portfolio.id)
                  )
                  .map((portfolio) => (
                  <div key={portfolio.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {portfolio.title}
                          </h3>
                          {portfolio.is_public && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Público
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Estudiante: {portfolio.student_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Sección: {portfolio.section_name}
                        </p>
                        {portfolio.courses && portfolio.courses.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-2">Cursos y Temas:</p>
                            <div className="space-y-2">
                              {portfolio.courses
                                .filter((course, index, self) => 
                                  // Eliminar cursos duplicados basado en el ID
                                  index === self.findIndex(c => c.id === course.id)
                                )
                                .map((course) => (
                                <div key={course.id} className="border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {course.course_name} ({course.course_code})
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {course.topics?.length || 0} tema{(course.topics?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  {course.topics && course.topics.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {course.topics
                                        .filter((topic, index, self) => 
                                          // Eliminar temas duplicados basado en el ID
                                          index === self.findIndex(t => t.id === topic.id)
                                        )
                                        .map((topic) => (
                                        <span
                                          key={topic.id}
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                        >
                                          {topic.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {portfolio.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {portfolio.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span>
                            Actividades: {portfolio.activity_assignments_count}
                          </span>
                          <span>
                            Completadas: {portfolio.completed_assignments_count}
                          </span>
                          <span>
                            Creado: {formatDate(portfolio.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPortfolio(portfolio)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portfolio Detail Modal */}
        {selectedPortfolio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPortfolio.title}
                </h3>
                <button
                  onClick={() => {
                    setSelectedPortfolio(null)
                    setSelectedCourse(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Portfolio Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Información del Portafolio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Estudiante:</span>
                      <p className="text-gray-900">{selectedPortfolio.student_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sección:</span>
                      <p className="text-gray-900">{selectedPortfolio.section_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estado:</span>
                      <p className="text-gray-900">
                        {selectedPortfolio.is_public ? 'Público' : 'Privado'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Actividades Asignadas:</span>
                      <p className="text-gray-900">{selectedPortfolio.activity_assignments_count}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Actividades Completadas:</span>
                      <p className="text-gray-900">{selectedPortfolio.completed_assignments_count}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Creado:</span>
                      <p className="text-gray-900">{formatDate(selectedPortfolio.created_at)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Última actualización:</span>
                      <p className="text-gray-900">{formatDate(selectedPortfolio.updated_at)}</p>
                    </div>
                  </div>
                  {selectedPortfolio.description && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">Descripción:</span>
                      <p className="text-gray-900 mt-1">{selectedPortfolio.description}</p>
                    </div>
                  )}
                </div>

                {/* Courses Tabs */}
                {selectedPortfolio.courses && selectedPortfolio.courses.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Cursos en este Portafolio</h4>
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        {selectedPortfolio.courses
                          .filter((course, index, self) => 
                            // Eliminar cursos duplicados basado en el ID
                            index === self.findIndex(c => c.id === course.id)
                          )
                          .map((course) => (
                          <button
                            key={course.id}
                            onClick={() => setSelectedCourse(course)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              selectedCourse?.id === course.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {course.course_name} ({course.course_code})
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Course Content */}
                    {selectedCourse && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">
                          {selectedCourse.course_name} ({selectedCourse.course_code})
                        </h5>
                        <p className="text-sm text-gray-600">
                          Agregado el: {formatDate(selectedCourse.added_at)}
                        </p>
                        
                        {/* Topics Section */}
                        {selectedCourse.topics && selectedCourse.topics.length > 0 ? (
                          <div className="mt-4">
                            <h6 className="font-medium text-gray-900 mb-3">
                              Temas del Curso ({selectedCourse.topics.length})
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {selectedCourse.topics
                                .filter((topic, index, self) => 
                                  // Eliminar temas duplicados basado en el ID
                                  index === self.findIndex(t => t.id === topic.id)
                                )
                                .sort((a, b) => a.order - b.order)
                                .map((topic) => (
                                <div key={topic.id} className="bg-white p-3 rounded-md border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <h6 className="font-medium text-gray-900 text-sm">
                                      {topic.name}
                                    </h6>
                                    <span className="text-xs text-gray-500">
                                      Orden: {topic.order}
                                    </span>
                                  </div>
                                  {topic.description && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      {topic.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <p className="text-sm text-gray-700">
                              Este curso no tiene temas asignados aún.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Progreso del Portafolio</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: selectedPortfolio.activity_assignments_count > 0
                          ? `${(selectedPortfolio.completed_assignments_count / selectedPortfolio.activity_assignments_count) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedPortfolio.completed_assignments_count} de {selectedPortfolio.activity_assignments_count} actividades completadas
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedPortfolio(null)
                    setSelectedCourse(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
