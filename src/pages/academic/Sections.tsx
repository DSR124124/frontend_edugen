import { useQuery } from '@tanstack/react-query'
import { academicApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'

export function Sections() {
  const { user } = useAuthStore()
  const { data: sections, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: () => academicApi.getSections().then(res => res.data),
  })

  if (isLoading) {
    return <div className="text-center py-8">Cargando secciones...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secciones</h1>
          <p className="text-gray-600">
            {user?.role === 'DIRECTOR' 
              ? 'Gestiona las secciones de los cursos' 
              : 'Visualiza las secciones asignadas'
            }
          </p>
        </div>
        {user?.role === 'DIRECTOR' && (
          <button className="bg-primary text-primary-content px-4 py-2 rounded-md hover:bg-primary-focus">
            Nueva Sección
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sections?.results?.map((section: any) => (
            <li key={section.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                  <p className="text-sm text-gray-600">{section.course?.name}</p>
                  <p className="text-sm text-gray-500">Profesor: {section.professor?.first_name} {section.professor?.last_name}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Capacidad: {section.capacity}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver detalles
                  </button>
                </div>
              </div>
            </li>
          )) || (
            <li className="px-6 py-8 text-center text-gray-500">
              No hay secciones disponibles
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
