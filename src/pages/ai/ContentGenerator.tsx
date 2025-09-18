import { useState, useEffect, useMemo, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { aiContentApi } from '../../api/endpoints'
import { DeepSeekChat } from '../../components/ai/DeepSeekChat'
import { LoadingOverlay, LoadingCard } from '../../components/ui/LoadingSpinner'
import { 
  FiMessageCircle,
  FiUsers,
  FiBook,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi'


export function ContentGenerator() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [currentConversation, setCurrentConversation] = useState<number | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; conversationId: number | null; conversationTitle: string }>({
    isOpen: false,
    conversationId: null,
    conversationTitle: ''
  })
  const [isAutoCreating, setIsAutoCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [requirements, setRequirements] = useState<Record<string, unknown> | null>(null)
  const [showGenerateButton, setShowGenerateButton] = useState(false)
  const hasProcessedUrlParams = useRef(false)

  // Crear nueva conversación
  const createConversationMutation = useMutation({
    mutationFn: (data: { title?: string }) => aiContentApi.createConversation(data),
    onSuccess: (response) => {
      setCurrentConversation(response.data.id)
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

  // Obtener conversaciones del usuario
  const { data: conversations, error: conversationsError } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => aiContentApi.getConversations()
  })

  // Extract conversations data from API response
  const conversationsData = useMemo(() => conversations?.data || [], [conversations?.data])

  // Efecto para manejar parámetros de URL y crear conversación automáticamente
  useEffect(() => {
    const conversationId = searchParams.get('conversationId')
    const topic = searchParams.get('topic')
    const topicName = searchParams.get('topicName')
    const courseName = searchParams.get('courseName')
    const educationalLevel = searchParams.get('educationalLevel')
    const resourceType = searchParams.get('resourceType')
    const additionalRequirements = searchParams.get('additionalRequirements')


    // Si hay un conversationId específico, usarlo directamente
    if (conversationId && !currentConversation && conversationsData) {
      setCurrentConversation(Number(conversationId))
      return
    }

    // Solo procesar si hay parámetros de URL, no hemos procesado aún, y tenemos las conversaciones cargadas
    if (topic && topicName && courseName && educationalLevel && resourceType && !hasProcessedUrlParams.current && conversationsData && !isAutoCreating && !conversationId) {
      hasProcessedUrlParams.current = true
      
      // Crear conversación con título descriptivo
      const conversationTitle = `Material: ${topicName} - ${courseName}`
      
      // Verificar si ya existe una conversación con el mismo título
      const existingConversation = conversationsData?.find(conv => 
        conv.title === conversationTitle && conv.is_active
      )
      
      if (existingConversation) {
        // Usar la conversación existente
        setCurrentConversation(existingConversation.id)
      } else {
        // Crear nueva conversación
        setIsAutoCreating(true)
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
    }
  }, [searchParams, conversationsData, isAutoCreating, currentConversation, createConversationMutation, sendInitialMessageMutation])

  // Resetear el flag cuando cambien los parámetros de URL
  useEffect(() => {
    hasProcessedUrlParams.current = false
  }, [searchParams])


  // Eliminar conversación
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: number) => aiContentApi.deleteConversation(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidar la query de conversaciones para actualizar la lista
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      // Si la conversación eliminada era la actual, limpiar el estado
      if (currentConversation === conversationId) {
        setCurrentConversation(null)
      }
    }
  })


  const handleStartNewChat = () => {
    createConversationMutation.mutate({ title: `Conversación ${new Date().toLocaleString()}` })
  }

  const handleViewGeneratedContent = () => {
    navigate('/generated-content')
  }

  // Generar contenido automáticamente
  const generateContentMutation = useMutation({
    mutationFn: async (data: { requirements: Record<string, unknown>; title: string }) => {
      // Starting content generation
      
      if (!currentConversation) throw new Error('No conversation selected')
      return aiContentApi.generateContent(currentConversation, data)
    },
    onSuccess: () => {
      // Redirigir a contenidos generados
      navigate('/generated-content')
    },
    onError: () => {
      setIsGenerating(false)
    }
  })


  const handleRequirementsExtracted = (req: unknown) => {
    // Si el backend envía requisitos reales, usarlos directamente
    if (req && typeof req === 'object') {
      setRequirements(req as Record<string, unknown>)
      setShowGenerateButton(true)
      return
    }
    
    // Si el backend envía true (compatibilidad), crear requisitos básicos
    if (req === true) {
      const basicRequirements = {
        subject: 'Contenido educativo',
        course_level: 'básico',
        content_type: 'lección',
        learning_objectives: ['Aprender el tema'],
        is_complete: true
      }
      setRequirements(basicRequirements)
      setShowGenerateButton(true)
      return
    }
  }

  const handleGenerateContent = () => {
    if (currentConversation && requirements) {
      setIsGenerating(true)
      generateContentMutation.mutate({
        requirements: requirements,
        title: `Contenido SCORM - ${new Date().toLocaleString()}`
      })
    }
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
    <div className="space-y-4">
      {/* Loading overlay para creación automática */}
      <LoadingOverlay 
        isVisible={isAutoCreating}
        message="Creando conversación automática... Se está configurando una nueva conversación con los parámetros del tema y curso seleccionados."
      />
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <FiMessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="headline-2xl text-base-content">
            Asistente de Contenido Educativo IA
          </h1>
          <p className="text-small text-base-content/70">
            Chatea con la IA para definir requisitos y genera contenido educativo personalizado
          </p>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Sidebar con conversaciones */}
        <div className="w-80 card p-4 flex flex-col">
          <div className="space-y-4 mb-6 flex-shrink-0">
            <h2 className="headline-lg text-base-content mb-4 flex items-center space-x-2">
              <FiPlus className="w-5 h-5 text-primary" />
              <span>Acciones</span>
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={handleStartNewChat}
                disabled={createConversationMutation.isPending}
                className="btn btn-primary w-full btn-lg gap-2"
              >
                {createConversationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="w-5 h-5" />
                    <span>Nueva Conversación</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleViewGeneratedContent}
                className="btn btn-outline btn-secondary w-full btn-lg gap-2"
              >
                <FiBook className="w-5 h-5" />
                <span>Ver Contenido Generado</span>
              </button>
            </div>
          </div>
        
          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="headline-lg text-base-content mb-3 flex items-center space-x-2 flex-shrink-0">
              <FiMessageCircle className="w-5 h-5 text-accent" />
              <span>Conversaciones</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {conversationsError && (
                <div className="alert alert-error">
                  <FiAlertTriangle className="w-5 h-5" />
                  <div>
                    <h3 className="font-bold">Error al cargar conversaciones</h3>
                    <div className="text-xs">Intenta recargar la página</div>
                  </div>
                </div>
              )}
              
              {deleteConversationMutation.isPending && (
                <div className="alert alert-info">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-info"></div>
                  <span className="text-sm">Eliminando conversación...</span>
                </div>
              )}
            
              {!conversationsError && Array.isArray(conversationsData) && conversationsData.map((conv) => (
                <div
                  key={conv.id}
                  className={`card p-3 cursor-pointer transition-all duration-200 ${
                    currentConversation === conv.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    setCurrentConversation(conv.id)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiMessageCircle className={`w-4 h-4 ${
                          currentConversation === conv.id ? 'text-primary' : 'text-base-content/70'
                        }`} />
                        <h5 className={`font-medium truncate ${
                          currentConversation === conv.id ? 'text-primary' : 'text-base-content'
                        }`}>
                          {conv.title || 'Sin título'}
                        </h5>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-base-content/70">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-3 h-3" />
                          <span>{new Date(conv.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-3 h-3" />
                          <span>{conv.messages_count} mensaje{conv.messages_count !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteConversation(conv.id, conv.title || 'Sin título')
                      }}
                      disabled={deleteConversationMutation.isPending}
                      className="btn btn-sm btn-ghost btn-circle text-error hover:bg-error/10"
                      title="Eliminar conversación"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            
              {!conversationsError && Array.isArray(conversationsData) && conversationsData.length === 0 && (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-base-200 rounded-full">
                      <FiMessageCircle className="w-6 h-6 text-base-content/40" />
                    </div>
                    <div>
                      <h3 className="headline-xl text-base-content mb-1">No hay conversaciones</h3>
                      <p className="text-small text-base-content/70 mb-4">Crea una nueva para comenzar</p>
                      <div className="flex items-center justify-center space-x-2 text-small text-base-content/70">
                        <FiInfo className="w-4 h-4" />
                        <span>Usa el botón "Nueva Conversación" para empezar</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!conversationsError && !Array.isArray(conversationsData) && (
                <LoadingCard 
                  isVisible={true}
                  message="Cargando conversaciones..."
                  className="py-8"
                />
              )}
            </div>
          </div>
        </div>

        {/* Área principal */}
        <div className="flex-1 card p-4">
          {(
            <>
              <DeepSeekChat
                conversationId={currentConversation || undefined}
                onRequirementsExtracted={handleRequirementsExtracted}
                showGenerateButton={showGenerateButton}
                onGenerateContent={handleGenerateContent}
                isGenerating={isGenerating}
              />
              
              {/* Loading spinner para generación automática */}
              {isGenerating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <div className="text-center">
                        <h3 className="headline-lg text-base-content mb-2">Generando Contenido SCORM</h3>
                        <p className="text-small text-base-content/70 mb-2">Creando contenido educativo interactivo para GrapesJS...</p>
                        <p className="text-xs text-accent">Te redirigiremos automáticamente</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </>
          )}
        
        
        </div>
      </div>


      {/* Modal de confirmación para eliminar conversación */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={cancelDelete}></div>
          <div className="relative bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-error-100 rounded-lg mr-3">
                <FiAlertTriangle className="w-6 h-6 text-error" />
              </div>
              <h3 className="headline-lg text-base-content">
                Eliminar Conversación
              </h3>
            </div>
            
            <p className="text-base-content/70 mb-6">
              ¿Estás seguro de que quieres eliminar la conversación <strong>"{deleteModal.conversationTitle}"</strong>? 
              Esta acción no se puede deshacer y se eliminarán todos los mensajes de esta conversación.
            </p>
            <div className="bg-info-50 border border-info-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FiInfo className="w-5 h-5 text-info mr-2" />
                <p className="text-info text-sm">
                  <strong>Nota:</strong> El contenido generado se conservará y podrás acceder a él desde la sección de contenidos generados.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleteConversationMutation.isPending}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConversationMutation.isPending}
                className="btn btn-error gap-2"
              >
                {deleteConversationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
