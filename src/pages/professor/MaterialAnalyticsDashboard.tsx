import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Material } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { AnalyticsCharts } from '../../components/charts/AnalyticsCharts'
import { 
  BarChart3,
  Users,
  Book,
  Calendar,
  Download,
  Play,
  FileText,
  Image,
  Link,
  Music,
  AlertTriangle,
  RefreshCw,
  Filter,
  Target,
  Award,
  Info,
  Sparkles
} from 'lucide-react'
import { EmptyState } from '../../components/common'

interface Course {
  id: number
  name: string
  code: string
}

interface GradeLevel {
  id: number
  name: string
  level: number
}

interface Section {
  id: number
  name: string
  grade_level?: {
    id: number
    name: string
    level: number
  }
  course?: {
    id: number
    name: string
    code: string
  }
}

interface Topic {
  id: number
  name: string
  course: number
  course_name: string
  course_code: string
}

interface DailyStats {
  date: string
  views: number
  duration: number
  unique_viewers: number
}

interface WeeklyStats {
  week: string
  views: number
  duration: number
  unique_viewers: number
}

interface StudentDetail {
  student_id: number
  student_name: string
  section_name: string
  grade_level: string
  total_duration: number
  sessions_count: number
  completion_rate: number
  last_viewed: string
}

interface MaterialAnalyticsData {
  material_id: number
  material_name: string
  material_type: string
  total_views: number
  unique_viewers: number
  total_duration: number
  average_duration: number
  completion_rate: number
  daily_stats: DailyStats[]
  weekly_stats: WeeklyStats[]
  student_details: StudentDetail[]
}


