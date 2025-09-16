import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Topic, Material } from '../../api/endpoints'
import { useAuthStore } from '../../store/auth'
import { useMyMaterialsWithAnalytics } from '../../hooks/useMaterialAnalytics'
import { MaterialViewer } from '../../components/modals/MaterialViewer'
import { Users } from 'lucide-react'
import { LoadingState, EmptyState } from '../../components/common'

export function MySectionMaterials() {
  const { user } = useAuthStore()
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isMaterialViewerOpen, setIsMaterialViewerOpen] = useState(false)
  // Obtener materiales con analytics
  const { data: materialsWithAnalytics } = useMyMaterialsWithAnalytics()

  // Usar la sección del usuario directamente
  const section = user?.section
  const loadingSection = false


  // Obtener cursos de la sección
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['section-courses', section?.id],
    queryFn: () => academicApi.getCourses().then(res => res.data),
    enabled: !!section?.id
  })

  // Obtener temas de todos los cursos de la sección
  const { data: topics, isLoading: loadingTopics } = useQuery({
    queryKey: ['section-topics', courses?.results],
    queryFn: async () => {
      if (!courses?.results) return []
      
      const allTopics: Topic[] = []
      for (const course of courses.results) {
        try {
          const response = await academicApi.getTopicsByCourse(course.id)
          allTopics.push(...response.data)
        } catch {
          // Error handling is done by the UI notification system
        }
      }
      return allTopics
    },
    enabled: !!courses?.results
  })

  // Obtener materiales de un tema específico
  const { data: materials, isLoading: loadingMaterials } = useQuery({
    queryKey: ['topic-materials', selectedTopic?.id],
    queryFn: () => academicApi.getMaterialsByTopic(selectedTopic!.id),
    enabled: !!selectedTopic
  })

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic)
  }

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material)
    setIsMaterialViewerOpen(true)
  }

  const handleCloseMaterialViewer = () => {
    setIsMaterialViewerOpen(false)
    setSelectedMaterial(null)
  }

  if (loadingSection || loadingCourses) {
    return <LoadingState message="Cargando sección..." />
  }

  if (!section) {
    return (
      <EmptyState 
        title="No tienes acceso a materiales"
        description="Contacta a tu administrador para obtener acceso."
        icon={<Users className="w-full h-full text-base-content/40" />}
      />
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Materiales</h1>
          <p className="text-gray-600 mt-1">
            Accede a todos tus materiales de estudio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Temas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Temas Disponibles</h2>
            <p className="text-sm text-gray-600 mt-1">
              Haz clic en un tema para ver sus materiales
            </p>
          </div>
          
          <div className="p-6">
            {loadingTopics ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando temas...</p>
              </div>
            ) : topics && topics.length > 0 ? (
              <div className="space-y-3">
                {topics
                  .sort((a, b) => a.order - b.order)
                  .map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedTopic?.id === topic.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleTopicClick(topic)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{topic.name}</h3>
                          {topic.description && (
                            <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                          )}
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {topic.course_name}
                            </span>
                            <span className="ml-2">
                              Prof. {topic.professor_name}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              selectedTopic?.id === topic.id ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p>No hay temas disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Materiales */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Materiales
              {selectedTopic && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  • {selectedTopic.name}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedTopic 
                ? 'Haz clic en un material para verlo'
                : 'Selecciona un tema para ver sus materiales'
              }
            </p>
          </div>
          
          <div className="p-6">
            {!selectedTopic ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Selecciona un tema para ver sus materiales</p>
              </div>
            ) : loadingMaterials ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando materiales...</p>
              </div>
            ) : materials && materials.data && materials.data.results && materials.data.results.length > 0 ? (
              <div className="space-y-3">
                {materials.data.results.map((material: Material) => (
                  <div
                    key={material.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                    onClick={() => handleMaterialClick(material)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {material.material_type === 'VIDEO' && (
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                          </div>
                        )}
                        {material.material_type === 'DOCUMENT' && (
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {material.material_type === 'AUDIO' && (
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {material.material_type === 'LINK' && (
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {!['VIDEO', 'DOCUMENT', 'AUDIO', 'LINK'].includes(material.material_type) && (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{material.name}</h3>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {material.material_type}
                          </span>
                          <span className="ml-2">
                            {material.is_shared ? 'Material de clase' : 'Material personalizado'}
                          </span>
                        </div>
                        {/* Mostrar analytics si están disponibles */}
                        {materialsWithAnalytics && materialsWithAnalytics.find(m => m.id === material.id)?.analytics && (
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.total_views || 0} vistas</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.average_duration_formatted || '0s'}</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>{materialsWithAnalytics.find(m => m.id === material.id)?.analytics?.completion_rate?.toFixed(1) || '0'}% completado</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No hay materiales disponibles para este tema</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Material Viewer Modal */}
      {isMaterialViewerOpen && selectedMaterial && (
        <MaterialViewer
          material={selectedMaterial}
          isOpen={isMaterialViewerOpen}
          onClose={handleCloseMaterialViewer}
        />
      )}

    </div>
  )
}
