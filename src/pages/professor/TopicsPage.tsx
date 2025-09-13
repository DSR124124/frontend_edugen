import { useState, useEffect } from 'react'
import { useTopics } from '../../hooks/useTopics'
import { useMaterials } from '../../hooks/useMaterials'
import { academicApi } from '../../api/endpoints'
import { TopicModal } from '../../components/modals/TopicModal'
import { AddMaterialModal } from '../../components/modals/AddMaterialModal'
import { GenerateAIMaterialModal } from '../../components/modals/GenerateAIMaterialModal'
import { Topic, Student } from '../../api/endpoints'
import { formatDate } from '../../utils/helpers'
import { useNotificationContext } from '../../contexts/NotificationContext'

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando cursos...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos creados</h3>
            <p className="text-gray-500">Primero debes crear cursos para poder agregar temas.</p>
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
            Gestión de Temas
          </h1>
          <p className="text-gray-600 mt-2">
            Crea y gestiona los temas de tus cursos
          </p>
        </div>

        {/* Course Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedCourseId === course.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">{course.name}</h3>
                <p className="text-sm text-gray-500">{course.code}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Topics Management */}
        {selectedCourseId && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Temas del Curso
                </h2>
                <p className="text-sm text-gray-500">
                  {topics.length} tema{topics.length !== 1 ? 's' : ''} encontrado{topics.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Crear Tema
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando temas...</p>
              </div>
            ) : topics.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay temas</h3>
                <p>Comienza creando el primer tema para este curso.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {topics
                  .sort((a, b) => a.order - b.order)
                  .map((topic) => (
                    <div key={topic.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {topic.name}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Orden: {topic.order}
                            </span>
                            {!topic.is_active && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactivo
                              </span>
                            )}
                          </div>
                          {topic.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {topic.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>
                              Curso: {topic.course_name} ({topic.course_code})
                            </span>
                            <span>
                              Creado: {formatDate(topic.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Botones de reordenamiento */}
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleReorderTopic(topic.id, 'up')}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Mover hacia arriba"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReorderTopic(topic.id, 'down')}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Mover hacia abajo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleAddMaterial(topic)}
                            className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 flex items-center space-x-1"
                          >
                            <span>📚</span>
                            <span>Agregar Material</span>
                          </button>
                          <button
                            onClick={() => handleGenerateAIMaterial(topic)}
                            className="px-3 py-1 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 flex items-center space-x-1"
                          >
                            <span>🤖</span>
                            <span>Generar con IA</span>
                          </button>
                          <button
                            onClick={() => handleEditTopic(topic)}
                            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
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
      </div>
    </div>
  )
}
