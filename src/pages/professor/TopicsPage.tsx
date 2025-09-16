import { useState, useEffect } from 'react'
import { useTopics } from '../../hooks/useTopics'
import { useMaterials } from '../../hooks/useMaterials'
import { academicApi } from '../../api/endpoints'
import { TopicModal } from '../../components/modals/TopicModal'
import { AddMaterialModal } from '../../components/modals/AddMaterialModal'
import { GenerateAIMaterialModal } from '../../components/modals/GenerateAIMaterialModal'
import { ViewMaterialsModal } from '../../components/modals/ViewMaterialsModal'
import { Topic, Student } from '../../api/endpoints'
import { formatDate } from '../../utils/helpers'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { 
  FiBook, 
  FiTarget, 
  FiPlus, 
  FiEye, 
  FiEdit3, 
  FiTrash2, 
  FiChevronUp, 
  FiChevronDown,
  FiZap,
  FiCalendar
} from 'react-icons/fi'
import { LoadingState, EmptyState } from '../../components/common'

export function TopicsPage() {
  const { topics, loading, createTopic, updateTopic, deleteTopic, loadTopicsByCourse } = useTopics()
  const { createMaterial } = useMaterials()
  const { showSuccess, showError } = useNotificationContext()
  
  const [courses, setCourses] = useState<Array<{ id: number; name: string; code: string }>>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
  const [isAIMaterialModalOpen, setIsAIMaterialModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false)
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null)

  // Cargar cursos del profesor
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true)
        const response = await academicApi.getCourses()
        setCourses(response.data)
      } catch {
        // Error loading courses
      } finally {
        setLoadingCourses(false)
      }
    }
    loadCourses()
  }, [])

  // Cargar temas cuando se selecciona un curso
  useEffect(() => {
    if (selectedCourseId) {
      loadTopicsByCourse(selectedCourseId)
    }
  }, [selectedCourseId, loadTopicsByCourse])

  const handleCreateTopic = async (data: { name: string; description?: string; course: number }) => {
    try {
      await createTopic(data)
      setIsModalOpen(false)
    } catch {
      // Error creating topic
    }
  }

  const handleUpdateTopic = async (data: { name: string; description?: string; course: number }) => {
    if (!editingTopic) return
    
    try {
      await updateTopic(editingTopic.id, data)
      setEditingTopic(null)
      setIsModalOpen(false)
    } catch {
      // Error updating topic
    }
  }

  const handleDeleteTopic = async (topicId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tema?')) {
      try {
        await deleteTopic(topicId)
      } catch {
        // Error deleting topic
      }
    }
  }

  const handleAddMaterial = async (topic: Topic) => {
    setSelectedTopic(topic)
    
    // Cargar estudiantes que tienen este curso en su portafolio
    try {
      setLoadingStudents(true)
      const response = await academicApi.getStudentsByCourse(topic.course)
      setStudents(response.data.students || [])
    } catch {
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
    
    setIsMaterialModalOpen(true)
  }

  const handleCreateMaterial = async (data: {
    name: string
    description?: string
    material_type: string
    file?: File
    url?: string
    topic: number
    is_shared: boolean
    assigned_students?: number[]
  }) => {
    try {
      await createMaterial(data)
      setIsMaterialModalOpen(false)
      setSelectedTopic(null)
      showSuccess('Material Agregado', 'El material se ha agregado exitosamente')
    } catch {
      showError('Error al Agregar Material', 'No se pudo agregar el material')
    }
  }

  const handleCloseMaterialModal = () => {
    setIsMaterialModalOpen(false)
    setSelectedTopic(null)
    setStudents([])
  }

  const handleGenerateAIMaterial = async (topic: Topic) => {
    setSelectedTopic(topic)
    setIsAIMaterialModalOpen(true)
  }

  const handleViewMaterials = (topic: Topic) => {
    setViewingTopic(topic)
    setIsMaterialsModalOpen(true)
  }

  const handleAIGenerate = async (params: {
    topic: number
    topicName: string
    courseName: string
    educationalLevel: string
    resourceType: string
    additionalRequirements?: string
  }) => {
    try {
      // Construir URL con parámetros para el generador de IA
      const searchParams = new URLSearchParams({
        topic: params.topic.toString(),
        topicName: params.topicName,
        courseName: params.courseName,
        educationalLevel: params.educationalLevel,
        resourceType: params.resourceType
      })
      
      if (params.additionalRequirements) {
        searchParams.set('additionalRequirements', params.additionalRequirements)
      }
      
      const aiUrl = `/ai-content?${searchParams.toString()}`
      
      // Mostrar mensaje de confirmación con los parámetros
      showSuccess(
        'Creando Nueva Conversación con IA', 
        `Se está creando una conversación automática con los parámetros: Tema: ${params.topicName} | Curso: ${params.courseName} | Nivel: ${params.educationalLevel} | Tipo: ${params.resourceType}`
      )
      
      // Redirigir inmediatamente al generador de IA
      window.location.href = aiUrl
      
      setIsAIMaterialModalOpen(false)
      setSelectedTopic(null)
    } catch {
      showError('Error', 'No se pudo abrir el chatbot de IA')
    }
  }

  const handleCloseAIMaterialModal = () => {
    setIsAIMaterialModalOpen(false)
    setSelectedTopic(null)
  }

  const handleReorderTopic = async (topicId: number, direction: 'up' | 'down') => {
    try {
      const topic = topics.find(t => t.id === topicId)
      if (!topic) return

      const sortedTopics = [...topics].sort((a, b) => a.order - b.order)
      const currentIndex = sortedTopics.findIndex(t => t.id === topicId)
      
      if (direction === 'up' && currentIndex > 0) {
        const prevTopic = sortedTopics[currentIndex - 1]
        await updateTopic(topicId, { order: prevTopic.order })
        await updateTopic(prevTopic.id, { order: topic.order })
      } else if (direction === 'down' && currentIndex < sortedTopics.length - 1) {
        const nextTopic = sortedTopics[currentIndex + 1]
        await updateTopic(topicId, { order: nextTopic.order })
        await updateTopic(nextTopic.id, { order: topic.order })
      }
      
      // Recargar temas para reflejar el nuevo orden
      if (selectedCourseId) {
        loadTopicsByCourse(selectedCourseId)
      }
    } catch {
      // Error reordering topic
    }
  }

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTopic(null)
  }

  if (loadingCourses) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FiTarget className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="headline-2xl text-base-content">
              Gestión de Temas
            </h1>
            <p className="text-small text-base-content/70">
              Crea y gestiona los temas de tus cursos
            </p>
          </div>
        </div>
        <LoadingState message="Cargando cursos..." />
      </div>
    )
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FiTarget className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="headline-2xl text-base-content">
              Gestión de Temas
            </h1>
            <p className="text-small text-base-content/70">
              Crea y gestiona los temas de tus cursos
            </p>
          </div>
        </div>
        <EmptyState 
          title="No tienes cursos creados"
          description="Primero debes crear cursos para poder agregar temas."
          icon={<FiBook className="w-full h-full text-base-content/40" />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FiTarget className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="headline-2xl text-base-content">
              Gestión de Temas
            </h1>
            <p className="text-small text-base-content/70">
              Crea y gestiona los temas de tus cursos
            </p>
          </div>
        </div>

        {/* Course Selector */}
        <div className="card p-4 mb-4">
          <h2 className="headline-lg text-base-content mb-3 flex items-center space-x-2">
            <FiBook className="w-5 h-5 text-primary" />
            <span>Seleccionar Curso</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`p-3 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-sm ${
                  selectedCourseId === course.id
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-base-300 hover:border-primary/50 hover:bg-base-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <FiBook className="w-4 h-4" />
                  <h3 className="headline-small font-medium">{course.name}</h3>
                </div>
                <div className="flex items-center space-x-1 text-small text-base-content/70">
                  <span>{course.code}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topics Management */}
        {selectedCourseId && (
          <div className="card">
            <div className="p-4 border-b border-base-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="headline-lg text-base-content flex items-center space-x-2">
                    <FiTarget className="w-5 h-5 text-primary" />
                    <span>Temas del Curso</span>
                  </h2>
                  <p className="text-small text-base-content/70 mt-1">
                    {topics.length} tema{topics.length !== 1 ? 's' : ''} encontrado{topics.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Crear Tema</span>
                </button>
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-small text-base-content/70">Cargando temas...</p>
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-base-200 rounded-full">
                      <FiTarget className="w-6 h-6 text-base-content/40" />
                    </div>
                    <div>
                      <h3 className="headline-xl text-base-content mb-1">No hay temas</h3>
                      <p className="text-small text-base-content/70">Comienza creando el primer tema para este curso.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {topics
                    .sort((a, b) => a.order - b.order)
                    .map((topic) => (
                      <div key={topic.id} className="rounded-lg border-2 transition-all duration-200 hover:shadow-md p-6" style={{ borderColor: 'var(--color-base-300)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <FiTarget className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="headline-lg text-base-content">
                                  {topic.name}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="badge badge-primary badge-sm">
                                    Orden: {topic.order}
                                  </span>
                                  {!topic.is_active && (
                                    <span className="badge badge-error badge-sm">
                                      Inactivo
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {topic.description && (
                              <p className="text-sm text-base-content/70 mb-3">
                                {topic.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-small text-base-content/70">
                              <div className="flex items-center space-x-2">
                                <FiBook className="w-4 h-4 text-primary" />
                                <span><strong>Curso:</strong> {topic.course_name} ({topic.course_code})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FiCalendar className="w-4 h-4 text-primary" />
                                <span><strong>Creado:</strong> {formatDate(topic.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Botones de reordenamiento */}
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleReorderTopic(topic.id, 'up')}
                                className="btn btn-ghost btn-sm p-1"
                                title="Mover hacia arriba"
                              >
                                <FiChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReorderTopic(topic.id, 'down')}
                                className="btn btn-ghost btn-sm p-1"
                                title="Mover hacia abajo"
                              >
                                <FiChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleViewMaterials(topic)}
                              className="btn btn-ghost btn-sm flex items-center space-x-1"
                            >
                              <FiEye className="w-4 h-4" />
                              <span>Ver Materiales</span>
                            </button>
                            
                            <button
                              onClick={() => handleAddMaterial(topic)}
                              className="btn btn-outline btn-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-4 h-4" />
                              <span>Agregar Material</span>
                            </button>
                            
                            <button
                              onClick={() => handleGenerateAIMaterial(topic)}
                              className="btn btn-outline btn-sm flex items-center space-x-1"
                            >
                              <FiZap className="w-4 h-4" />
                              <span>Generar con IA</span>
                            </button>
                            
                            <button
                              onClick={() => handleEditTopic(topic)}
                              className="btn btn-ghost btn-sm flex items-center space-x-1"
                            >
                              <FiEdit3 className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="btn btn-error btn-sm flex items-center space-x-1"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topic Modal */}
        <TopicModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={editingTopic ? handleUpdateTopic : handleCreateTopic}
          topic={editingTopic}
          courses={courses}
          loading={loading}
        />

        {/* Add Material Modal */}
        <AddMaterialModal
          isOpen={isMaterialModalOpen}
          onClose={handleCloseMaterialModal}
          onSave={handleCreateMaterial}
          topic={selectedTopic}
          students={students}
          loading={loadingStudents}
        />

        {/* Generate AI Material Modal */}
        <GenerateAIMaterialModal
          isOpen={isAIMaterialModalOpen}
          onClose={handleCloseAIMaterialModal}
          onGenerate={handleAIGenerate}
          topic={selectedTopic}
          loading={false}
        />

        {/* View Materials Modal */}
        <ViewMaterialsModal
          isOpen={isMaterialsModalOpen}
          onClose={() => setIsMaterialsModalOpen(false)}
          topic={viewingTopic}
        />
    </div>
  )
}
