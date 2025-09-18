import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiContentApi, ConversationMessage } from '../../api/endpoints'

interface DeepSeekChatProps {
  conversationId?: number
  onRequirementsExtracted?: (requirements: unknown) => void
  showGenerateButton?: boolean
  onGenerateContent?: () => void
  isGenerating?: boolean
}

export function DeepSeekChat({ conversationId, onRequirementsExtracted, showGenerateButton, onGenerateContent, isGenerating }: DeepSeekChatProps) {
  const queryClient = useQueryClient()
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
    }
  })

  // Extraer requisitos
  const extractRequirementsMutation = useMutation({
    mutationFn: () => aiContentApi.extractRequirements(conversationId!),
    onSuccess: (response) => {
      onRequirementsExtracted?.(response.data.requirements)
      // Invalidar queries para actualizar la lista de conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: unknown) => {
      // Mostrar mensaje de error al usuario
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error al extraer requisitos'
      alert(errorMessage)
    }
  })

  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages.data || [])
      
      // Resetear estado cuando cambia la conversación
      setIsContentReady(false)
      
      // Verificar si el último mensaje del asistente dice que está listo
      const lastMessage = conversationMessages.data?.[conversationMessages.data.length - 1]
      if (lastMessage?.role === 'assistant' && 
          lastMessage.content.toLowerCase().includes('está listo tu contenido para ser generado') &&
          (lastMessage.content.toLowerCase().includes('extraer requisitos') || 
           lastMessage.content.toLowerCase().includes('extraer requisitos'))) {
        setIsContentReady(true)
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
    } catch {
      // Error handling
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
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Asistente de Contenido Educativo IA</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Describe qué contenido educativo quieres crear (nivel, materia, tema) y te ayudaré paso a paso
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesError && (
          <div className="text-center text-red-500 mt-8">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-lg font-medium">Error al cargar mensajes</p>
            <p className="text-sm">No se pudieron cargar los mensajes de la conversación</p>
          </div>
        )}
        
        {!messagesError && messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">🎓</div>
            <p className="text-lg font-medium">¡Hola! Soy tu asistente de contenido educativo</p>
            <p className="text-sm">Puedo ayudarte a crear contenido educativo interactivo. ¿Qué materia y nivel quieres enseñar hoy?</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={message.id}>
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                      AI
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mensaje especial después de confirmación del asistente */}
            {message.role === 'assistant' && 
             message.content.includes('¡Empezaré a trabajar en el diseño') && 
             index === messages.length - 1 && (
              <div className="flex justify-center mt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
                  <div className="flex items-center space-x-2">
                    <div className="text-yellow-600 text-lg">💡</div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Dale clic en "Extraer Requisitos" para poder generar el contenido
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
      <div className="p-4 border-t bg-gray-50">
        {isContentReady ? (
          <div className="flex justify-center space-x-2">
            <button
              onClick={handleExtractRequirements}
              disabled={extractRequirementsMutation.isPending || !conversationId}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
            >
              {extractRequirementsMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Extrayendo...</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Extraer Requisitos</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí... (Enter para enviar, Shift+Enter para nueva línea)"
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isLoading || !conversationId || isGenerating}
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || !conversationId || isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Enviar
            </button>
          </div>
        )}
        
        {showGenerateButton && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onGenerateContent}
              disabled={isGenerating || !conversationId}
              className="px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
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
          <p className="text-xs text-red-500 mt-2">
            Selecciona una conversación para comenzar a chatear
          </p>
        )}
      </div>
    </div>
  )
}
