import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiContentApi, academicApi, GeneratedContent } from '../../api/endpoints'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { GrapesJSEditor } from '../../components/ai/GrapesJSEditor'
import { AssignMaterialModal } from '../../components/modals/AssignMaterialModal'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useTopics } from '../../hooks/useTopics'
import { useAuthStore } from '../../store/auth'
import { 
  FiFileText, 
  FiEdit3, 
  FiTrash2, 
  FiUpload, 
  FiX, 
  FiCalendar,
  FiCheckCircle,
  FiAlertTriangle,
  FiEye
} from 'react-icons/fi'

export function GeneratedContentPage() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotificationContext()
  const { user } = useAuthStore()
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assigningContent, setAssigningContent] = useState<GeneratedContent | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingContent, setViewingContent] = useState<GeneratedContent | null>(null)

  // Obtener secciones y temas del profesor
  const { sections, loading: loadingSections, error: sectionsError } = useProfessorSections()
  const { topics } = useTopics()
  

  // Obtener contenidos generados
  const { data: generatedContents, isLoading, error } = useQuery({
    queryKey: ['generated-content'],
    queryFn: () => aiContentApi.getGeneratedContent()
  })

  // Eliminar contenido generado
  const deleteContentMutation = useMutation({
    mutationFn: (id: number) => aiContentApi.deleteGeneratedContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-content'] })
      showSuccess('Contenido Eliminado', 'El contenido se ha eliminado exitosamente')
    },
    onError: () => {
      showError('Error', 'No se pudo eliminar el contenido')
    }
  })

  const handleEditContent = (content: GeneratedContent) => {
    setSelectedContent(content)
    setIsEditorOpen(true)
  }

  const handleViewContent = (content: GeneratedContent) => {
    setViewingContent(content)
    setIsViewModalOpen(true)
  }

  const handleDeleteContent = (id: number, title: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) {
      deleteContentMutation.mutate(id)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setSelectedContent(null)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setViewingContent(null)
  }

  const handleSaveContent = async (updatedContent: unknown) => {
    if (selectedContent) {
      try {
        await aiContentApi.updateGeneratedContent(selectedContent.id, updatedContent as Record<string, unknown>)
        queryClient.invalidateQueries({ queryKey: ['generated-content'] })
        showSuccess('Contenido Actualizado', 'El contenido se ha guardado exitosamente')
        handleCloseEditor()
      } catch {
        showError('Error', 'No se pudo guardar el contenido')
      }
    }
  }

  const handleAssignMaterial = (content: GeneratedContent) => {
    setAssigningContent(content)
    setIsAssignModalOpen(true)
  }

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false)
    setAssigningContent(null)
  }

  const handleAssignToSection = async (data: {
    sectionId: number
    title: string
    description?: string
    format: 'SCORM' | 'PDF' | 'HTML' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'LINK'
    assignmentType: 'general' | 'personalized'
    selectedStudents?: number[]
  }) => {
    if (!assigningContent) return

    try {
      // Verificar que las secciones estén cargadas
      if (loadingSections) {
        throw new Error('Las secciones aún se están cargando. Inténtalo de nuevo en unos momentos.')
      }
      
      if (sectionsError) {
        throw new Error(`Error al cargar secciones: ${sectionsError}`)
      }
      
      if (!sections || sections.length === 0) {
        throw new Error('No se encontraron secciones asignadas. Contacta al administrador.')
      }
      
      // Obtener la sección (manejar tanto números como strings)
      const section = sections.find(s => s.id == data.sectionId || s.id === data.sectionId)
      
      if (!section) {
        throw new Error(`No se pudo encontrar la sección con ID ${data.sectionId}`)
      }
      
      if (!section.course) {
        throw new Error(`La sección ${section.name} no tiene un curso asociado`)
      }

      // Obtener el primer tema del curso (o crear uno si no existe)
      let topic = topics.find(t => t.course === section.course?.id)
      if (!topic) {
        // Crear un tema por defecto para el curso
        const topicData = {
          name: 'Tema Principal',
          description: 'Tema principal del curso',
          course: section.course.id
        }
        const topicResponse = await academicApi.createTopic(topicData)
        topic = topicResponse.data
      }

      // Crear el material
      const materialData = new FormData()
      materialData.append('name', data.title)
      materialData.append('description', data.description || '')
      // Asignar el tipo de material correcto según el formato
      let materialType = 'DOCUMENT' // Por defecto
      if (data.format === 'SCORM') {
        materialType = 'SCORM'
      } else if (data.format === 'VIDEO') {
        materialType = 'VIDEO'
      } else if (data.format === 'AUDIO') {
        materialType = 'AUDIO'
      } else if (data.format === 'IMAGE') {
        materialType = 'IMAGE'
      } else if (data.format === 'LINK') {
        materialType = 'LINK'
      }
      materialData.append('material_type', materialType)
      materialData.append('topic', topic.id.toString())
      materialData.append('professor', user?.id?.toString() || '') // Campo requerido
      materialData.append('is_shared', 'true') // Material compartido para toda la sección
      
      // Si es SCORM, agregar el contenido como archivo
      if (data.format === 'SCORM') {
        // Crear un archivo temporal con el contenido SCORM
        const scormContent = JSON.stringify(assigningContent)
        const blob = new Blob([scormContent], { type: 'application/json' })
        materialData.append('file', blob, 'scorm-content.json')
      }

      await academicApi.createMaterial(materialData)

      const assignmentMessage = data.assignmentType === 'general' 
        ? `El material "${data.title}" se ha asignado a toda la sección en formato ${data.format}`
        : `El material "${data.title}" se ha asignado a ${data.selectedStudents?.length || 0} estudiante(s) en formato ${data.format}`

      showSuccess('Material Asignado', assignmentMessage)
      handleCloseAssignModal()
      
      // Refrescar la lista de contenidos generados
      queryClient.invalidateQueries({ queryKey: ['generated-content'] })
      
    } catch (error) {
      showError('Error', 'No se pudo asignar el material: ' + (error as Error).message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando contenidos generados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar contenidos</h2>
          <p className="text-gray-600">No se pudieron cargar los contenidos generados</p>
        </div>
      </div>
    )
  }

  const contents = generatedContents?.data || []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <FiFileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="headline-2xl text-base-content">
            Contenidos Generados
          </h1>
          <p className="text-small text-base-content/70">
            Gestiona y edita todos los contenidos educativos generados con IA
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="card p-4 mb-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <h3 className="headline-lg text-base-content mb-2">Cargando Contenidos</h3>
            <p className="text-small text-base-content/70">Obteniendo contenidos generados...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card p-4 mb-4">
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-error-100 rounded-full">
                <FiAlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="headline-xl text-base-content mb-1">Error al Cargar</h3>
                <p className="text-small text-base-content/70">No se pudieron cargar los contenidos generados</p>
              </div>
            </div>
          </div>
        </div>
      ) : contents.length === 0 ? (
        <div className="card p-4 mb-4">
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-base-200 rounded-full">
                <FiFileText className="w-6 h-6 text-base-content/40" />
              </div>
              <div>
                <h3 className="headline-xl text-base-content mb-1">No hay contenidos generados</h3>
                <p className="text-small text-base-content/70">Los contenidos generados con IA aparecerán aquí</p>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="headline-lg text-base-content flex items-center space-x-2">
                <FiFileText className="w-5 h-5 text-primary" />
                <span>Lista de Contenidos</span>
              </h2>
              <div className="text-small text-base-content/70">
                {contents.length} contenido{contents.length !== 1 ? 's' : ''} generado{contents.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-base-content font-semibold">Título</th>
                    <th className="text-base-content font-semibold">Tipo</th>
                    <th className="text-base-content font-semibold">Fecha de Creación</th>
                    <th className="text-base-content font-semibold">Estado</th>
                    <th className="text-base-content font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-base-50">
                      <td className="font-medium text-base-content">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <FiFileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="headline-small text-base-content">
                              {content.title || 'Sin título'}
                            </div>
                            <div className="text-small text-base-content/70">
                              ID: {content.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-base-content/70">
                        <span className="badge badge-success badge-sm">
                          Contenido Educativo
                        </span>
                      </td>
                      <td className="text-base-content/70">
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="w-4 h-4 text-primary" />
                          <span className="text-small">
                            {new Date(content.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-primary badge-sm">
                          <FiCheckCircle className="w-3 h-3 mr-1" />
                          Generado
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewContent(content)}
                            className="btn btn-ghost btn-sm flex items-center space-x-1"
                          >
                            <FiEye className="w-4 h-4" />
                            <span>Ver</span>
                          </button>
                          <button
                            onClick={() => handleEditContent(content)}
                            className="btn btn-ghost btn-sm flex items-center space-x-1"
                          >
                            <FiEdit3 className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleAssignMaterial(content)}
                            className="btn btn-outline btn-sm flex items-center space-x-1"
                          >
                            <FiUpload className="w-4 h-4" />
                            <span>Asignar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteContent(content.id, content.title || 'Sin título')}
                            className="btn btn-error btn-sm flex items-center space-x-1"
                            disabled={deleteContentMutation.isPending}
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Modal del Editor */}
      {isEditorOpen && selectedContent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed bg-black/60 backdrop-blur-md transition-opacity"></div>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative z-10 bg-base-100 rounded-lg w-full max-w-7xl h-[90vh] flex flex-col shadow-xl">
              <div className="p-4 border-b border-base-300 bg-base-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <FiEdit3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="headline-lg text-base-content">Editor de Contenido</h2>
                      <p className="text-small text-base-content/70">
                        Editando: {selectedContent.title || 'Sin título'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCloseEditor}
                      className="btn btn-ghost btn-sm flex items-center space-x-2"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cerrar Editor</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-base-200">
                <div className="h-full">
                  <GrapesJSEditor
                    content={selectedContent}
                    onSave={handleSaveContent}
                    useGrapesJS={true}
                    onToggleGrapesJS={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Asignación de Material */}
      <AssignMaterialModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        onAssign={handleAssignToSection}
        content={assigningContent}
        sections={sections}
        topics={topics}
      />

      {/* Modal de Visualización de Contenido */}
      {isViewModalOpen && viewingContent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed bg-black/60 backdrop-blur-md transition-opacity"></div>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative z-10 bg-base-100 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-xl">
              <div className="p-4 border-b border-base-300 bg-base-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <FiEye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="headline-lg text-base-content">Vista Previa del Contenido</h2>
                      <p className="text-small text-base-content/70">
                        {viewingContent.title || 'Sin título'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCloseViewModal}
                      className="btn btn-ghost btn-sm flex items-center space-x-2"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cerrar</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-base-200 p-6 overflow-y-auto">
                <div className="prose prose-lg max-w-none">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">
                      {viewingContent.title || 'Sin título'}
                    </h3>
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: viewingContent.html_content || 'No hay contenido disponible' 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
