import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiContentApi, academicApi, GeneratedContent } from '../../api/endpoints'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { ContentEditorModal } from '../../components/ai/ContentEditorModal'
import { AssignMaterialModal } from '../../components/modals/AssignMaterialModal'
import { ContentViewModal } from '../../components/modals/ContentViewModal'
import { DeleteContentModal } from '../../components/modals/DeleteContentModal'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useTopics } from '../../hooks/useTopics'
import { 
  FiFileText, 
  FiEdit3, 
  FiTrash2, 
  FiUpload, 
  FiCalendar,
  FiCheckCircle,
  FiEye
} from 'react-icons/fi'
import { PageLoadingState, PageErrorState } from '../../components/common'
import { Button } from '../../components/ui/Button'

export function GeneratedContentPage() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotificationContext()
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assigningContent, setAssigningContent] = useState<GeneratedContent | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingContent, setViewingContent] = useState<GeneratedContent | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingContent, setDeletingContent] = useState<GeneratedContent | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Obtener secciones y temas del profesor
  const { sections } = useProfessorSections()
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

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setSelectedContent(null)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setViewingContent(null)
  }

  const handleOpenDeleteModal = (content: GeneratedContent) => {
    setDeletingContent(content)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingContent(null)
  }

  const handleConfirmDelete = () => {
    if (deletingContent) {
      deleteContentMutation.mutate(deletingContent.id)
      handleCloseDeleteModal()
    }
  }

  const handleSaveContent = async (updatedContent: unknown) => {
    if (selectedContent) {
      setIsSaving(true)
      try {
        const contentData = updatedContent as GeneratedContent
        await aiContentApi.updateGeneratedContent(selectedContent.id, {
          title: contentData.title
        })
        
        queryClient.invalidateQueries({ queryKey: ['generated-content'] })
        showSuccess('Contenido Actualizado', 'El contenido se ha actualizado exitosamente')
        handleCloseEditor()
      } catch {
        showError('Error', 'No se pudo actualizar el contenido')
      } finally {
        setIsSaving(false)
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
    format: 'SCORM' | 'PDF' | 'HTML'
    assignmentType: 'general' | 'personalized'
    selectedStudents?: number[]
  }) => {
    if (!assigningContent) return

    try {
      const materialData = new FormData()
      materialData.append('title', data.title)
      materialData.append('description', data.description || '')
      materialData.append('section', data.sectionId.toString())
      materialData.append('material_type', data.format)
      materialData.append('assignment_type', data.assignmentType)
      
      if (data.selectedStudents && data.selectedStudents.length > 0) {
        materialData.append('selected_students', JSON.stringify(data.selectedStudents))
      }

      // Crear el contenido SCORM
      if (data.format === 'SCORM') {
        const scormContent = {
          title: data.title,
          description: data.description || '',
          html_content: assigningContent.html_content || '',
          css_content: assigningContent.css_content || '',
          js_content: assigningContent.js_content || ''
        }
        
        const blob = new Blob([JSON.stringify(scormContent)], { type: 'application/json' })
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
    return <PageLoadingState message="Cargando contenidos generados..." />
  }

  if (error) {
    return (
      <PageErrorState 
        error={error}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['generated-content'] })}
        onHome={() => window.location.href = '/dashboard'}
      />
    )
  }

  const contents = generatedContents?.data || []

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
              Contenidos Generados
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
              Gestiona y edita todos los contenidos educativos generados con IA
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-primary-100 rounded-lg flex-shrink-0">
              <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Total Contenidos</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{contents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-success-100 rounded-lg flex-shrink-0">
              <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Contenidos Activos</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{contents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-secondary-100 rounded-lg flex-shrink-0">
              <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Generados Hoy</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">
                {contents.filter(content => {
                  const today = new Date()
                  const contentDate = new Date(content.created_at)
                  return contentDate.toDateString() === today.toDateString()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenidos Grid */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold text-base-content flex items-center space-x-2">
            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>Contenidos Generados</span>
          </h2>
          <div className="text-xs sm:text-sm text-base-content/70">
            {contents.length} {contents.length === 1 ? 'contenido' : 'contenidos'} encontrado{contents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {contents.length > 0 ? (
            <>
            {/* Vista de Cards para móviles y tablets */}
            <div className="block lg:hidden space-y-4">
              {contents.map((content) => (
                <div key={content.id} className="card p-4 hover:shadow-md transition-all duration-200 w-full">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FiFileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-base-content line-clamp-2" title={content.title || 'Sin título'}>
                        {content.title || 'Sin título'}
                      </h3>
                      <p className="text-xs text-base-content/70 font-mono mt-1">
                        ID: {content.id}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-success-100 text-success rounded-full flex-shrink-0">
                      <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                      <span className="hidden sm:inline">Generado</span>
                      <span className="sm:hidden">✓</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="text-sm text-base-content/70">
                      Contenido Educativo Generado con IA
                    </div>
                    <div className="flex items-center justify-between text-sm text-base-content/70">
                      <span>ID: {content.id}</span>
                      <span>
                        {new Date(content.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleViewContent(content)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEye className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px]"
                    >
                      Ver
                    </Button>
                    <Button 
                      onClick={() => handleEditContent(content)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEdit3 className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px]"
                    >
                      Editar
                    </Button>
                    <Button 
                      onClick={() => handleAssignMaterial(content)}
                      variant="primary"
                      size="sm"
                      leftIcon={<FiUpload className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px]"
                    >
                      Asignar
                    </Button>
                    <Button 
                      onClick={() => handleOpenDeleteModal(content)}
                      variant="danger"
                      size="sm"
                      leftIcon={<FiTrash2 className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px]"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
              
              {/* Vista de Tabla para desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Contenido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Creado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-base-100 divide-y divide-base-300">
                    {contents.map((content) => (
                      <tr key={content.id} className="hover:bg-base-200/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <FiFileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-base-content">{content.title || 'Sin título'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-base-content font-mono bg-base-200 px-2 py-1 rounded">
                            {content.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-base-content">
                            Contenido Educativo
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-base-content">
                            {new Date(content.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success">
                            <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                            Generado
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              onClick={() => handleViewContent(content)}
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiEye className="w-4 h-4" />}
                            >
                              Ver
                            </Button>
                            <Button 
                              onClick={() => handleEditContent(content)}
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiEdit3 className="w-4 h-4" />}
                            >
                              Editar
                            </Button>
                            <Button 
                              onClick={() => handleAssignMaterial(content)}
                              variant="primary"
                              size="sm"
                              leftIcon={<FiUpload className="w-4 h-4" />}
                            >
                              Asignar
                            </Button>
                            <Button 
                              onClick={() => handleOpenDeleteModal(content)}
                              variant="danger"
                              size="sm"
                              leftIcon={<FiTrash2 className="w-4 h-4" />}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-base-200 rounded-full">
                  <FiFileText className="w-10 h-10 text-base-content/40" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-base-content mb-2">No hay contenidos generados</h3>
                  <p className="text-base-content/70">Los contenidos generados con IA aparecerán aquí</p>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Modales */}
      <ContentEditorModal
        content={selectedContent!}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleSaveContent}
        isSaving={isSaving}
      />

      <AssignMaterialModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        onAssign={handleAssignToSection}
        content={assigningContent}
        sections={sections}
        topics={topics}
      />

      <ContentViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        content={viewingContent}
      />

      <DeleteContentModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={deleteContentMutation.isPending}
        content={deletingContent}
      />
    </div>
  )
}