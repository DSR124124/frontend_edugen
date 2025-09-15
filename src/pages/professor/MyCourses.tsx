import { useState, useEffect } from 'react'
import { academicApi } from '../../api/endpoints'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { CreateCourseModal } from '../../components/modals/CreateCourseModal'
import { AssignCourseModal } from '../../components/modals/AssignCourseModal'
import { EditCourseModal } from '../../components/modals/EditCourseModal'
import { ViewCourseModal } from '../../components/modals/ViewCourseModal'
import { DeleteCourseModal } from '../../components/modals/DeleteCourseModal'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

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
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-base-content">Cargando datos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-error">Error: {error}</p>
            <Button
              onClick={loadData}
              variant="outline"
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-base-200)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="headline-2xl text-base-content flex items-center space-x-3">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Mis Cursos</span>
            </h1>
            <p className="text-base-content/70 mt-2">
              Gestiona los cursos que has creado y dictas
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Crear Curso
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-base-content/70">Total Cursos</p>
                  <p className="text-2xl font-semibold text-base-content">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-success-100 rounded-lg">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-base-content/70">Cursos Activos</p>
                  <p className="text-2xl font-semibold text-base-content">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-secondary-100 rounded-lg">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-base-content/70">Secciones Asignadas</p>
                  <p className="text-2xl font-semibold text-base-content">{professorSections?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base-content flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Cursos Creados</span>
              </CardTitle>
              <div className="text-sm text-base-content/70">
                {courses.length} {courses.length === 1 ? 'curso' : 'cursos'} encontrado{courses.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>

          <CardContent>
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
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
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
                              leftIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              }
                            >
                              Ver
                            </Button>
                            <Button 
                              onClick={() => openEditModal(course)}
                              variant="ghost"
                              size="sm"
                              leftIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              }
                            >
                              Editar
                            </Button>
                            <Button 
                              onClick={() => openAssignModal(course)}
                              variant="primary"
                              size="sm"
                              leftIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              }
                            >
                              Asignar
                            </Button>
                            <Button 
                              onClick={() => openDeleteModal(course)}
                              variant="danger"
                              size="sm"
                              leftIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              }
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
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  {/* Icono principal */}
                  <div className="w-20 h-20 rounded-full bg-base-300 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  
                  {/* Mensaje principal */}
                  <h3 className="text-2xl font-semibold text-base-content mb-3">
                    ¡Aún no tienes cursos creados!
                  </h3>
                  
                  {/* Descripción detallada */}
                  <p className="text-base-content/70 mb-8 leading-relaxed">
                    Comienza tu experiencia docente creando tu primer curso. 
                    Podrás gestionar tus clases, asignar contenido y organizar 
                    todo tu material educativo de manera eficiente.
                  </p>
                  
                  {/* Características destacadas */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                    <h4 className="text-lg font-medium text-primary mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>¿Qué puedes hacer con tus cursos?</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Crear contenido educativo</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Asignar a salones</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Gestionar estudiantes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Seguir progreso</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón de acción principal */}
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="primary"
                    size="lg"
                    leftIcon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                    className="mx-auto"
                  >
                    Crear Mi Primer Curso
                  </Button>
                  
                  {/* Mensaje de apoyo */}
                  <p className="text-sm text-base-content/70 mt-6 flex items-center justify-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Es rápido y fácil, solo necesitas un nombre y código para comenzar</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
    </div>
  )
}
