import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Material } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { AnalyticsCharts } from '../../components/charts/AnalyticsCharts'
import { 
  FiBarChart,
  FiUsers,
  FiBook,
  FiCalendar,
  FiDownload,
  FiPlay,
  FiFile,
  FiImage,
  FiLink,
  FiMusic,
  FiAlertTriangle,
  FiRefreshCw,
  FiFilter,
  FiTarget,
  FiAward,
  FiInfo
} from 'react-icons/fi'
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
          <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
            <FiBarChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
              Analytics de Materiales
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
              Análisis detallado del uso de materiales educativos
            </p>
          </div>
        </div>
        <EmptyState 
          title="Acceso Denegado"
          description="Solo los profesores pueden acceder a esta página."
          icon={<FiAlertTriangle className="w-full h-full text-error" />}
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
      'SCORM': <FiBook className="w-5 h-5 text-secondary" />,
      'VIDEO': <FiPlay className="w-5 h-5 text-primary" />,
      'AUDIO': <FiMusic className="w-5 h-5 text-warning" />,
      'IMAGE': <FiImage className="w-5 h-5 text-success" />,
      'DOCUMENT': <FiFile className="w-5 h-5 text-error" />,
      'LINK': <FiLink className="w-5 h-5 text-info" />,
      'OTHER': <FiFile className="w-5 h-5 text-base-content/70" />
    }
    return icons[type as keyof typeof icons] || <FiFile className="w-5 h-5 text-base-content/70" />
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
    <div className="space-y-3 sm:space-y-4 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
            <FiBarChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
              Analytics de Materiales
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
              Análisis detallado del uso de materiales educativos
            </p>
          </div>
        </div>
      </div>


      {/* Selectores */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold text-base-content flex items-center space-x-2">
            <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>Seleccionar Material para Análisis</span>
          </h2>
          <div className="text-xs sm:text-sm text-base-content/70">
            {Array.isArray(materials) ? materials.length : 0} {Array.isArray(materials) && materials.length === 1 ? 'material' : 'materiales'} disponible{Array.isArray(materials) && materials.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Selector de Grado */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-base-content mb-2 flex items-center space-x-1">
              <FiAward className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
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
              className="select select-bordered w-full focus:select-primary text-xs sm:text-sm"
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
            <label className="block text-xs sm:text-sm font-medium text-base-content mb-2 flex items-center space-x-1">
              <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
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
              className="select select-bordered w-full focus:select-success text-xs sm:text-sm"
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
            <label className="block text-xs sm:text-sm font-medium text-base-content mb-2 flex items-center space-x-1">
              <FiBook className="w-3 h-3 sm:w-4 sm:h-4 text-info flex-shrink-0" />
              <span>Curso</span>
            </label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => {
                setSelectedCourse(e.target.value ? parseInt(e.target.value) : null)
                setSelectedTopic(null)
                setSelectedMaterial(null)
              }}
              className="select select-bordered w-full focus:select-info text-xs sm:text-sm"
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
            <label className="block text-xs sm:text-sm font-medium text-base-content mb-2 flex items-center space-x-1">
              <FiTarget className="w-3 h-3 sm:w-4 sm:h-4 text-warning flex-shrink-0" />
              <span>Tema</span>
            </label>
            <select
              value={selectedTopic || ''}
              onChange={(e) => {
                setSelectedTopic(e.target.value ? parseInt(e.target.value) : null)
                setSelectedMaterial(null)
              }}
              className="select select-bordered w-full focus:select-warning text-xs sm:text-sm"
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
            <label className="block text-xs sm:text-sm font-medium text-base-content mb-2 flex items-center space-x-1">
              <FiFile className="w-3 h-3 sm:w-4 sm:h-4 text-error flex-shrink-0" />
              <span>Material</span>
            </label>
            <select
              value={selectedMaterial || ''}
              onChange={(e) => setSelectedMaterial(e.target.value ? parseInt(e.target.value) : null)}
              className="select select-bordered w-full focus:select-error text-xs sm:text-sm"
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
            <label className="block text-xs sm:text-sm font-medium text-base-content mb-2 flex items-center space-x-1">
              <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
              <span>Período</span>
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
              className="select select-bordered w-full focus:select-secondary text-xs sm:text-sm"
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
          <div className="card p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                <div className="p-2 sm:p-3 bg-primary-100 rounded-lg flex-shrink-0">
                  {getMaterialTypeIcon(materialAnalytics.material_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-base-content truncate">{materialAnalytics.material_name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <FiFile className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-base-content/70">
                        <strong>Tipo:</strong> {getMaterialTypeLabel(materialAnalytics.material_type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-base-content/70">
                        <strong>Período:</strong> {getTimeRangeLabel(timeRange)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button className="btn btn-sm btn-outline btn-primary flex items-center space-x-1">
                  <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Actualizar</span>
                  <span className="sm:hidden">Actualizar</span>
                </button>
                <button className="btn btn-sm btn-outline btn-secondary flex items-center space-x-1">
                  <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">Exportar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gráficos Analíticos */}
          <AnalyticsCharts data={materialAnalytics} loading={loadingAnalytics} />
        </>
      )}

      {/* Estado de Carga */}
      {loadingAnalytics && selectedMaterial && (
        <div className="card p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col items-center justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mb-3 sm:mb-4"></div>
            <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2">Cargando Analytics</h3>
            <p className="text-xs sm:text-sm text-base-content/70 text-center">Obteniendo datos del material seleccionado...</p>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay material seleccionado */}
      {!selectedMaterial && (
        <div className="card p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="text-center py-8 sm:py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-base-200 rounded-full">
                <FiBarChart className="w-6 h-6 text-base-content/40" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-base-content mb-1">Selecciona un Material</h3>
                <p className="text-xs sm:text-sm text-base-content/70 mb-4">Elige un curso y material para ver las analytics detalladas.</p>
                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-base-content/70">
                  <FiInfo className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
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