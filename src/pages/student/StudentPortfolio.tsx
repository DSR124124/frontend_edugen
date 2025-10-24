import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, portfolioApi, Topic, Material, Portfolio } from '../../api/endpoints'
// import { useAuthStore } from '../../store/auth' // Comentado temporalmente hasta que se use
import { useMyMaterialsWithAnalytics } from '../../hooks/useMaterialAnalytics'
import { PreviewModal } from '../../components/editor/PreviewModal'
import { Document } from '../../types/block-schema'
import { 
  Book,
  FileText,
  Eye,
  Users,
  ChevronRight,
  Calendar,
  Award,
  FolderOpen,
  Sparkles,
  Play,
  Link,
  Music,
  AlertCircle,
  BookOpen,
  Target,
  Filter
} from 'lucide-react'

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
  // const { user } = useAuthStore() // Comentado temporalmente hasta que se use
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [materialFilter, setMaterialFilter] = useState<'all' | 'personalized' | 'class'>('personalized')

  // Obtener materiales con analytics
  const { data: materialsWithAnalytics } = useMyMaterialsWithAnalytics()

  // Cargar portafolios del estudiante y derivar cursos desde ellos
  const { data: myPortfolios = [], isLoading: loadingPortfolios } = useQuery({
    queryKey: ['my-portfolios'],
    queryFn: () => portfolioApi.getPortfolios().then(res => res.data as Portfolio[]),
  })

  const courses = useMemo(() => {
    const result: { results: Course[] } = { results: [] }
    for (const p of myPortfolios) {
      for (const pc of (p.courses || [])) {
        // Evitar duplicados por course id
        if (!result.results.some(c => c.id === pc.course)) {
          result.results.push({
            id: pc.course,
            name: pc.course_name,
            code: pc.course_code,
            description: undefined,
            grade_level_name: undefined,
            section_id: p.section,
          })
        }
      }
    }
    return result
  }, [myPortfolios])

  const loadingCourses = loadingPortfolios

  // Obtener temas del curso seleccionado: usar los del portafolio si vienen; si no, pedir por curso
  const { data: topics, isLoading: loadingTopics } = useQuery({
    queryKey: ['course-topics', selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse) return []
      const pc = myPortfolios.flatMap(p => p.courses || []).find(c => c.course === selectedCourse.id)
      if (pc && Array.isArray(pc.topics) && pc.topics.length) {
        return pc.topics
      }
      try {
        const response = await academicApi.getTopicsByCourse(selectedCourse.id)
        return response.data || []
      } catch {
        return []
      }
    },
    enabled: !!selectedCourse,
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

  if (!myPortfolios || myPortfolios.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4 min-h-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
          <div className="flex items-center p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>Mi Portafolio</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Explora tus cursos, temas y materiales de estudio
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="text-center py-8 sm:py-12">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No tienes portafolios disponibles</h3>
                <p className="text-sm text-gray-600">Aún no se han creado portafolios para tus cursos o secciones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0" data-tour="my-portfolio-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6" data-tour="my-portfolio-header">
        <div className="flex items-center p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Mi Portafolio</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Explora tus cursos, temas y materiales de estudio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb de navegación */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-xs sm:text-sm">
          <div className={`px-3 py-2 rounded-full transition-colors ${selectedCourse ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-600'}`}>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span className="font-medium">Seleccionar Curso</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 hidden sm:block" />
          <div className={`px-3 py-2 rounded-full transition-colors ${selectedTopic ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span className="font-medium">Seleccionar Tema</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 hidden sm:block" />
          <div className={`px-3 py-2 rounded-full transition-colors ${selectedTopic ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-600'}`}>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span className="font-medium">Ver Materiales</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4" data-tour="my-portfolio-content">
        {/* Lista de Cursos */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <Book className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Mis Cursos</h2>
                <p className="text-xs sm:text-sm text-gray-600">Haz clic en un curso para ver sus temas</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            {loadingCourses ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600">Cargando cursos...</p>
                </div>
              </div>
            ) : courses && courses.results && courses.results.length > 0 ? (
              <div className="space-y-3">
                {courses.results.map((course) => (
                  <div
                    key={course.id}
                    className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCourse?.id === course.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleCourseClick(course)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{course.name}</h3>
                        {course.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                        )}
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            <Award className="w-3 h-3 mr-1" />
                            {course.grade_level_name}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <ChevronRight
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform text-gray-400 ${
                            selectedCourse?.id === course.id ? 'rotate-90 text-blue-600' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Book className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No hay cursos disponibles</h3>
                    <p className="text-sm text-gray-600">No tienes cursos asignados en tu sección.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Temas */}
        <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${!selectedCourse ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Temas</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {selectedCourse ? 'Selecciona un tema para ver sus materiales' : 'Primero selecciona un curso'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            {!selectedCourse ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Primero selecciona un curso</h3>
                    <p className="text-sm text-gray-600">Selecciona un curso para ver sus temas disponibles.</p>
                  </div>
                </div>
              </div>
            ) : loadingTopics ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <p className="text-sm text-gray-600">Cargando temas...</p>
                </div>
              </div>
            ) : topics && topics.length > 0 ? (
              <div className="space-y-3">
                {topics
                  .sort((a, b) => a.order - b.order)
                  .map((topic) => (
                    <div
                      key={topic.id}
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedTopic?.id === topic.id
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleTopicClick(topic)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{topic.name}</h3>
                          {topic.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{topic.description}</p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              <Target className="w-3 h-3 mr-1" />
                              Orden: {topic.order}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <ChevronRight
                            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform text-gray-400 ${
                              selectedTopic?.id === topic.id ? 'rotate-90 text-green-600' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <BookOpen className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No hay temas disponibles</h3>
                    <p className="text-sm text-gray-600">No hay temas disponibles para este curso.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Materiales */}
        <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${!selectedTopic ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Materiales</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {selectedTopic 
                    ? 'Haz clic en un material para verlo'
                    : 'Selecciona un tema para ver sus materiales'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            {/* Filtro de Materiales */}
            {selectedTopic && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setMaterialFilter('personalized')}
                  className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    materialFilter === 'personalized'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Personalizados
                </button>
                <button
                  onClick={() => setMaterialFilter('class')}
                  className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    materialFilter === 'class'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-3 h-3 mr-1" />
                  De Clase
                </button>
                <button
                  onClick={() => setMaterialFilter('all')}
                  className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    materialFilter === 'all'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Todos
                </button>
              </div>
            )}
            
            {!selectedTopic ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Selecciona un tema</h3>
                    <p className="text-sm text-gray-600">Selecciona un tema para ver sus materiales disponibles.</p>
                  </div>
                </div>
              </div>
            ) : loadingMaterials ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-600">Cargando materiales...</p>
                </div>
              </div>
            ) : filteredMaterials && filteredMaterials.length > 0 ? (
              <div className="space-y-3">
                {filteredMaterials.map((material: Material) => (
                  <div
                    key={material.id}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50"
                    onClick={() => handleMaterialClick(material)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {material.material_type === 'VIDEO' && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          </div>
                        )}
                        {material.material_type === 'DOCUMENT' && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                        )}
                        {material.material_type === 'AUDIO' && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                        )}
                        {material.material_type === 'LINK' && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Link className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          </div>
                        )}
                        {!['VIDEO', 'DOCUMENT', 'AUDIO', 'LINK'].includes(material.material_type) && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{material.name}</h3>
                        {material.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {material.material_type}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            material.is_shared 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {material.is_shared ? 'De Clase' : 'Personalizado'}
                          </span>
                        </div>
                        {/* Mostrar analytics si están disponibles */}
                        {materialsWithAnalytics && materialsWithAnalytics.find(m => m.id === material.id)?.analytics && (
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.total_views || 0} vistas</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.average_duration_formatted || '0s'}</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="w-3 h-3 mr-1" />
                              <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.completion_rate?.toFixed(1) || '0'}% completado</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {materialFilter === 'personalized' 
                        ? 'No hay materiales personalizados'
                        : materialFilter === 'class'
                        ? 'No hay materiales de clase'
                        : 'No hay materiales disponibles'
                      }
                    </h3>
                    <p className="text-sm text-gray-600">
                      {materialFilter === 'personalized' 
                        ? 'No hay materiales personalizados para este tema'
                        : materialFilter === 'class'
                        ? 'No hay materiales de clase para este tema'
                        : 'No hay materiales disponibles para este tema'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal for AI-generated content */}
      {isPreviewModalOpen && previewDocument && (
        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={handleClosePreviewModal}
          document={previewDocument}
          title={selectedMaterial?.name || 'Material'}
        />
      )}
    </div>
  )
}
