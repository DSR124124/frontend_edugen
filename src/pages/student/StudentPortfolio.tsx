import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { academicApi, portfolioApi, Topic, Material, Portfolio } from '../../api/endpoints'
import { buildFileUrl } from '../../config/environment'
import { useAuthStore } from '../../store/auth'
import { useMyMaterialsWithAnalytics } from '../../hooks/useMaterialAnalytics'
import { PreviewModal } from '../../components/editor/PreviewModal'
import { FileViewModal } from '../../components/modals/FileViewModal'
import { Document } from '../../types/block-schema'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { 
  Book,
  FileText,
  Eye,
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
  Filter,
  ArrowLeft
} from 'lucide-react'
import { Button } from '../../components/ui/Button'

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
  const navigate = useNavigate()
  const { showError } = useNotificationContext()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isFileModalOpen, setIsFileModalOpen] = useState(false)
  const [fileModalUrl, setFileModalUrl] = useState<string>('')
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  // Filtros avanzados
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'personalized' | 'class'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'LINK' | 'SCORM' | 'OTHER'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress' | 'not-started'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'recent' | 'old'>('all')

  // Verificar si el estudiante tiene sección asignada
  const hasSection = user?.role === 'ALUMNO' && user?.section

  // Mostrar mensaje de error y redirigir si no tiene sección
  useEffect(() => {
    if (user?.role === 'ALUMNO' && !user?.section) {
      showError(
        'Acceso denegado',
        'No tienes sección asignada. Contacta a tu profesor o director para que te asigne una sección.',
        { duration: 6000 }
      )
      // Redirigir al dashboard después de un breve delay
      const timer = setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [user, navigate, showError])

  // Obtener materiales con analytics (solo si tiene sección)
  const { data: materialsWithAnalytics } = useMyMaterialsWithAnalytics()

  // Cargar portafolios del estudiante y derivar cursos desde ellos (solo si tiene sección)
  const { data: myPortfolios = [], isLoading: loadingPortfolios } = useQuery({
    queryKey: ['my-portfolios'],
    queryFn: () => portfolioApi.getPortfolios().then(res => res.data as Portfolio[]),
    enabled: !!hasSection, // Solo cargar si tiene sección
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
    // Resetear filtros al cambiar de tema
    setAssignmentFilter('all')
    setTypeFilter('all')
    setStatusFilter('all')
    setDateFilter('all')
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
    
    // Para materiales con archivo o enlace, abrir en modal o nueva pestaña
    // Enlaces externos - abrir en nueva pestaña
    if (material.material_type === 'LINK' && material.url) {
      const url = buildFileUrl(material.url)
      window.open(url, '_blank')
      return
    }
    
    // Archivos subidos (PDF, DOCX, imágenes, audio, video) - abrir en modal
    if (material.file) {
      const fileUrl = buildFileUrl(material.file)
      setFileModalUrl(fileUrl)
      setIsFileModalOpen(true)
      return
    }
    
    alert('Este tipo de material no se puede visualizar en este momento.')
  }

  // Función para obtener el tipo de material en español
  const getMaterialTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'DOCUMENT': 'Documento',
      'VIDEO': 'Video',
      'AUDIO': 'Audio',
      'IMAGE': 'Imagen',
      'LINK': 'Enlace',
      'SCORM': 'SCORM',
      'OTHER': 'Otro'
    }
    return labels[type] || type
  }

  // Filtrar materiales según los filtros avanzados aplicados
  const filteredMaterials = useMemo(() => {
    if (!materials?.data?.results) return []
    
    return materials.data.results.filter((material: Material) => {
      // Filtro por tipo de asignación
      const assignmentMatch = assignmentFilter === 'all' || 
        (assignmentFilter === 'class' && material.is_shared) ||
        (assignmentFilter === 'personalized' && !material.is_shared)
      
      // Filtro por tipo de material
      const typeMatch = typeFilter === 'all' || material.material_type === typeFilter
      
      // Filtro por estado (completado/in-progress/no iniciado)
      let statusMatch = true
      if (statusFilter !== 'all') {
        const materialAnalytics = materialsWithAnalytics?.find(m => m.id === material.id)?.analytics
        const completionRate = materialAnalytics?.completion_rate || 0
        
        if (statusFilter === 'completed') {
          statusMatch = completionRate >= 100
        } else if (statusFilter === 'in-progress') {
          statusMatch = completionRate > 0 && completionRate < 100
        } else if (statusFilter === 'not-started') {
          statusMatch = completionRate === 0
        }
      }
      
      // Filtro por fecha
      let dateMatch = true
      if (dateFilter !== 'all') {
        const materialDate = new Date(material.created_at)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - materialDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dateFilter === 'recent') {
          dateMatch = daysDiff <= 30 // Últimos 30 días
        } else if (dateFilter === 'old') {
          dateMatch = daysDiff > 30 // Más de 30 días
        }
      }
      
      // Todos los filtros deben cumplirse
      return assignmentMatch && typeMatch && statusMatch && dateMatch
    })
  }, [materials?.data?.results, assignmentFilter, typeFilter, statusFilter, dateFilter, materialsWithAnalytics])
  
  // Obtener estadísticas para los filtros
  const filterStats = useMemo(() => {
    if (!materials?.data?.results) return { total: 0, byType: {}, byAssignment: { class: 0, personalized: 0 } }
    
    const stats = {
      total: materials.data.results.length,
      byType: materials.data.results.reduce((acc: Record<string, number>, material: Material) => {
        acc[material.material_type] = (acc[material.material_type] || 0) + 1
        return acc
      }, {}),
      byAssignment: {
        class: materials.data.results.filter((m: Material) => m.is_shared).length,
        personalized: materials.data.results.filter((m: Material) => !m.is_shared).length
      }
    }
    
    return stats
  }, [materials?.data?.results])

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false)
    setPreviewDocument(null)
    setSelectedMaterial(null)
  }

  const handleCloseFileModal = () => {
    setIsFileModalOpen(false)
    setFileModalUrl('')
    setSelectedMaterial(null)
  }

  // Si el estudiante no tiene sección asignada, mostrar mensaje de error
  if (user?.role === 'ALUMNO' && !user?.section) {
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
                  Acceso restringido
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
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No tienes sección asignada</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Para acceder a tu portafolio, necesitas tener una sección asignada. 
                  Contacta a tu profesor o director para que te asigne una sección.
                </p>
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Dashboard
                  </Button>
                  <div className="text-xs text-gray-500 mt-4">
                    <p className="font-medium mb-1">¿Cómo resolver esto?</p>
                    <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                      <li>Contacta a tu profesor para que te asigne a una sección</li>
                      <li>Si eres nuevo estudiante, el director debe asignarte una sección</li>
                      <li>Tu sesión permanecerá activa para usar otras funcionalidades del sistema</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
            {/* Filtros Avanzados de Materiales */}
            {selectedTopic && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Filtros de Materiales</h3>
                  </div>
                  {(assignmentFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setAssignmentFilter('all')
                        setTypeFilter('all')
                        setStatusFilter('all')
                        setDateFilter('all')
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Filtro por Tipo de Asignación */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tipo de Asignación
                    </label>
                    <select
                      value={assignmentFilter}
                      onChange={(e) => setAssignmentFilter(e.target.value as 'all' | 'personalized' | 'class')}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos ({filterStats.total})</option>
                      <option value="class">De Clase ({filterStats.byAssignment.class})</option>
                      <option value="personalized">Personalizados ({filterStats.byAssignment.personalized})</option>
                    </select>
                  </div>

                  {/* Filtro por Tipo de Material */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tipo de Material
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as 'all' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'LINK' | 'SCORM' | 'OTHER')}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      {Object.entries(filterStats.byType).map(([type, count]) => (
                        <option key={type} value={type}>
                          {getMaterialTypeLabel(type)} ({count as number})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Estado */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'in-progress' | 'not-started')}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="completed">Completado (100%)</option>
                      <option value="in-progress">En Progreso (1-99%)</option>
                      <option value="not-started">No Iniciado (0%)</option>
                    </select>
                  </div>

                  {/* Filtro por Fecha */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as 'all' | 'recent' | 'old')}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las fechas</option>
                      <option value="recent">Recientes (últimos 30 días)</option>
                      <option value="old">Antiguos (más de 30 días)</option>
                    </select>
                  </div>
                </div>

                {/* Contador de resultados filtrados */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Mostrando <span className="font-semibold text-gray-900">{filteredMaterials.length}</span> de <span className="font-semibold text-gray-900">{filterStats.total}</span> materiales
                    </span>
                    {(assignmentFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') && (
                      <span className="text-blue-600 font-medium">
                        {filterStats.total - filteredMaterials.length} ocultos por filtros
                      </span>
                    )}
                  </div>
                </div>
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
                      {filterStats.total === 0
                        ? 'No hay materiales disponibles'
                        : filteredMaterials.length === 0
                        ? 'No hay materiales que coincidan con los filtros'
                        : 'No hay materiales disponibles'
                      }
                    </h3>
                    <p className="text-sm text-gray-600">
                      {filterStats.total === 0
                        ? 'Este tema no tiene materiales asignados aún.'
                        : filteredMaterials.length === 0
                        ? 'Intenta ajustar los filtros aplicados para ver más materiales.'
                        : 'Este tema no tiene materiales disponibles.'
                      }
                    </p>
                    {filteredMaterials.length === 0 && filterStats.total > 0 && (
                      <button
                        onClick={() => {
                          setAssignmentFilter('all')
                          setTypeFilter('all')
                          setStatusFilter('all')
                          setDateFilter('all')
                        }}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Limpiar todos los filtros
                      </button>
                    )}
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

      {/* File View Modal for uploaded files */}
      {isFileModalOpen && fileModalUrl && selectedMaterial && (
        <FileViewModal
          isOpen={isFileModalOpen}
          onClose={handleCloseFileModal}
          fileUrl={fileModalUrl}
          fileName={selectedMaterial.name}
          materialType={selectedMaterial.material_type}
        />
      )}
    </div>
  )
}
