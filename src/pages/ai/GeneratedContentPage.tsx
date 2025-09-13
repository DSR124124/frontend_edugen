import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { aiContentApi, GeneratedContent } from '../../api/endpoints'
import { BasicVisualEditor } from '../../components/editor-tools/BasicVisualEditor'

export function GeneratedContentPage() {
  const queryClient = useQueryClient()
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    contentId: number | null
    title: string
  }>({
    isOpen: false,
    contentId: null,
    title: ''
  })

  // Obtener todo el contenido generado
  const { data: generatedContent, isLoading, error } = useQuery({
    queryKey: ['generated-content'],
    queryFn: () => aiContentApi.getGeneratedContent()
  })

  // Eliminar contenido generado
  const deleteContentMutation = useMutation({
    mutationFn: (contentId: number) => aiContentApi.deleteGeneratedContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-content'] })
    }
  })

  const handleEditContent = (content: GeneratedContent) => {
    setSelectedContent(content)
    setIsEditorOpen(true)
  }

  const handleDeleteContent = (contentId: number, title: string) => {
    setDeleteModal({
      isOpen: true,
      contentId,
      title
    })
  }

  const confirmDelete = () => {
    if (deleteModal.contentId) {
      deleteContentMutation.mutate(deleteModal.contentId)
      setDeleteModal({
        isOpen: false,
        contentId: null,
        title: ''
      })
    }
  }

  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      contentId: null,
      title: ''
    })
  }

  const handleSaveContent = async (updatedContent: unknown) => {
    if (selectedContent) {
      try {
        await aiContentApi.updateGeneratedContent(selectedContent.id, updatedContent as GeneratedContent)
        queryClient.invalidateQueries({ queryKey: ['generated-content'] })
        setIsEditorOpen(false)
        setSelectedContent(null)
        // Mostrar notificación de éxito
        console.log('✅ Contenido guardado exitosamente')
      } catch (error) {
        console.error('Error al guardar contenido:', error)
        console.error(`❌ Error al guardar contenido: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando contenido generado...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar contenido</h2>
          <p className="text-gray-600">No se pudo cargar el contenido generado</p>
        </div>
      </div>
    )
  }

  const contentList = generatedContent?.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contenido Educativo Generado</h1>
              <p className="text-gray-600 mt-1">Gestiona y edita tu contenido educativo creado con IA</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {contentList.length} contenido{contentList.length !== 1 ? 's' : ''} generado{contentList.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {contentList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contenido generado</h3>
            <p className="text-gray-600 mb-6">Comienza creando contenido educativo con IA</p>
            <Link
              to="/ai-content"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              🎓 Ir a Generador de Contenido
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentList.map((content) => (
              <div key={content.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {content.title}
                    </h3>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEditContent(content)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content.id, content.title)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        disabled={deleteContentMutation.isPending}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">Conversación:</span>
                      <span className="ml-2">#{content.conversation}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Creado:</span>
                      <span className="ml-2">{new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Estado:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        content.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {content.is_public ? 'Público' : 'Privado'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>HTML: {content.html_content?.length || 0} chars</span>
                      <span>CSS: {content.css_content?.length || 0} chars</span>
                      <span>JS: {content.js_content?.length || 0} chars</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && selectedContent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsEditorOpen(false)}></div>
          <div className="relative flex flex-col h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Editando: {selectedContent.title}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <BasicVisualEditor
                content={selectedContent}
                onSave={handleSaveContent}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar contenido */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="text-red-600 text-2xl mr-3">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800">
                Eliminar Contenido
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar <strong>"{deleteModal.title}"</strong>? 
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deleteContentMutation.isPending}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteContentMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deleteContentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneratedContentPage
