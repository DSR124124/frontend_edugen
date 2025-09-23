import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiContentApi, GeneratedContent } from '../../api/endpoints'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { GammaEditor } from '../../components/editor/GammaEditor'
import { PreviewModal } from '../../components/editor/PreviewModal'
import { Document, createBlock, Block, ParagraphBlock } from '../../types/block-schema'
import { 
  FiFileText, 
  FiEdit3, 
  FiTrash2, 
  FiEye,
  FiCalendar,
  FiCheckCircle,
  FiPlus,
  FiDownload,
  FiX,
  FiUserCheck
} from 'react-icons/fi'
import { PageLoadingState, PageErrorState } from '../../components/common'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { AssignMaterialModal } from '../../components/modals/AssignMaterialModal'

export function GeneratedContentPage() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotificationContext()
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingContent, setDeletingContent] = useState<GeneratedContent | null>(null)
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assigningContent, setAssigningContent] = useState<GeneratedContent | null>(null)

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
      showSuccess('Contenido eliminado exitosamente', 'success')
      setIsDeleteModalOpen(false)
      setDeletingContent(null)
    },
    onError: (error: Error) => {
      showError('Error al eliminar contenido: ' + (error.message || 'Error desconocido'), 'error')
    }
  })

  // Actualizar contenido generado
  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GeneratedContent> }) => 
      aiContentApi.updateGeneratedContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-content'] })
      showSuccess('Contenido actualizado exitosamente', 'success')
    },
    onError: (error: Error) => {
      showError('Error al actualizar contenido: ' + (error.message || 'Error desconocido'), 'error')
    }
  })

  // Convertir GeneratedContent a Document para el editor Gamma
  const convertToDocument = (content: GeneratedContent): Document => {
    let blocks: Block[] = []

    // Si tiene bloques Gamma, usarlos
    if (content.gamma_blocks && Array.isArray(content.gamma_blocks)) {
      blocks = content.gamma_blocks as Block[]
    } 
    // Si tiene documento Gamma, usar sus bloques
    else if (content.gamma_document && content.gamma_document.blocks) {
      blocks = content.gamma_document.blocks as Block[]
    }
    // Si no tiene bloques Gamma, crear un bloque de párrafo vacío
    else {
      blocks = [
        createBlock<ParagraphBlock>('paragraph', {
          content: 'Contenido vacío',
          props: { padding: 'medium' }
        })
      ]
    }


    return {
      id: `doc_${content.id}`,
      title: content.title,
      description: content.description || '',
      blocks,
      metadata: {
        author: content.user_name,
        tags: ['generado', 'ia'],
        category: 'educativo',
        difficulty: 'intermediate',
        estimatedTime: 30,
        language: 'es'
      },
      settings: {
        theme: 'light',
        fontSize: 'medium',
        showOutline: true,
        allowComments: true,
        allowCollaboration: false
      },
      createdAt: content.created_at,
      updatedAt: content.updated_at,
      version: 1
    }
  }

  // Convertir Document a GeneratedContent para guardar
  const convertFromDocument = (document: Document): Partial<GeneratedContent> => {
    const data = {
      title: document.title,
      description: document.description,
      content_type: 'gamma' as const,
      gamma_blocks: document.blocks,
      gamma_document: {
        id: document.id,
        title: document.title,
        description: document.description,
        blocks: document.blocks,
        metadata: document.metadata,
        settings: document.settings,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        version: document.version
      }
    }
    
    return data
  }

  const handleEditContent = (content: GeneratedContent) => {
    setSelectedContent(content)
    setCurrentDocument(convertToDocument(content))
    setIsEditorModalOpen(true)
  }

  const handleViewContent = (content: GeneratedContent) => {
    setSelectedContent(content)
    setIsPreviewModalOpen(true)
  }

  const handleDeleteContent = (content: GeneratedContent) => {
    setDeletingContent(content)
    setIsDeleteModalOpen(true)
  }

  const handleAssignContent = (content: GeneratedContent) => {
    setAssigningContent(content)
    setIsAssignModalOpen(true)
  }

  const handleCloseEditorModal = () => {
    setIsEditorModalOpen(false)
    setSelectedContent(null)
    setCurrentDocument(null)
  }

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false)
    setSelectedContent(null)
    setCurrentDocument(null)
  }

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false)
    setAssigningContent(null)
  }

  const handleAssignMaterial = async (data: {
    sectionId: number
    title: string
    description?: string
    format: 'SCORM' | 'PDF' | 'HTML'
    assignmentType: 'general' | 'personalized'
    selectedStudents?: number[]
  }) => {
    try {
      // Aquí iría la lógica para asignar el material
      console.log('Assigning material with data:', data)
      showSuccess('Material asignado exitosamente', 'success')
      handleCloseAssignModal()
    } catch (error) {
      showError('Error al asignar material: ' + (error as Error).message, 'error')
    }
  }


  const confirmDelete = () => {
    if (deletingContent) {
      deleteContentMutation.mutate(deletingContent.id)
    }
  }

  const handleSaveDocument = async (document: Document) => {
    if (!selectedContent) return

    try {
      const updatedData = convertFromDocument(document)
      
      await updateContentMutation.mutateAsync({
        id: selectedContent.id,
        data: updatedData
      })
      
      // Cerrar el modal después de guardar exitosamente
      handleCloseEditorModal()
      
      // La notificación de éxito se maneja en la mutación updateContentMutation
    } catch (error) {
      console.error('Error saving document:', error)
      showError('Error al guardar el documento: ' + (error as Error).message, 'error')
    }
  }

  const handleExportContent = async (content: GeneratedContent) => {
    try {
      // Usar fetch para enviar la petición con headers correctos
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/v1/scorm/export/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content_id: content.id
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      // Obtener el archivo ZIP
      const blob = await response.blob()
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${content.title.replace(/\s+/g, '_')}_scorm.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Solo mostrar una notificación de éxito al final
      showSuccess('Paquete SCORM descargado exitosamente', 'success')
      
    } catch (error) {
      showError('Error al exportar contenido SCORM: ' + (error as Error).message, 'error')
    }
  }


  if (isLoading) return <PageLoadingState message="Cargando contenidos generados..." />
  if (error) return <PageErrorState error={error as Error} />

  const contents = generatedContents?.data || []



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FiFileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">
              Contenidos Generados
            </h1>
            <p className="text-base-content/70">
              Gestiona y edita el contenido generado por IA
            </p>
          </div>
        </div>
        <Button
          onClick={() => window.location.href = '/ai-content'}
          leftIcon={<FiPlus className="w-4 h-4" />}
        >
          Generar Nuevo
        </Button>
      </div>

      {/* Content List */}
      {contents.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-base-200 rounded-full">
              <FiFileText className="w-8 h-8 text-base-content/40" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                No hay contenidos generados
              </h3>
              <p className="text-base-content/70 mb-4">
                Genera tu primer contenido educativo con IA
              </p>
              <Button
                onClick={() => window.location.href = '/ai-content'}
                leftIcon={<FiPlus className="w-4 h-4" />}
              >
                Generar Contenido
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {contents.map((content) => (
            <Card key={content.id} className="p-4 md:p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary-300">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                      <FiFileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base-content truncate text-sm md:text-base">
                        {content.title}
                      </h3>
                      <p className="text-xs md:text-sm text-base-content/70 truncate">
                        {content.user_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleViewContent(content)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                      title="Vista previa"
                    >
                      <FiEye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handleAssignContent(content)}
                      className="p-1.5 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                      title="Asignar contenido"
                    >
                      <FiUserCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handleEditContent(content)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <FiEdit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(content)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>

                {content.description && (
                  <p className="text-xs md:text-sm text-base-content/70 mb-3 line-clamp-2 flex-1">
                    {content.description}
                  </p>
                )}

                <div className="mt-auto">
                  <div className="flex flex-col space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs text-base-content/60">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-3 h-3" />
                        <span className="truncate">{new Date(content.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiCheckCircle className="w-3 h-3" />
                        <span className="truncate">{content.content_type || 'HTML'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-base-content/50">
                      ID: {content.id}
                    </span>
                    <button
                      onClick={() => handleExportContent(content)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                      title="Exportar como SCORM"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && deletingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Eliminar Contenido
              </h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar <strong>"{deletingContent.title}"</strong>? 
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteContentMutation.isPending}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteContentMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteContentMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Editor Gamma */}
      {isEditorModalOpen && selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseEditorModal}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] max-w-7xl flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <FiFileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedContent.title}
                </h2>
              </div>
               <div className="flex items-center space-x-2">
                 <button
                   onClick={handleCloseEditorModal}
                   className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                 >
                   <FiX className="w-5 h-5" />
                 </button>
               </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-auto">
              <GammaEditor
                document={currentDocument || convertToDocument(selectedContent)}
                onSave={handleSaveDocument}
                onUpdate={(doc) => {
                  console.log('GammaEditor onUpdate called with document:', doc)
                  setCurrentDocument(doc)
                  setSelectedContent(prev => prev ? {
                    ...prev,
                    title: doc.title,
                    description: doc.description,
                    gamma_blocks: doc.blocks,
                    gamma_document: {
                      id: doc.id,
                      title: doc.title,
                      description: doc.description,
                      blocks: doc.blocks,
                      metadata: doc.metadata,
                      settings: doc.settings,
                      createdAt: doc.createdAt,
                      updatedAt: doc.updatedAt,
                      version: doc.version
                    }
                  } : null)
                }}
                enableAI={true}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
        onEdit={() => {
          // Mantener el currentDocument actualizado al regresar al editor
          if (currentDocument) {
            setCurrentDocument(currentDocument)
          }
          setIsPreviewModalOpen(false)
          setIsEditorModalOpen(true)
        }}
        document={currentDocument || (selectedContent ? convertToDocument(selectedContent) : null)}
        title={selectedContent?.title || ''}
      />

      {/* Modal de Asignación de Material */}
      <AssignMaterialModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        onAssign={handleAssignMaterial}
        content={assigningContent}
      />
    </div>
  )
}