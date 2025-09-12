import { useQuery } from '@tanstack/react-query'
import { portfolioApi } from '../../api/endpoints'

export function MyPortfolio() {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => portfolioApi.getPortfolio().then(res => res.data),
  })

  const { data: artifacts, isLoading: artifactsLoading } = useQuery({
    queryKey: ['artifacts'],
    queryFn: () => portfolioApi.getArtifacts().then(res => res.data),
  })

  if (isLoading || artifactsLoading) {
    return <div className="text-center py-8">Cargando portafolio...</div>
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
