import { useState, useEffect, useMemo, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { aiContentApi } from '../../api/endpoints'
import { DeepSeekChat } from '../../components/ai/DeepSeekChat'
// import { useNotifications } from '../../hooks/useNotifications' // No se usa actualmente
import { LoadingOverlay, LoadingCard } from '../../components/ui/LoadingSpinner'
import { getApiUrl } from '../../config/environment'
import { 
  MessageCircle,
  Users,
  Book,
  Calendar,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Brain
} from 'lucide-react'


export function ContentGenerator() {
  const queryClient = useQueryClient()
  // const { showError } = useNotifications() // No se usa actualmente
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
  const [showGenerateButton] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const hasProcessedUrlParams = useRef(false)

  // Efecto para manejar el estado inicial de la sidebar
  useEffect(() => {
    // En móviles, la sidebar siempre debe estar visible
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Ejecutar una vez al montar

    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // Generar contenido con confirmación
  const generateContentMutation = useMutation({
    mutationFn: async (data: { requirements: Record<string, unknown>; title: string }) => {
      if (!currentConversation) throw new Error('No conversation selected')
      
      // Usar el nuevo endpoint de confirmación y generación
      const API_URL = getApiUrl()
      const response = await fetch(`${API_URL}ai/gamma/confirm-and-generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          conversation_id: currentConversation,
          requirements: data.requirements,
          title: data.title
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error generando contenido')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Redirigir a contenidos generados
      navigate('/generated-content')
    },
    onError: (error) => {
      console.error('Error generando contenido:', error)
      setIsGenerating(false)
      
      // Handle different types of errors
      let errorMessage = 'Error desconocido al generar contenido'
      let errorType = 'Error al generar contenido'
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Handle timeout errors specifically
        if (error.message.includes('timeout') || error.message.includes('ECONNABORTED')) {
          errorMessage = 'La operación tardó demasiado tiempo. El servicio de IA puede estar sobrecargado. Por favor, intenta de nuevo en unos minutos.'
          errorType = 'Tiempo de espera agotado'
        }
      }
      
      // Check if it's an axios error with more details
      const axiosError = error as { 
        code?: string;
        message?: string;
        response?: { 
          data?: { error?: string };
          status?: number;
        };
      }
      if (axiosError?.code === 'ECONNABORTED' || axiosError?.message?.includes('timeout')) {
        errorMessage = 'La operación tardó demasiado tiempo. El servicio de IA puede estar sobrecargado. Por favor, intenta de nuevo en unos minutos.'
        errorType = 'Tiempo de espera agotado'
      } else if (axiosError?.response?.data?.error) {
        errorMessage = axiosError.response.data.error
      }
      
      const notification = document.createElement('div')
      const isTimeout = errorType === 'Tiempo de espera agotado'
      notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${isTimeout ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' : 'bg-red-100 border border-red-400 text-red-700'}`
      
      notification.innerHTML = `
        <div class="flex items-start">
          <div class="flex-1">
            <p class="font-medium">${errorType}</p>
            <p class="text-sm mt-1">${errorMessage}</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg leading-none">&times;</button>
        </div>
      `
      
      document.body.appendChild(notification)
      
      // Auto-remove después de 8 segundos
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove()
        }
      }, 8000)
    }
  })


  const handleRequirementsExtracted = (req: unknown) => {
    // Si el backend envía requisitos reales, usarlos directamente
    if (req && typeof req === 'object') {
      setRequirements(req as Record<string, unknown>)
      setShowConfirmation(true) // Mostrar confirmación en lugar del botón directo
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
      setShowConfirmation(true) // Mostrar confirmación en lugar del botón directo
      return
    }
  }

  const handleConfirmRequirements = () => {
    if (currentConversation && requirements) {
      setIsConfirming(true)
      
      // Crear título específico basado en los requisitos
      const subject = String(requirements.subject || 'Contenido Educativo')
      const level = String(requirements.course_level || 'básico')
      const title = `${subject} - ${level.charAt(0).toUpperCase() + level.slice(1)}`
      
      generateContentMutation.mutate({
        requirements: requirements,
        title: title
      })
    }
  }

  const handleRejectRequirements = () => {
    setShowConfirmation(false)
    setRequirements(null)
    // El usuario puede continuar la conversación para refinar los requisitos
  }

  const handleGenerateContent = () => {
    if (currentConversation && requirements) {
      setIsGenerating(true)
      generateContentMutation.mutate({
        requirements: requirements,
        title: `Contenido Educativo - ${new Date().toLocaleString()}`
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
    <div className="space-y-3 sm:space-y-4" data-tour="ai-generator-page">
      {/* Loading overlay para creación automática */}
      <LoadingOverlay 
        isVisible={isAutoCreating}
        message="Creando conversación automática... Se está configurando una nueva conversación con los parámetros del tema y curso seleccionados."
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-6" data-tour="ai-generator-header">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Asistente de Contenido Educativo IA
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Describe qué contenido educativo quieres crear (nivel, materia, tema) y te ayudaré paso a paso
              </p>
            </div>
          </div>
          
          {/* Botón para ocultar panel de acciones */}
          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors flex items-center gap-2"
              title="Ocultar panel de acciones"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden lg:block">Ocultar</span>
            </button>
          )}
          
          {/* Botón para mostrar panel de acciones */}
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors flex items-center gap-2"
              title="Mostrar panel de acciones"
            >
              <ChevronRight className="w-5 h-5" />
              <span className="text-sm font-medium hidden lg:block">Mostrar</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
        {/* Sidebar con conversaciones */}
        <div className={`w-full lg:w-80 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed 
            ? 'hidden lg:hidden' 
            : 'flex'
        }`}>
          <div className="flex-shrink-0 mb-6">
            <div className="mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Acciones</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button
                onClick={handleStartNewChat}
                disabled={createConversationMutation.isPending}
                className="w-full px-4 py-3 lg:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] lg:min-h-[52px]"
              >
                {createConversationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm lg:text-base font-medium">Creando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-sm lg:text-base font-medium">Nueva Conversación</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleViewGeneratedContent}
                className="w-full px-4 py-3 lg:py-4 bg-white border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] lg:min-h-[52px]"
              >
                <Book className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base font-medium">Ver Contenido Generado</span>
              </button>
            </div>
          </div>
        
          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <span>Conversaciones</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3" data-tour="ai-generator-content">
              {conversationsError && (
                <div className="p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900 text-sm lg:text-base">Error al cargar conversaciones</h3>
                    <p className="text-xs lg:text-sm text-red-700">Intenta recargar la página</p>
                  </div>
                </div>
              )}
              
              {deleteConversationMutation.isPending && (
                <div className="p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm lg:text-base text-blue-700">Eliminando conversación...</span>
                </div>
              )}
            
              {!conversationsError && Array.isArray(conversationsData) && conversationsData.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 lg:p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    currentConversation === conv.id
                      ? 'border-blue-300 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                  }`}
                  onClick={() => {
                    setCurrentConversation(conv.id)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ${
                          currentConversation === conv.id ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <h5 className={`font-medium truncate text-sm lg:text-base ${
                          currentConversation === conv.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {conv.title || 'Sin título'}
                        </h5>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-4 text-xs lg:text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{new Date(conv.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 flex-shrink-0" />
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
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Eliminar conversación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            
              {!conversationsError && Array.isArray(conversationsData) && conversationsData.length === 0 && (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No hay conversaciones</h3>
                      <p className="text-sm text-gray-600 mb-4">Crea una nueva para comenzar a chatear con la IA</p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span className="text-center">Usa el botón "Nueva Conversación" para empezar</span>
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
        <div className={`flex-1 bg-white border border-gray-200 rounded-xl shadow-sm min-h-0 transition-all duration-300 relative overflow-hidden ${
          isSidebarCollapsed ? 'lg:ml-0' : ''
        }`}>
          {(
            <>
              <DeepSeekChat
                conversationId={currentConversation || undefined}
                onRequirementsExtracted={handleRequirementsExtracted}
                showGenerateButton={showGenerateButton}
                onGenerateContent={handleGenerateContent}
                isGenerating={isGenerating}
                onNewConversation={handleStartNewChat}
              />
              
              {/* Loading spinner para generación automática */}
              {isGenerating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-4 sm:p-8 max-w-md w-full mx-4 shadow-xl">
                    <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
                      <div className="text-center">
                        <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2">Generando Contenido Educativo</h3>
                        <p className="text-xs sm:text-sm text-base-content/70 mb-2">Creando contenido educativo interactivo con el editor Gamma...</p>
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


      {/* Modal de confirmación de requisitos */}
      {showConfirmation && requirements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleRejectRequirements}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                ¡Requisitos Recolectados Exitosamente!
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Hemos recopilado toda la información necesaria para generar tu contenido educativo. 
                Por favor, revisa los detalles a continuación:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tema/Asignatura:</label>
                    <p className="text-gray-900">{String(requirements.subject || 'No especificado')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nivel Educativo:</label>
                    <p className="text-gray-900">{String(requirements.course_level || 'No especificado')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo de Contenido:</label>
                    <p className="text-gray-900">{String(requirements.content_type || 'No especificado')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duración Estimada:</label>
                    <p className="text-gray-900">{String(requirements.estimated_duration || 'No especificado')}</p>
                  </div>
                </div>
                
                {requirements.learning_objectives && Array.isArray(requirements.learning_objectives) && requirements.learning_objectives.length > 0 ? (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Objetivos de Aprendizaje:</label>
                    <ul className="list-disc list-inside text-gray-900 mt-1">
                      {Array.isArray(requirements.learning_objectives) 
                        ? requirements.learning_objectives.map((obj: string, index: number) => (
                            <li key={index}>{obj}</li>
                          ))
                        : <li>{String(requirements.learning_objectives)}</li>
                      }
                    </ul>
                  </div>
                ) : null}
                
                {requirements.additional_requirements && String(requirements.additional_requirements).trim() !== '' ? (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Requisitos Adicionales:</label>
                    <p className="text-gray-900">{String(requirements.additional_requirements)}</p>
                  </div>
                ) : null}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">¿Estás conforme con esta información?</h4>
                  <p className="text-blue-700 text-sm">
                    Si confirmas, se generará el contenido educativo usando el editor Gamma. 
                    Podrás editarlo y personalizarlo después de la generación.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRejectRequirements}
                disabled={isConfirming}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
              >
                No, necesito ajustar
              </button>
              <button
                onClick={handleConfirmRequirements}
                disabled={isConfirming}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Sí, generar contenido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar conversación */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={cancelDelete}></div>
          <div className="relative bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 p-4 sm:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-2 bg-error-100 rounded-lg mr-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-error" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-base-content">
                Eliminar Conversación
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-base-content/70 mb-4 sm:mb-6">
              ¿Estás seguro de que quieres eliminar la conversación <strong>"{deleteModal.conversationTitle}"</strong>? 
              Esta acción no se puede deshacer y se eliminarán todos los mensajes de esta conversación.
            </p>
            <div className="bg-info-50 border border-info-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-info mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-info text-xs sm:text-sm">
                  <strong>Nota:</strong> El contenido generado se conservará y podrás acceder a él desde la sección de contenidos generados.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleteConversationMutation.isPending}
                className="btn btn-outline w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConversationMutation.isPending}
                className="btn btn-error gap-2 w-full sm:w-auto"
              >
                {deleteConversationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
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
