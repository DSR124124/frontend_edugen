import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiContentApi, academicApi, GeneratedContent } from '../../api/endpoints'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { GrapesJSEditor } from '../../components/ai/GrapesJSEditor'
import { AssignMaterialModal } from '../../components/modals/AssignMaterialModal'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useTopics } from '../../hooks/useTopics'
import { useAuthStore } from '../../store/auth'

export function GeneratedContentPage() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotificationContext()
  const { user } = useAuthStore()
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assigningContent, setAssigningContent] = useState<GeneratedContent | null>(null)

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

  const handleDeleteContent = (id: number, title: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) {
      deleteContentMutation.mutate(id)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setSelectedContent(null)
  }

  const handleSaveContent = async (updatedContent: unknown) => {
    if (selectedContent) {
      try {
        await aiContentApi.updateGeneratedContent(selectedContent.id, updatedContent as any)
        queryClient.invalidateQueries({ queryKey: ['generated-content'] })
        showSuccess('Contenido Actualizado', 'El contenido se ha guardado exitosamente')
        handleCloseEditor()
      } catch (error) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contenidos Generados</h1>
              <p className="text-gray-600 mt-1">Gestiona y edita todos los contenidos educativos generados con IA</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {contents.length} contenido{contents.length !== 1 ? 's' : ''} generado{contents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contenidos generados</h3>
            <p className="text-gray-600">Los contenidos generados con IA aparecerán aquí</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-lg">📄</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {content.title || 'Sin título'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {content.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Contenido Educativo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(content.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Generado
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditContent(content)}
                            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleAssignMaterial(content)}
                            className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md hover:bg-green-50 transition-colors"
                          >
                            📤 Asignar Material
                          </button>
                          <button
                            onClick={() => handleDeleteContent(content.id, content.title || 'Sin título')}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                            disabled={deleteContentMutation.isPending}
                          >
                            🗑️ Eliminar
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
      </div>

      {/* Modal del Editor */}
      {isEditorOpen && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] mx-4 flex flex-col">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Editor de Contenido</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Editando: {selectedContent.title || 'Sin título'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCloseEditor}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>Cerrar Editor</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-50">
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
    </div>
  )
}
