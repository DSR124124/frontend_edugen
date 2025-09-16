import { useQuery } from '@tanstack/react-query'
import { academicApi } from '../../api/endpoints'
import { LoadingState } from '../../components/common'

export function Courses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => academicApi.getCourses().then(res => res.data),
  })

  if (isLoading) {
    return <LoadingState message="Cargando cursos..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p className="text-gray-600">Gestiona los cursos disponibles</p>
        </div>
        <button className="bg-primary text-primary-content px-4 py-2 rounded-md hover:bg-primary-focus">
          Nuevo Curso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.results?.map((course: { id: number; name: string; description?: string; code?: string; credits?: number }) => (
          <div key={course.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{course.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Código: {course.code}</span>
              <span className="text-sm text-gray-500">{course.credits} créditos</span>
            </div>
          </div>
        )) || (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay cursos disponibles
          </div>
        )}
      </div>
    </div>
  )
}
