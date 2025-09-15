import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Material } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { AnalyticsCharts } from '../../components/charts/AnalyticsCharts'

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
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
        <p className="text-gray-600">Solo los profesores pueden acceder a esta página.</p>
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
      'SCORM': '📚',
      'VIDEO': '🎥',
      'AUDIO': '🎵',
      'IMAGE': '🖼️',
      'DOCUMENT': '📄',
      'LINK': '🔗',
      'OTHER': '📋'
    }
    return icons[type as keyof typeof icons] || '📋'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics de Materiales</h1>
            <p className="text-gray-600 mt-1">Análisis detallado del uso de materiales educativos</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Selectores */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Material para Análisis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Selector de Grado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
            <select
              value={selectedGradeLevel || ''}
              onChange={(e) => {
                setSelectedGradeLevel(e.target.value ? parseInt(e.target.value) : null)
                setSelectedSection(null)
                setSelectedCourse(null)
                setSelectedTopic(null)
                setSelectedMaterial(null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
            <select
              value={selectedSection || ''}
              onChange={(e) => {
                setSelectedSection(e.target.value ? parseInt(e.target.value) : null)
                setSelectedCourse(null)
                setSelectedTopic(null)
                setSelectedMaterial(null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => {
                setSelectedCourse(e.target.value ? parseInt(e.target.value) : null)
                setSelectedTopic(null)
                setSelectedMaterial(null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
            <select
              value={selectedTopic || ''}
              onChange={(e) => {
                setSelectedTopic(e.target.value ? parseInt(e.target.value) : null)
                setSelectedMaterial(null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
            <select
              value={selectedMaterial || ''}
              onChange={(e) => setSelectedMaterial(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingMaterials || !selectedTopic}
            >
              <option value="">Seleccionar material...</option>
              {Array.isArray(materials) && materials.map((material: Material) => (
                <option key={material.id} value={material.id}>
                  {getMaterialTypeIcon(material.material_type)} {material.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Rango de Tiempo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getMaterialTypeIcon(materialAnalytics.material_type)}</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{materialAnalytics.material_name}</h3>
                <p className="text-gray-600">
                  Tipo: {getMaterialTypeLabel(materialAnalytics.material_type)} • 
                  Período: {getTimeRangeLabel(timeRange)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos Analíticos */}
          <AnalyticsCharts data={materialAnalytics} loading={loadingAnalytics} />
        </>
      )}

      {/* Estado de Carga */}
      {loadingAnalytics && selectedMaterial && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando analytics del material...</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay material seleccionado */}
      {!selectedMaterial && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un Material</h3>
            <p className="text-gray-600">Elige un curso y material para ver las analytics detalladas.</p>
          </div>
        </div>
      )}
    </div>
  )
}