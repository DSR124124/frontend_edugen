import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Topic, Material } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { useMyMaterialsWithAnalytics } from '../../hooks/useMaterialAnalytics'
import { PreviewModal } from '../../components/editor/PreviewModal'
import { Document } from '../../types/block-schema'
import { 
  FiBook,
  FiFileText,
  FiEye,
  FiUsers,
  FiChevronRight,
  FiCalendar,
  FiAward
} from 'react-icons/fi'
import { EmptyState, PageLoadingState } from '../../components/common'

// Local Course interface for this component
interface Course {
  id: number
  name: string
  description?: string
  grade_level_name?: string
  code: string
  section_id?: number
}

export function StudentPortfolio() {
  const { user } = useAuthStore()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [materialFilter, setMaterialFilter] = useState<'all' | 'personalized' | 'class'>('personalized')

  // Obtener materiales con analytics
  const { data: materialsWithAnalytics } = useMyMaterialsWithAnalytics()

  // Crear curso basado en la sección del usuario (ya que no podemos acceder a my-sections)
  const courses = user?.section ? {
    results: [{
      id: user.section.id, // Usar el ID de la sección como ID del curso
      name: user.section.course_name || user.section.name,
      description: `Curso de ${user.section.name}`,
      grade_level_name: user.section.grade_level_name,
      code: `SEC-${user.section.id}`,
      section_id: user.section.id
    }]
  } : null

  const loadingCourses = false

  // Obtener todos los temas disponibles directamente
  const { data: topics, isLoading: loadingTopics } = useQuery({
    queryKey: ['all-topics', user?.section?.id],
    queryFn: async () => {
      if (!user?.section?.id) return []
      
      try {
        const response = await academicApi.getTopics()
        return response.data || []
      } catch {
        return []
      }
    },
    enabled: !!user?.section?.id
  })

  // Obtener materiales del tema seleccionado
  const { data: materials, isLoading: loadingMaterials } = useQuery({
    queryKey: ['topic-materials', selectedTopic?.id],
    queryFn: async () => {
      if (!selectedTopic) return { data: { results: [] } }
      
      try {
        const response = await academicApi.getMaterialsByTopic(selectedTopic.id)
        
        // La API devuelve un array directamente, no un objeto con results
        const materialsArray = Array.isArray(response.data) ? response.data : response.data?.results || []
        
        return { data: { results: materialsArray } }
      } catch {
        return { data: { results: [] } }
      }
    },
    enabled: !!selectedTopic
  })

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setSelectedTopic(null)
    setSelectedMaterial(null)
  }

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic)
    setSelectedMaterial(null)
  }

  const handleMaterialClick = async (material: Material) => {
    setSelectedMaterial(material)
    
    // Si el material tiene content_data (contenido generado por IA), usar PreviewModal
    if (material.content_data) {
      try {
        // Parsear el contenido generado por IA
        const contentData = JSON.parse(material.content_data)
        if (contentData && contentData.blocks) {
          setPreviewDocument(contentData)
          setIsPreviewModalOpen(true)
          return
        }
      } catch (error) {
        console.error('Error parsing content_data:', error)
      }
    }
    
    // Para otros tipos de materiales, mostrar mensaje de que no se puede visualizar
    alert('Este tipo de material no se puede visualizar en este momento.')
  }

  // Filtrar materiales según el filtro seleccionado
  const filteredMaterials = materials?.data?.results?.filter(material => {
    if (materialFilter === 'all') return true
    if (materialFilter === 'personalized') return !material.is_shared
    if (materialFilter === 'class') return material.is_shared
    return true
  }) || []

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false)
    setPreviewDocument(null)
    setSelectedMaterial(null)
  }

  if (!user?.section) {
    return (
      <div className="card p-3 sm:p-4">
        <EmptyState 
          title="No tienes acceso al portafolio"
          description="Contacta a tu administrador para obtener acceso."
          icon={<FiUsers className="w-full h-full text-base-content/40" />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
        <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
          <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
            Mi Portafolio
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Explora tus cursos, temas y materiales de estudio
          </p>
        </div>
      </div>

      {/* Breadcrumb de navegación */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm">
          <div className={`px-2 sm:px-3 py-1 rounded-full ${selectedCourse ? 'bg-primary-100 text-primary' : 'bg-base-200 text-base-content/70'}`}>
            1. Seleccionar Curso
          </div>
          <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/40 flex-shrink-0" />
          <div className={`px-2 sm:px-3 py-1 rounded-full ${selectedTopic ? 'bg-success-100 text-success' : 'bg-base-200 text-base-content/70'}`}>
            2. Seleccionar Tema
          </div>
          <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/40 flex-shrink-0" />
          <div className={`px-2 sm:px-3 py-1 rounded-full ${selectedTopic ? 'bg-secondary-100 text-secondary' : 'bg-base-200 text-base-content/70'}`}>
            3. Ver Materiales
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Lista de Cursos */}
        <div className="card p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-base-content">Mis Cursos</h2>
          </div>
          <p className="text-xs sm:text-sm text-base-content/70 mb-3 sm:mb-4">
            Haz clic en un curso para ver sus temas
          </p>
          
          {loadingCourses ? (
            <PageLoadingState message="Cargando cursos..." />
          ) : courses && courses.results && courses.results.length > 0 ? (
            <div className="space-y-3">
              {courses.results.map((course) => (
                <div
                  key={course.id}
                  className={`card p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedCourse?.id === course.id
                      ? 'border-primary bg-primary-50'
                      : 'hover:bg-base-50'
                  }`}
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-base-content">{course.name}</h3>
                      {course.description && (
                        <p className="text-xs sm:text-sm text-base-content/70 mt-1">{course.description}</p>
                      )}
                      <div className="flex items-center mt-2">
                        <span className="badge badge-sm bg-base-200 text-base-content">
                          {course.grade_level_name}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <FiChevronRight
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform text-base-content/70 ${
                          selectedCourse?.id === course.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No hay cursos disponibles"
              description="No tienes cursos asignados en tu sección."
              icon={<FiBook className="w-full h-full text-base-content/40" />}
            />
          )}
        </div>

        {/* Lista de Temas */}
        <div className={`card p-3 sm:p-4 ${!selectedCourse ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-base-content">Temas</h2>
          </div>
          <p className="text-xs sm:text-sm text-base-content/70 mb-3 sm:mb-4">
            {selectedCourse ? 'Selecciona un tema para ver sus materiales' : 'Primero selecciona un curso'}
          </p>
          
          {!selectedCourse ? (
            <EmptyState 
              title="Primero selecciona un curso"
              description="Selecciona un curso para ver sus temas disponibles."
              icon={<FiAward className="w-full h-full text-base-content/40" />}
            />
          ) : loadingTopics ? (
            <PageLoadingState message="Cargando temas..." />
          ) : topics && topics.length > 0 ? (
            <div className="space-y-3">
              {topics
                .sort((a, b) => a.order - b.order)
                .map((topic) => (
                  <div
                    key={topic.id}
                    className={`card p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTopic?.id === topic.id
                        ? 'border-success bg-success-50'
                        : 'hover:bg-base-50'
                    }`}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg text-base-content">{topic.name}</h3>
                        {topic.description && (
                          <p className="text-xs sm:text-sm text-base-content/70 mt-1">{topic.description}</p>
                        )}
                        <div className="flex items-center mt-2">
                          <span className="badge badge-sm bg-base-200 text-base-content">
                            Orden: {topic.order}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <FiChevronRight
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform text-base-content/70 ${
                            selectedTopic?.id === topic.id ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState 
              title="No hay temas disponibles"
              description="No hay temas disponibles para este curso."
              icon={<FiAward className="w-full h-full text-base-content/40" />}
            />
          )}
        </div>

        {/* Lista de Materiales */}
        <div className={`card p-3 sm:p-4 ${!selectedTopic ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-base-content">Materiales</h2>
          </div>
          <p className="text-xs sm:text-sm text-base-content/70 mb-3 sm:mb-4">
            {selectedTopic 
              ? 'Haz clic en un material para verlo'
              : 'Selecciona un tema para ver sus materiales'
            }
          </p>
          
          {/* Filtro de Materiales */}
          {selectedTopic && (
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              <button
                onClick={() => setMaterialFilter('personalized')}
                className={`btn btn-sm ${
                  materialFilter === 'personalized'
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                Personalizados
              </button>
              <button
                onClick={() => setMaterialFilter('class')}
                className={`btn btn-sm ${
                  materialFilter === 'class'
                    ? 'btn-success'
                    : 'btn-outline'
                }`}
              >
                De Clase
              </button>
              <button
                onClick={() => setMaterialFilter('all')}
                className={`btn btn-sm ${
                  materialFilter === 'all'
                    ? 'btn-secondary'
                    : 'btn-outline'
                }`}
              >
                Todos
              </button>
            </div>
          )}
          
          {!selectedTopic ? (
            <EmptyState 
              title="Selecciona un tema"
              description="Selecciona un tema para ver sus materiales disponibles."
              icon={<FiFileText className="w-full h-full text-base-content/40" />}
            />
          ) : loadingMaterials ? (
            <PageLoadingState message="Cargando materiales..." />
          ) : filteredMaterials && filteredMaterials.length > 0 ? (
            <div className="space-y-3">
              {filteredMaterials.map((material: Material) => (
                <div
                  key={material.id}
                  className="card p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => handleMaterialClick(material)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {material.material_type === 'VIDEO' && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-error-100 rounded-lg flex items-center justify-center">
                          <FiEye className="w-4 h-4 sm:w-5 sm:h-5 text-error" />
                        </div>
                      )}
                      {material.material_type === 'DOCUMENT' && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                      )}
                      {material.material_type === 'AUDIO' && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success-100 rounded-lg flex items-center justify-center">
                          <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                        </div>
                      )}
                      {material.material_type === 'LINK' && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                        </div>
                      )}
                      {!['VIDEO', 'DOCUMENT', 'AUDIO', 'LINK'].includes(material.material_type) && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-base-200 rounded-lg flex items-center justify-center">
                          <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/70" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-base-content truncate">{material.name}</h3>
                      {material.description && (
                        <p className="text-xs sm:text-sm text-base-content/70 mt-1 line-clamp-2">{material.description}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="badge badge-sm bg-base-200 text-base-content">
                          {material.material_type}
                        </span>
                        <span className={`badge badge-sm ${
                          material.is_shared 
                            ? 'bg-success-100 text-success' 
                            : 'bg-primary-100 text-primary'
                        }`}>
                          {material.is_shared ? 'De Clase' : 'Personalizado'}
                        </span>
                      </div>
                      {/* Mostrar analytics si están disponibles */}
                      {materialsWithAnalytics && materialsWithAnalytics.find(m => m.id === material.id)?.analytics && (
                        <div className="mt-2 flex items-center space-x-4 text-xs text-base-content/70">
                          <div className="flex items-center">
                            <FiEye className="w-3 h-3 mr-1" />
                            <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.total_views || 0} vistas</span>
                          </div>
                          <div className="flex items-center">
                            <FiCalendar className="w-3 h-3 mr-1" />
                            <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.average_duration_formatted || '0s'}</span>
                          </div>
                          <div className="flex items-center">
                            <FiAward className="w-3 h-3 mr-1" />
                            <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.completion_rate?.toFixed(1) || '0'}% completado</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/70" />
                    </div>
                    </div>
                  </div>
                ))}
              </div>
          ) : (
            <EmptyState 
              title={
                materialFilter === 'personalized' 
                  ? 'No hay materiales personalizados'
                  : materialFilter === 'class'
                  ? 'No hay materiales de clase'
                  : 'No hay materiales disponibles'
              }
              description={
                materialFilter === 'personalized' 
                  ? 'No hay materiales personalizados para este tema'
                  : materialFilter === 'class'
                  ? 'No hay materiales de clase para este tema'
                  : 'No hay materiales disponibles para este tema'
              }
              icon={<FiFileText className="w-full h-full text-base-content/40" />}
            />
          )}
        </div>
      </div>

      {/* Preview Modal for AI-generated content */}
      {isPreviewModalOpen && previewDocument && (
        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={handleClosePreviewModal}
          onEdit={() => {
            // No permitir edición desde el portafolio del estudiante
            console.log('Edición no permitida desde portafolio de estudiante')
          }}
          document={previewDocument}
          title={selectedMaterial?.name || 'Material'}
          canEdit={false}
        />
      )}
    </div>
  )
}