export function MaterialAnalyticsDashboard() {
  const { user } = useAuthStore()
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number | null>(null)
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Obtener grados
  const { data: gradeLevels, isLoading: loadingGradeLevels } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: async () => {
      const response = await academicApi.getGradeLevels()
      return response.data
    },
    enabled: !!user
  })

  // Obtener secciones del profesor (filtradas por grado si se selecciona)
  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ['professor-sections', selectedGradeLevel],
    queryFn: async () => {
      const response = await academicApi.getMySections()
      const allSections = response.data
      
      // Filtrar por grado si se selecciona
      if (selectedGradeLevel) {
        return allSections.filter((section: Section) => 
          section.grade_level?.id === selectedGradeLevel
        )
      }
      
      return allSections
    },
    enabled: !!user
  })

  // Obtener cursos de la sección seleccionada
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['section-courses', selectedSection],
    queryFn: async () => {
      if (!selectedSection) return []
      
      // Obtener la sección seleccionada
      const response = await academicApi.getMySections()
      const allSections = response.data
      const selectedSectionData = allSections.find((s: Section) => s.id === selectedSection)
      
      // Si la sección tiene un curso asignado, devolverlo
      if (selectedSectionData?.course) {
        return [selectedSectionData.course]
      }
      
      return []
    },
    enabled: !!selectedSection
  })

  // Obtener temas del curso seleccionado
  const { data: topics, isLoading: loadingTopics } = useQuery({
    queryKey: ['course-topics', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return []
      const response = await academicApi.getTopicsByCourse(selectedCourse)
      return response.data
    },
    enabled: !!selectedCourse
  })

  // Obtener materiales del tema seleccionado
  const { data: materials, isLoading: loadingMaterials } = useQuery({
    queryKey: ['topic-materials', selectedTopic],
    queryFn: async () => {
      if (!selectedTopic) return []
      try {
        const response = await academicApi.getMaterialsByTopic(selectedTopic)
        // Asegurar que siempre devolvemos un array
        if (Array.isArray(response.data)) {
          return response.data
        } else if (response.data && Array.isArray(response.data.results)) {
          return response.data.results
        } else {
          return []
        }
      } catch (error) {
        console.error('Error loading materials:', error)
        return []
      }
    },
    enabled: !!selectedTopic
  })

  // Obtener analytics del material seleccionado
  const { data: materialAnalytics, isLoading: loadingAnalytics } = useQuery<MaterialAnalyticsData | null>({
    queryKey: ['material-analytics', selectedMaterial, timeRange],
    queryFn: async () => {
      if (!selectedMaterial) return null
      const response = await academicApi.getMaterialDetailedAnalytics(selectedMaterial, timeRange)
      return response.data
    },
    enabled: !!selectedMaterial
  })

  if (user?.role !== 'PROFESOR') {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate flex items-center gap-2">
              Analytics de Materiales
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Análisis detallado del uso de materiales educativos
            </p>
          </div>
        </div>
        <EmptyState 
          title="Acceso Denegado"
          description="Solo los profesores pueden acceder a esta página."
          icon={<AlertTriangle className="w-full h-full text-red-500" />}
        />
      </div>
    )
  }



  const getTimeRangeLabel = (range: string) => {
    const labels = {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '90d': 'Últimos 90 días',
      'all': 'Todo el tiempo'
    }
    return labels[range as keyof typeof labels] || range
  }

  const getMaterialTypeIcon = (type: string) => {
    const icons = {
      'SCORM': <Book className="w-5 h-5 text-purple-600" />,
      'VIDEO': <Play className="w-5 h-5 text-blue-600" />,
      'AUDIO': <Music className="w-5 h-5 text-yellow-600" />,
      'IMAGE': <Image className="w-5 h-5 text-green-600" />,
      'DOCUMENT': <FileText className="w-5 h-5 text-red-600" />,
      'LINK': <Link className="w-5 h-5 text-cyan-600" />,
      'OTHER': <FileText className="w-5 h-5 text-gray-500" />
    }
    return icons[type as keyof typeof icons] || <FileText className="w-5 h-5 text-gray-500" />
  }

  const getMaterialTypeLabel = (type: string) => {
    const labels = {
      'SCORM': 'SCORM',
      'VIDEO': 'Video',
      'AUDIO': 'Audio',
      'IMAGE': 'Imagen',
      'DOCUMENT': 'Documento',
      'LINK': 'Enlace',
      'OTHER': 'Otro'
    }
    return labels[type as keyof typeof labels] || type
  }


  return (
    <div className="space-y-3 sm:space-y-4 min-h-0" data-tour="analytics-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6" data-tour="analytics-header">
        <div className="flex items-center p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Analytics de Materiales</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Análisis detallado del uso de materiales educativos
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Selectores */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Seleccionar Material para Análisis</span>
          </h2>
          <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap">
            {Array.isArray(materials) ? materials.length : 0} {Array.isArray(materials) && materials.length === 1 ? 'material' : 'materiales'} disponible{Array.isArray(materials) && materials.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Selector de Grado */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <span>Grado</span>
            </label>
            <select
              value={selectedGradeLevel || ''}
              onChange={(e) => {
                setSelectedGradeLevel(e.target.value ? parseInt(e.target.value) : null)
                setSelectedSection(null)
                setSelectedCourse(null)
                setSelectedTopic(null)
                setSelectedMaterial(null)
              }}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              disabled={loadingGradeLevels}
            >
              <option value="">Seleccionar grado...</option>
              {gradeLevels?.map((grade: GradeLevel) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Sección */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
              <span>Sección</span>
            </label>
            <select
              value={selectedSection || ''}
              onChange={(e) => {
                setSelectedSection(e.target.value ? parseInt(e.target.value) : null)
                setSelectedCourse(null)
                setSelectedTopic(null)
                setSelectedMaterial(null)
              }}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs sm:text-sm"
              disabled={loadingSections || !selectedGradeLevel}
            >
              <option value="">Seleccionar sección...</option>
              {sections?.map((section: Section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Curso */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
              <Book className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-600 flex-shrink-0" />
              <span>Curso</span>
            </label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => {
                setSelectedCourse(e.target.value ? parseInt(e.target.value) : null)
                setSelectedTopic(null)
                setSelectedMaterial(null)
              }}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-xs sm:text-sm"
              disabled={loadingCourses || !selectedSection}
            >
              <option value="">Seleccionar curso...</option>
              {courses?.map((course: Course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Tema */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
              <span>Tema</span>
            </label>
            <select
              value={selectedTopic || ''}
              onChange={(e) => {
                setSelectedTopic(e.target.value ? parseInt(e.target.value) : null)
                setSelectedMaterial(null)
              }}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-xs sm:text-sm"
              disabled={loadingTopics || !selectedCourse}
            >
              <option value="">Seleccionar tema...</option>
              {topics?.map((topic: Topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Material */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
              <span>Material</span>
            </label>
            <select
              value={selectedMaterial || ''}
              onChange={(e) => setSelectedMaterial(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
              disabled={loadingMaterials || !selectedTopic}
            >
              <option value="">Seleccionar material...</option>
              {Array.isArray(materials) && materials.map((material: Material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Rango de Tiempo */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
              <span>Período</span>
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs sm:text-sm"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="all">Todo el tiempo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics del Material Seleccionado */}
      {selectedMaterial && materialAnalytics && (
        <>
          {/* Información del Material */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex-shrink-0">
                  {getMaterialTypeIcon(materialAnalytics.material_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{materialAnalytics.material_name}</h3>
                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 mt-1 sm:mt-2">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        <strong>Tipo:</strong> {getMaterialTypeLabel(materialAnalytics.material_type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        <strong>Período:</strong> {getTimeRangeLabel(timeRange)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                <button className="px-2 sm:px-4 py-1.5 sm:py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-1 sm:space-x-2">
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Actualizar</span>
                </button>
                <button className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center space-x-1 sm:space-x-2">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Exportar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gráficos Analíticos */}
          <div data-tour="analytics-content">
            <AnalyticsCharts data={materialAnalytics} loading={loadingAnalytics} />
          </div>
        </>
      )}

      {/* Estado de Carga */}
      {loadingAnalytics && selectedMaterial && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col items-center justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Cargando Analytics</h3>
            <p className="text-xs sm:text-sm text-gray-600 text-center px-4">Obteniendo datos del material seleccionado...</p>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay material seleccionado */}
      {!selectedMaterial && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="text-center py-8 sm:py-12">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="px-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Selecciona un Material</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Elige un curso y material para ver las analytics detalladas.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-gray-600 bg-blue-50 px-3 sm:px-4 py-2 rounded-lg">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-center">Usa los filtros de arriba para navegar por los materiales disponibles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}