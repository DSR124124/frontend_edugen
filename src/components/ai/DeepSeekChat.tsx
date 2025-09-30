import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiContentApi, ConversationMessage } from '../../api/endpoints'
import { useNotifications } from '../../hooks/useNotifications'

interface DeepSeekChatProps {
  conversationId?: number
  onRequirementsExtracted?: (requirements: unknown) => void
  showGenerateButton?: boolean
  onGenerateContent?: () => void
  isGenerating?: boolean
  onNewConversation?: () => void
}

export function DeepSeekChat({ conversationId, onRequirementsExtracted, showGenerateButton, onGenerateContent, isGenerating, onNewConversation }: DeepSeekChatProps) {
  const queryClient = useQueryClient()
  const { showError, showWarning, showInfo, showSuccess } = useNotifications()
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isContentReady, setIsContentReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Obtener mensajes de la conversación
  const { data: conversationMessages, error: messagesError } = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => aiContentApi.getMessages(conversationId!),
    enabled: !!conversationId
  })

  // Manejar errores de la consulta de mensajes
  useEffect(() => {
    if (messagesError) {
      const axiosError = messagesError as { 
        response?: { 
          data?: { error?: string },
          status?: number
        },
        message?: string
      }
      
      if (axiosError.response?.status === 404) {
        showError('Conversación no encontrada. Por favor, crea una nueva conversación.', 'Conversación no encontrada')
      } else if (axiosError.response?.status === 401) {
        showError('Sesión expirada. Por favor, inicia sesión nuevamente.', 'Sesión expirada')
      } else {
        showError('Error al cargar los mensajes de la conversación.', 'Error de carga')
      }
    }
  }, [messagesError, onNewConversation, showError])

  // Enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => aiContentApi.sendMessage(conversationId!, { content }),
    onSuccess: (response) => {
      setMessages(prev => [
        ...prev,
        response.data.user_message,
        response.data.assistant_message
      ])
      // Invalidar queries para actualizar la lista de conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] })
    },
    onError: (error: unknown) => {
      console.error('Error sending message:', error)
      const axiosError = error as { 
        response?: { 
          data?: { error?: string },
          status?: number
        },
        message?: string
      }
      
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Error al enviar mensaje'
      
      // Mostrar notificación basada en el tipo de error
      if (axiosError.response?.status === 500) {
        showError('Error interno del servidor. Por favor, intenta de nuevo.', 'Error del servidor')
      } else if (axiosError.response?.status === 401) {
        showError('Sesión expirada. Por favor, inicia sesión nuevamente.', 'Sesión expirada')
      } else if (axiosError.response?.status === 429) {
        showWarning('Demasiadas solicitudes. Por favor, espera un momento.', 'Límite de solicitudes')
      } else if (axiosError.response?.status === 503) {
        showError('Servicio de IA no disponible. Por favor, contacta al administrador.', 'Servicio no disponible')
      } else if (axiosError.response?.status === 404) {
        showError('Conversación no encontrada. Por favor, crea una nueva conversación.', 'Conversación no encontrada')
      } else {
        showError(errorMessage, 'Error de comunicación')
      }
    }
  })

  // Extraer requisitos
  const extractRequirementsMutation = useMutation({
    mutationFn: () => aiContentApi.extractRequirements(conversationId!),
    onSuccess: (response) => {
      onRequirementsExtracted?.(response.data.requirements)
      showSuccess('Requisitos extraídos exitosamente', 'Éxito')
      // Invalidar queries para actualizar la lista de conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: unknown) => {
      console.error('Error extracting requirements:', error)
      
      const axiosError = error as { 
        response?: { 
          data?: { error?: string },
          status?: number
        },
        message?: string
      }
      
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Error al extraer requisitos'
      
      // Mostrar notificación basada en el tipo de error
      if (axiosError.response?.status === 503) {
        showWarning(errorMessage, 'Servicio no disponible')
      } else if (axiosError.response?.status === 429) {
        showInfo(errorMessage, 'Límite de solicitudes')
      } else if (axiosError.response?.status === 400) {
        showInfo(errorMessage, 'Información requerida')
      } else {
        showError(errorMessage, 'Error al extraer requisitos')
      }
    }
  })

  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages.data || [])
      
      // Resetear estado cuando cambia la conversación
      setIsContentReady(false)
      
      // Verificar si hay suficiente información para extraer requisitos
      const messages = conversationMessages.data || []
      if (messages.length >= 2) {
        // Buscar indicadores de que el contenido está listo (más flexibles)
        const readyIndicators = [
          '¿estás conforme con esta información o quieres agregar algo más?',
          'ya tienes suficiente información',
          'usa "extraer requisitos"',
          "usa 'extraer requisitos'",
          'usa extraer requisitos'
        ]
        
        // Verificar si algún mensaje reciente del asistente indica que está listo
        const assistantRecent = messages.filter(msg => msg.role === 'assistant').slice(-3)
        const assistantRecentlyReady = assistantRecent.some(m =>
          readyIndicators.some(ind => m.content.toLowerCase().includes(ind))
        )
        if (assistantRecentlyReady) {
          setIsContentReady(true)
          return
        }
        
        // Verificar si el usuario confirmó explícitamente Y el asistente confirmó que está listo (en mensajes recientes)
        const userConfirmations = [
          'sí, estoy conforme',
          'perfecto, estoy conforme', 
          'sí, está bien',
          'está perfecto',
          'sí, procede',
          'conforme',
          'está bien',
          'perfecto',
          'sí',
          'ok',
          'okay',
          'confirmo',
          'estoy de acuerdo',
          'procede',
          'adelante',
          'si, estoy conforme',
          'si, está bien',
          'si, procede',
          'si',
          'está listo',
          'listo',
          'generar',
          'extraer requisitos'
        ]
        
        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()
        const assistantMessages = messages.filter(msg => msg.role === 'assistant')
        
        if (lastUserMessage && assistantMessages.length) {
          const userContent = lastUserMessage.content.toLowerCase()
          const assistantContentRecent = assistantMessages.slice(-3).map(m => m.content.toLowerCase())
          
          // Solo activar si el usuario confirmó Y el asistente confirmó que está listo
          const userConfirmed = userConfirmations.some(confirmation => userContent.includes(confirmation))
          const assistantConfirmed = assistantContentRecent.some(ac => readyIndicators.some(indicator => ac.includes(indicator)))
          
          if (userConfirmed && assistantConfirmed) {
            setIsContentReady(true)
            return
          }
        }
        
        // Verificar si el usuario pidió explícitamente extraer requisitos
        const lastUserMessages = messages.filter(msg => msg.role === 'user').slice(-2)
        for (const msg of lastUserMessages) {
          const content = msg.content.toLowerCase()
          if (content.includes('extraer requisitos') || content.includes('generar contenido')) {
            setIsContentReady(true)
            return
          }
        }
        
        // NO activar automáticamente basándose en contenido sustancial
        // Solo activar cuando el usuario confirme explícitamente
      }
    }
  }, [conversationMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Resetear estado cuando cambia la conversación
  useEffect(() => {
    setIsContentReady(false)
  }, [conversationId])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !conversationId) return

    const userMessage = {
      id: Date.now(),
      role: 'user' as const,
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      await sendMessageMutation.mutateAsync(input)
    } catch (error) {
      // El error ya se maneja en la mutación, solo necesitamos remover el mensaje del usuario si falla
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExtractRequirements = () => {
    if (conversationId) {
      extractRequirementsMutation.mutate()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Asistente de Contenido Educativo IA</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Describe qué contenido educativo quieres crear (nivel, materia, tema) y te ayudaré paso a paso
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messagesError && (
          <div className="text-center text-red-500 mt-6 sm:mt-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⚠️</div>
            <p className="text-base sm:text-lg font-medium">Error al cargar mensajes</p>
            <p className="text-xs sm:text-sm">No se pudieron cargar los mensajes de la conversación</p>
          </div>
        )}
        
        {!messagesError && messages.length === 0 && (
          <div className="text-center text-gray-500 mt-6 sm:mt-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎓</div>
            <p className="text-base sm:text-lg font-medium">¡Hola! Soy tu asistente de contenido educativo</p>
            <p className="text-xs sm:text-sm">Puedo ayudarte a crear contenido educativo interactivo. ¿Qué materia y nivel quieres enseñar hoy?</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                      AI
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t bg-gray-50">
        {isContentReady ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                ✅ Tienes suficiente información para generar contenido
              </p>
            </div>
            <button
              onClick={handleExtractRequirements}
              disabled={extractRequirementsMutation.isPending || !conversationId}
              className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 min-h-[44px] text-sm sm:text-base shadow-md"
            >
              {extractRequirementsMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Extrayendo requisitos...</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Extraer Requisitos</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center max-w-md">
              Esto analizará la conversación y extraerá los requisitos necesarios para generar tu contenido educativo
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí... (Enter para enviar, Shift+Enter para nueva línea)"
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
              disabled={isLoading || !conversationId || isGenerating}
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || !conversationId || isGenerating}
              className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px] text-sm sm:text-base"
            >
              Enviar
            </button>
          </div>
        )}
        
        {showGenerateButton && (
          <div className="flex justify-center mt-3 sm:mt-4">
            <button
              onClick={onGenerateContent}
              disabled={isGenerating || !conversationId}
              className="px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 min-h-[44px] text-sm sm:text-base"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generando...</span>
                </>
              ) : (
                <span>Generar Contenido</span>
              )}
            </button>
          </div>
        )}
        {!conversationId && (
          <p className="text-xs sm:text-sm text-red-500 mt-2 text-center">
            Selecciona una conversación para comenzar a chatear
          </p>
        )}
      </div>
    </div>
  )
}
