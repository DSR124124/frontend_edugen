import { useState, useEffect } from 'react'
import { academicApi } from '../../api/endpoints'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { CreateCourseModal } from '../../components/modals/CreateCourseModal'
import { AssignCourseModal } from '../../components/modals/AssignCourseModal'
import { EditCourseModal } from '../../components/modals/EditCourseModal'
import { ViewCourseModal } from '../../components/modals/ViewCourseModal'
import { DeleteCourseModal } from '../../components/modals/DeleteCourseModal'
import { Button } from '../../components/ui/Button'
import { 
  FiBook,
  FiUsers,
  FiCheckCircle,
  FiPlus,
  FiEye,
  FiEdit,
  FiUserPlus,
  FiTrash2
} from 'react-icons/fi'
import { LoadingState, ErrorState, EmptyCoursesState } from '../../components/common'

interface Course {
  id: number
  name: string
  code: string
  description: string
  institution: number
  created_at: string
  credits: number
  updated_at: string
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
    } catch {
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
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FiBook className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="headline-2xl text-base-content">
              Mis Cursos
            </h1>
            <p className="text-small text-base-content/70">
              Gestiona los cursos que has creado y dictas
            </p>
          </div>
        </div>
        <LoadingState message="Cargando cursos..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FiBook className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="headline-2xl text-base-content">
              Mis Cursos
            </h1>
            <p className="text-small text-base-content/70">
              Gestiona los cursos que has creado y dictas
            </p>
          </div>
        </div>
        <ErrorState 
          error={error}
          onRetry={loadData}
          retryLabel="Reintentar"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FiBook className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="headline-2xl text-base-content">
              Mis Cursos
            </h1>
            <p className="text-small text-base-content/70">
              Gestiona los cursos que has creado y dictas
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          leftIcon={<FiPlus className="w-4 h-4" />}
        >
          Crear Curso
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FiBook className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-small font-medium text-base-content/70">Total Cursos</p>
              <p className="text-2xl font-semibold text-base-content">{courses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-small font-medium text-base-content/70">Cursos Activos</p>
              <p className="text-2xl font-semibold text-base-content">{courses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-secondary" />
            </div>
            <div className="ml-4">
              <p className="text-small font-medium text-base-content/70">Secciones Asignadas</p>
              <p className="text-2xl font-semibold text-base-content">{professorSections?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="headline-lg text-base-content flex items-center space-x-2">
            <FiBook className="w-5 h-5 text-primary" />
            <span>Cursos Creados</span>
          </h2>
          <div className="text-small text-base-content/70">
            {courses.length} {courses.length === 1 ? 'curso' : 'cursos'} encontrado{courses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-base-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                    Créditos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-base-content/70 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-base-100 divide-y divide-base-300">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-base-200/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <FiBook className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-base-content">{course.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-base-content font-mono bg-base-200 px-2 py-1 rounded">
                        {course.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-base-content max-w-xs truncate" title={course.description}>
                        {course.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-base-content">
                        {course.credits || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-base-content">
                        {new Date(course.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success">
                        <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          onClick={() => openViewModal(course)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye className="w-4 h-4" />}
                        >
                          Ver
                        </Button>
                        <Button 
                          onClick={() => openEditModal(course)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEdit className="w-4 h-4" />}
                        >
                          Editar
                        </Button>
                        <Button 
                          onClick={() => openAssignModal(course)}
                          variant="primary"
                          size="sm"
                          leftIcon={<FiUserPlus className="w-4 h-4" />}
                        >
                          Asignar
                        </Button>
                        <Button 
                          onClick={() => openDeleteModal(course)}
                          variant="danger"
                          size="sm"
                          leftIcon={<FiTrash2 className="w-4 h-4" />}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyCoursesState 
            onAddCourse={() => setShowCreateModal(true)}
          />
        )}
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
        course={selectedCourse}
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
        course={selectedCourse}
      />

      <ViewCourseModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedCourse(null)
        }}
        course={selectedCourse}
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
        course={selectedCourse}
      />
    </div>
  )
}
