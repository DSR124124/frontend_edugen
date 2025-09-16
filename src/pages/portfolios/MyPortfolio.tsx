import { useQuery } from '@tanstack/react-query'
import { portfolioApi, artifactApi, PortfolioCourse } from '../../api/endpoints'
import { useState } from 'react'
import { LoadingState } from '../../components/common'

export function MyPortfolio() {
  const [selectedCourse, setSelectedCourse] = useState<PortfolioCourse | null>(null)
  
  const { data: portfolios, isLoading } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => portfolioApi.getPortfolios().then(res => res.data),
  })

  const { data: artifacts, isLoading: artifactsLoading } = useQuery({
    queryKey: ['artifacts'],
    queryFn: () => artifactApi.getArtifacts().then((res: any) => res.data),
  })

  // Get the first portfolio for now (in a real app, you'd select based on some criteria)
  const portfolio = portfolios?.[0]

  if (isLoading || artifactsLoading) {
    return <LoadingState message="Cargando portafolio..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Portafolio</h1>
          <p className="text-gray-600">Gestiona tus trabajos y proyectos</p>
        </div>
        <button className="bg-primary text-primary-content px-4 py-2 rounded-md hover:bg-primary-focus">
          Agregar Artifact
        </button>
      </div>

      {/* Portfolio Info */}
      {portfolio && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{portfolio.title}</h3>
          <p className="text-gray-600 mb-4">{portfolio.description}</p>
          
          {/* Courses */}
          {portfolio.courses && portfolio.courses.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Cursos y Temas:</h4>
              <div className="space-y-3">
                {portfolio.courses
                  .filter((course, index, self) => 
                    // Eliminar cursos duplicados basado en el ID
                    index === self.findIndex(c => c.id === course.id)
                  )
                  .map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-3">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {course.course_name} ({course.course_code})
                    </button>
                    {course.topics && course.topics.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {course.topics
                          .filter((topic, index, self) => 
                            // Eliminar temas duplicados basado en el ID
                            index === self.findIndex(t => t.id === topic.id)
                          )
                          .sort((a, b) => a.order - b.order)
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
          
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded-full text-xs ${
              portfolio.is_public 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {portfolio.is_public ? 'Público' : 'Privado'}
            </span>
            <span className="text-sm text-gray-500">
              Creado: {new Date(portfolio.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Selected Course Info */}
      {selectedCourse && (
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h4 className="text-md font-medium text-gray-900 mb-2">
            {selectedCourse.course_name} ({selectedCourse.course_code})
          </h4>
          <p className="text-sm text-gray-600">
            Agregado el: {new Date(selectedCourse.added_at).toLocaleDateString()}
          </p>
          
          {/* Topics Section */}
          {selectedCourse.topics && selectedCourse.topics.length > 0 ? (
            <div className="mt-4">
              <h5 className="font-medium text-gray-900 mb-3">
                Temas del Curso ({selectedCourse.topics.length})
              </h5>
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

      {/* Artifacts */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mis Artifacts</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {artifacts?.results?.map((artifact: any) => (
            <li key={artifact.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-md font-medium text-gray-900">{artifact.title}</h4>
                  <p className="text-sm text-gray-600">{artifact.description}</p>
                  <p className="text-sm text-gray-500">Tipo: {artifact.artifact_type}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {new Date(artifact.created_at).toLocaleDateString()}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver
                  </button>
                </div>
              </div>
            </li>
          )) || (
            <li className="px-6 py-8 text-center text-gray-500">
              No hay artifacts disponibles
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
