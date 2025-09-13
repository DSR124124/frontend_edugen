import { useState, useEffect } from 'react'
import { academicApi } from '../../api/endpoints'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { CreateCourseModal } from '../../components/modals/CreateCourseModal'
import { AssignCourseModal } from '../../components/modals/AssignCourseModal'
import { EditCourseModal } from '../../components/modals/EditCourseModal'
import { ViewCourseModal } from '../../components/modals/ViewCourseModal'
import { DeleteCourseModal } from '../../components/modals/DeleteCourseModal'

interface Course {
  id: number
  name: string
  code: string
  description?: string
  institution: number
  created_at: string
}



export function MyCourses() {
  const { sections: professorSections, loading: sectionsLoading } = useProfessorSections()
  const { showSuccess, showError } = useNotificationContext()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)


  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const coursesResponse = await academicApi.getCourses()
      
      setCourses(coursesResponse.data?.results || coursesResponse.data || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar datos'
        : 'Error al cargar datos'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (data: {
    name: string
    code: string
    description: string
    credits: number
  }) => {
    try {
      setLoading(true)
      
      // Crear el curso
      // Asegurar que credits esté presente
      const courseDataWithCredits = {
        ...data,
        credits: data.credits || 0
      }
      
      const response = await academicApi.createCourse(courseDataWithCredits)
      const newCourse = response.data
      
      setCourses(prev => [...prev, newCourse])
      setShowCreateModal(false)
      showSuccess('Curso Creado', 'El curso se ha creado exitosamente')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al crear curso'
        : 'Error al crear curso'
      showError('Error al Crear Curso', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignCourse = async (data: {
    section_ids: number[]
  }) => {
    if (!selectedCourse) return

    try {
      setLoading(true)
      await academicApi.assignCourseToSections(selectedCourse.id, {
        section_ids: data.section_ids
      })
      
      setShowAssignModal(false)
      setSelectedCourse(null)
      showSuccess('Curso Asignado', 'El curso se ha asignado exitosamente a los salones seleccionados')
    } catch (err: unknown) {
      showError('Error al Asignar Curso', 'Error al asignar el curso a los salones seleccionados')
    } finally {
      setLoading(false)
    }
  }

  const openAssignModal = (course: Course) => {
    setSelectedCourse(course)
    setShowAssignModal(true)
  }

  const openEditModal = (course: Course) => {
    setSelectedCourse(course)
    setShowEditModal(true)
  }

  const openViewModal = (course: Course) => {
    setSelectedCourse(course)
    setShowViewModal(true)
  }

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course)
    setShowDeleteModal(true)
  }

  const handleUpdateCourse = async (data: {
    name: string
    code: string
    description: string
    credits: number
  }) => {
    if (!selectedCourse) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await academicApi.updateCourse(selectedCourse.id, data)
      const updatedCourse = response.data

      setCourses(prev => prev.map(course => 
        course.id === selectedCourse.id ? updatedCourse : course
      ))
      
      setShowEditModal(false)
      setSelectedCourse(null)
      showSuccess('Curso Actualizado', 'El curso se ha actualizado exitosamente')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al actualizar curso'
        : 'Error al actualizar curso'
      showError('Error al Actualizar Curso', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return

    try {
      setLoading(true)
      setError(null)
      
      await academicApi.deleteCourse(selectedCourse.id)

      setCourses(prev => prev.filter(course => course.id !== selectedCourse.id))
      
      setShowDeleteModal(false)
      setSelectedCourse(null)
      showSuccess('Curso Eliminado', 'El curso se ha eliminado exitosamente')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al eliminar curso'
        : 'Error al eliminar curso'
      showError('Error al Eliminar Curso', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if ((loading && courses.length === 0) || sectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando datos...</p>
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
              onClick={loadData}
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📚 Mis Cursos
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona los cursos que has creado y dictas
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Crear Curso</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cursos</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Secciones Asignadas</p>
                <p className="text-2xl font-semibold text-gray-900">{professorSections?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">📖 Cursos Creados</h2>
              <div className="text-sm text-gray-500">
                {courses.length} {courses.length === 1 ? 'curso' : 'cursos'} encontrado{courses.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="p-6">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <span>📖</span>
                        <span>{course.name}</span>
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Activo
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">🏷️ Código:</span>
                        <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{course.code}</span>
                      </div>
                      
                      {course.description && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">📝 Descripción</p>
                          <p className="text-sm text-gray-900 line-clamp-2">{course.description}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">📅 Creado:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(course.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button 
                          onClick={() => openViewModal(course)}
                          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>👁️</span>
                          <span>Ver</span>
                        </button>
                        <button 
                          onClick={() => openEditModal(course)}
                          className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>✏️</span>
                          <span>Editar</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => openAssignModal(course)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>🏫</span>
                          <span>Asignar</span>
                        </button>
                        <button 
                          onClick={() => openDeleteModal(course)}
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>🗑️</span>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  {/* Icono principal */}
                  <div className="text-gray-300 text-8xl mb-6">📚</div>
                  
                  {/* Mensaje principal */}
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    ¡Aún no tienes cursos creados!
                  </h3>
                  
                  {/* Descripción detallada */}
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Comienza tu experiencia docente creando tu primer curso. 
                    Podrás gestionar tus clases, asignar contenido y organizar 
                    todo tu material educativo de manera eficiente.
                  </p>
                  
                  {/* Características destacadas */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h4 className="text-lg font-medium text-blue-900 mb-4">
                      🎯 ¿Qué puedes hacer con tus cursos?
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                      <div className="flex items-center space-x-2">
                        <span>📝</span>
                        <span>Crear contenido educativo</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🏫</span>
                        <span>Asignar a salones</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>👥</span>
                        <span>Gestionar estudiantes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📊</span>
                        <span>Seguir progreso</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón de acción principal */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-3 mx-auto text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Crear Mi Primer Curso</span>
                  </button>
                  
                  {/* Mensaje de apoyo */}
                  <p className="text-sm text-gray-500 mt-6">
                    💡 Es rápido y fácil, solo necesitas un nombre y código para comenzar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <CreateCourseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCourse}
          loading={loading}
        />

        <AssignCourseModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSubmit={handleAssignCourse}
          loading={loading}
          course={selectedCourse as any}
          sections={professorSections || []}
        />

        <EditCourseModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedCourse(null)
          }}
          onSubmit={handleUpdateCourse}
          loading={loading}
          course={selectedCourse as any}
        />

        <ViewCourseModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedCourse(null)
          }}
          course={selectedCourse as any}
          sections={professorSections || []}
        />

        <DeleteCourseModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedCourse(null)
          }}
          onConfirm={handleDeleteCourse}
          loading={loading}
          course={selectedCourse as any}
        />
      </div>
    </div>
  )
}
