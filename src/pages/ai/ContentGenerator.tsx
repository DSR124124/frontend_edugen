import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { aiContentApi, GeneratedContent } from '../../api/endpoints'
import { DeepSeekChat } from '../../components/ai/DeepSeekChat'
import { GrapesJSEditor } from '../../components/ai/GrapesJSEditor'
import { ProgressBar } from '../../components/ui/ProgressBar'

interface Requirements {
  is_complete: boolean
  course_level?: string
  subject?: string
  content_type?: string
  learning_objectives?: string[]
  duration?: string
  style?: string
  colors?: string[]
  sections?: string[]
  interactive_elements?: string[]
  target_audience?: string
  resources?: string[]
  responsive?: boolean
  [key: string]: unknown
}

export function ContentGenerator() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [currentConversation, setCurrentConversation] = useState<number | null>(null)
  const [requirements, setRequirements] = useState<Requirements | null>(null)
  const [step, setStep] = useState<'chat' | 'generate' | 'edit'>('chat')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; conversationId: number | null; conversationTitle: string }>({
    isOpen: false,
    conversationId: null,
    conversationTitle: ''
  })
  const [generationProgress, setGenerationProgress] = useState<{ isVisible: boolean; progress: number; message: string }>({
    isVisible: false,
    progress: 0,
    message: 'Generando contenido educativo...'
  })
  const [isAutoCreating, setIsAutoCreating] = useState(false)
  const [showGrapesJSSection, setShowGrapesJSSection] = useState(false)

  // Crear nueva conversación
  const createConversationMutation = useMutation({
    mutationFn: (data: { title?: string }) => aiContentApi.createConversation(data),
    onSuccess: (response) => {
      setCurrentConversation(response.data.id)
      setStep('chat')
      // Invalidar la query de conversaciones para actualizar la lista
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })

  // Enviar mensaje inicial con parámetros
  const sendInitialMessageMutation = useMutation({
    mutationFn: (data: { content: string }) => {
      if (!currentConversation) throw new Error('No conversation selected')
      return aiContentApi.sendMessage(currentConversation, data)
    },
    onSuccess: () => {
      // Invalidar mensajes para actualizar la conversación
      queryClient.invalidateQueries({ queryKey: ['messages', currentConversation] })
    }
  })

  // Efecto para manejar parámetros de URL y crear conversación automáticamente
  useEffect(() => {
    const topic = searchParams.get('topic')
    const topicName = searchParams.get('topicName')
    const courseName = searchParams.get('courseName')
    const educationalLevel = searchParams.get('educationalLevel')
    const resourceType = searchParams.get('resourceType')
    const additionalRequirements = searchParams.get('additionalRequirements')

    // Si hay parámetros de URL, crear conversación automáticamente
    if (topic && topicName && courseName && educationalLevel && resourceType && !isAutoCreating) {
      setIsAutoCreating(true)
      
      // Crear conversación con título descriptivo
      const conversationTitle = `Material: ${topicName} - ${courseName}`
      
      createConversationMutation.mutate(
        { title: conversationTitle },
        {
          onSuccess: () => {
            // Construir mensaje inicial con los parámetros
            const initialMessage = `Hola! Necesito generar material educativo con los siguientes parámetros:

📚 **Tema:** ${topicName}
🎓 **Curso:** ${courseName}
📊 **Nivel Educativo:** ${educationalLevel}
📝 **Tipo de Recurso:** ${resourceType}${additionalRequirements ? `\n➕ **Requisitos Adicionales:** ${additionalRequirements}` : ''}

Por favor, ayúdame a refinar estos requisitos y generar el material educativo personalizado.`

            // Enviar mensaje inicial
            setTimeout(() => {
              sendInitialMessageMutation.mutate({ content: initialMessage })
              // Marcar como completada la creación automática
              setIsAutoCreating(false)
            }, 1000)
          }
        }
      )
    }
  }, [searchParams, isAutoCreating, createConversationMutation, sendInitialMessageMutation])

  // Obtener conversaciones del usuario
  const { data: conversations, error: conversationsError } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => aiContentApi.getConversations()
  })


  // Extract conversations data from API response
  const conversationsData = conversations?.data || []

  // Generar contenido con streaming
  const generateContentMutation = useMutation({
    mutationFn: async (data: { requirements: Requirements; title: string }) => {
      // Mostrar barra de progreso
      setGenerationProgress({
        isVisible: true,
        progress: 0,
        message: 'Iniciando generación de contenido educativo...'
      })

      // Simular progreso inicial
      for (let i = 0; i <= 20; i += 5) {
        setGenerationProgress(prev => ({
          ...prev,
          progress: i,
          message: 'Preparando requisitos educativos...'
        }))
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Llamar al API normal
      const response = await aiContentApi.generateContent(currentConversation!, data)
      
      // Simular progreso final
      for (let i = 25; i <= 100; i += 15) {
        setGenerationProgress(prev => ({
          ...prev,
          progress: i,
          message: i < 80 ? 'Generando contenido educativo...' : 'Finalizando contenido...'
        }))
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Ocultar barra de progreso
      setGenerationProgress(prev => ({ ...prev, isVisible: false }))
      
      return response
    },
    onSuccess: (response) => {
      setGeneratedContent(response.data.content)
      setStep('edit')
    },
    onError: () => {
      setGenerationProgress(prev => ({ ...prev, isVisible: false }))
    }
  })

  // Eliminar conversación
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: number) => aiContentApi.deleteConversation(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidar la query de conversaciones para actualizar la lista
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      // Si la conversación eliminada era la actual, limpiar el estado
      if (currentConversation === conversationId) {
        setCurrentConversation(null)
        setStep('chat')
        setRequirements(null)
        setGeneratedContent(null)
      }
    }
  })

  const handleRequirementsExtracted = (req: unknown) => {
    setRequirements(req as Requirements)
    if (req && typeof req === 'object' && 'is_complete' in req && req.is_complete) {
      setStep('generate')
    }
  }

  const handleStartNewChat = () => {
    createConversationMutation.mutate({ title: `Conversación ${new Date().toLocaleString()}` })
  }

  const handleGenerateContent = () => {
    if (currentConversation) {
      // Obtener la conversación actual para acceder a sus requisitos
      const conversation = conversationsData.find(c => c.id === currentConversation)
      if (conversation && conversation.requirements) {
        generateContentMutation.mutate({
          requirements: conversation.requirements as Requirements,
          title: `Contenido generado - ${new Date().toLocaleString()}`
        })
      }
    }
  }

  const handleBackToChat = () => {
    setStep('chat')
    setGeneratedContent(null)
    // No limpiar requirements para mantener el contexto de la conversación
  }

  const hasContent = (content: unknown): content is string => {
    return typeof content === 'string' && content.trim() !== ''
  }



  const handleDeleteConversation = (conversationId: number, conversationTitle: string) => {
    setDeleteModal({
      isOpen: true,
      conversationId,
      conversationTitle
    })
  }

  const confirmDelete = () => {
    if (deleteModal.conversationId) {
      deleteConversationMutation.mutate(deleteModal.conversationId)
      setDeleteModal({ isOpen: false, conversationId: null, conversationTitle: '' })
    }
  }

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, conversationId: null, conversationTitle: '' })
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Indicador de creación automática */}
      {isAutoCreating && (
        <div className="absolute top-0 left-0 right-0 bg-blue-50 border-l-4 border-blue-400 p-4 z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Creando conversación automática...</strong> Se está configurando una nueva conversación con los parámetros del tema y curso seleccionados.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar con conversaciones */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b space-y-3">
          <button
            onClick={handleStartNewChat}
            disabled={createConversationMutation.isPending}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {createConversationMutation.isPending ? 'Creando...' : 'Nueva Conversación'}
          </button>
          
          <Link
            to="/generated-content"
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center text-sm font-medium"
          >
            📚 Ver Contenido Generado
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="font-semibold mb-4 text-gray-800">Conversaciones</h4>
          
          {conversationsError && (
            <div className="text-center text-red-500 py-8">
              <div className="text-4xl mb-2">⚠️</div>
              <p>Error al cargar conversaciones</p>
              <p className="text-sm">Intenta recargar la página</p>
            </div>
          )}
          
          {deleteConversationMutation.isPending && (
            <div className="text-center text-blue-600 py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm">Eliminando conversación...</p>
            </div>
          )}
          
          {!conversationsError && Array.isArray(conversationsData) && conversationsData.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-md mb-2 transition-colors ${
                currentConversation === conv.id
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setCurrentConversation(conv.id)
                  setStep('chat')
                }}
              >
                <h5 className="font-medium text-gray-800">
                  {conv.title || 'Sin título'}
                </h5>
                <p className="text-sm text-gray-500">
                  {new Date(conv.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {conv.messages_count} mensaje{conv.messages_count !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex justify-end mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteConversation(conv.id, conv.title || 'Sin título')
                  }}
                  disabled={deleteConversationMutation.isPending}
                  className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Eliminar conversación"
                >
                  {deleteConversationMutation.isPending ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
          
          {!conversationsError && Array.isArray(conversationsData) && conversationsData.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💬</div>
              <p>No hay conversaciones</p>
              <p className="text-sm">Crea una nueva para comenzar</p>
            </div>
          )}
          
          {!conversationsError && !Array.isArray(conversationsData) && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">⏳</div>
              <p>Cargando conversaciones...</p>
            </div>
          )}
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {step === 'chat' && (
          <DeepSeekChat
            conversationId={currentConversation || undefined}
            onRequirementsExtracted={handleRequirementsExtracted}
          />
        )}
        
        {step === 'generate' && requirements && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Requisitos Recolectados</h2>
                <button
                  onClick={handleBackToChat}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Volver al Chat
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Información Educativa</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Nivel del curso:</span>
                      <span className="ml-2 text-gray-800">{String(requirements.course_level || 'No especificado')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Materia/Tema:</span>
                      <span className="ml-2 text-gray-800">{String(requirements.subject || 'No especificado')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tipo de contenido:</span>
                      <span className="ml-2 text-gray-800">{String(requirements.content_type || 'No especificado')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Duración:</span>
                      <span className="ml-2 text-gray-800">{String(requirements.duration || 'No especificada')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Público objetivo:</span>
                      <span className="ml-2 text-gray-800">{String(requirements.target_audience || 'No especificado')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Objetivos y Elementos</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Objetivos de aprendizaje:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray(requirements.learning_objectives) ? requirements.learning_objectives.map((objective: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {objective}
                          </span>
                        )) : <span className="text-gray-500">No especificados</span>}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Secciones:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray(requirements.sections) ? requirements.sections.map((section: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                            {section}
                          </span>
                        )) : <span className="text-gray-500">No especificadas</span>}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Elementos interactivos:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray(requirements.interactive_elements) ? requirements.interactive_elements.map((element: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                            {element}
                          </span>
                        )) : <span className="text-gray-500">No especificados</span>}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Recursos necesarios:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray(requirements.resources) ? requirements.resources.map((resource: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                            {resource}
                          </span>
                        )) : <span className="text-gray-500">No especificados</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Diseño Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="font-medium text-gray-600">Estilo:</span>
                    <span className="ml-2 text-gray-800">{String(requirements.style || 'No especificado')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Colores:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Array.isArray(requirements.colors) ? requirements.colors.map((color: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {color}
                        </span>
                      )) : <span className="text-gray-500">No especificados</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              {hasContent(requirements.content) && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Contenido Específico</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-800 whitespace-pre-wrap">{String(requirements.content)}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex flex-col items-center space-y-4">
                <button
                  onClick={handleGenerateContent}
                  disabled={generateContentMutation.isPending}
                  className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {generateContentMutation.isPending ? 'Generando...' : 'Generar Contenido Educativo'}
                </button>
                
                {generateContentMutation.isPending && (
                  <div className="text-center text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-sm">Generando contenido educativo interactivo...</p>
                    <p className="text-xs text-gray-500">Esto puede tomar hasta 2 minutos</p>
                    <p className="text-xs text-blue-600 mt-2">Se abrirá el editor automáticamente</p>
                    <p className="text-xs text-green-600 mt-1">Podrás continuar el chat después de editar</p>
                  </div>
                )}
                
                {generateContentMutation.error && (
                  <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">
                    <div className="text-4xl mb-2">⚠️</div>
                    <p className="font-medium">Error al generar contenido</p>
                    <p className="text-sm mb-2">
                      {generateContentMutation.error.message || 'Error desconocido'}
                    </p>
                    <button
                      onClick={() => generateContentMutation.reset()}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {step === 'edit' && generatedContent && !showGrapesJSSection && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Editor de Contenido Educativo</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Edita tu contenido educativo generado
                  </p>
                  {currentConversation && (
                    <div className="mt-2 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <span className="mr-1">💬</span>
                      <span>Conversación activa: #{currentConversation}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowGrapesJSSection(true)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <span>🎨</span>
                    <span>Usar GrapesJS</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-50">
              <div className="h-full">
                <GrapesJSEditor
                  content={generatedContent}
                  onSave={() => {
                    // Aquí guardarías el contenido editado
                  }}
                  useGrapesJS={false}
                  onToggleGrapesJS={() => setShowGrapesJSSection(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Nueva Sección GrapesJS */}
        {showGrapesJSSection && generatedContent && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Editor Visual GrapesJS</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Editor visual avanzado para crear contenido educativo interactivo
                  </p>
                  {currentConversation && (
                    <div className="mt-2 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <span className="mr-1">💬</span>
                      <span>Conversación activa: #{currentConversation}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowGrapesJSSection(false)
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>Volver al Editor Simple</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-50">
              <div className="h-full">
                <GrapesJSEditor
                  content={generatedContent}
                  onSave={() => {
                    // Aquí guardarías el contenido editado
                  }}
                  useGrapesJS={true}
                  onToggleGrapesJS={() => setShowGrapesJSSection(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de progreso para generación de contenido */}
      <ProgressBar
        progress={generationProgress.progress}
        message={generationProgress.message}
        isVisible={generationProgress.isVisible}
      />

      {/* Modal de confirmación para eliminar conversación */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="text-red-600 text-2xl mr-3">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800">
                Eliminar Conversación
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar la conversación <strong>"{deleteModal.conversationTitle}"</strong>? 
              Esta acción no se puede deshacer y se eliminarán todos los mensajes y contenido generado.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deleteConversationMutation.isPending}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConversationMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deleteConversationMutation.isPending ? (
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
