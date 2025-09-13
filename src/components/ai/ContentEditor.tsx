import { useState } from 'react'
import { GeneratedContent } from '../../api/endpoints'
import { NotificationContainer } from '../notifications/NotificationContainer'

interface ContentEditorProps {
  content: GeneratedContent
  onSave: (content: unknown) => void
}

export function ContentEditor({ content, onSave }: ContentEditorProps) {
  const [htmlContent, setHtmlContent] = useState(content.html_content || '')
  const [cssContent, setCssContent] = useState(content.css_content || '')
  const [jsContent, setJsContent] = useState(content.js_content || '')
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'css' | 'js'>('preview')
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>>([])

  const addNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, title, message, type, duration }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleSave = async () => {
    if (!isSaving) {
      setIsSaving(true)
      try {
        const updatedContent = {
          html: htmlContent,
          css: cssContent,
          js: jsContent,
          title: content.title,
          id: content.id
        }
        
        await onSave(updatedContent)
        addNotification('Éxito', 'Contenido guardado exitosamente', 'success')
      } catch (error) {
        console.error('Error al guardar contenido:', error)
        addNotification('Error', `Error al guardar contenido: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error')
      } finally {
        setIsSaving(false)
      }
    }
  }

  const renderPreview = () => {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.title}</title>
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>${jsContent}</script>
      </body>
      </html>
    `
    
    return (
      <iframe
        srcDoc={fullHtml}
        className="w-full h-full border-0"
        title="Vista previa del contenido"
        sandbox="allow-scripts"
      />
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-gray-100">
        <div className="flex space-x-1">
          {[
            { id: 'preview', label: 'Vista Previa', icon: '👁️' },
            { id: 'html', label: 'HTML', icon: '📄' },
            { id: 'css', label: 'CSS', icon: '🎨' },
            { id: 'js', label: 'JavaScript', icon: '⚡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' && (
          <div className="h-full">
            {renderPreview()}
          </div>
        )}
        
        {activeTab === 'html' && (
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none"
            placeholder="Contenido HTML aquí..."
          />
        )}
        
        {activeTab === 'css' && (
          <textarea
            value={cssContent}
            onChange={(e) => setCssContent(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none"
            placeholder="Estilos CSS aquí..."
          />
        )}
        
        {activeTab === 'js' && (
          <textarea
            value={jsContent}
            onChange={(e) => setJsContent(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none"
            placeholder="Código JavaScript aquí..."
          />
        )}
      </div>
      
      {/* Notificaciones */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </div>
  )
}
