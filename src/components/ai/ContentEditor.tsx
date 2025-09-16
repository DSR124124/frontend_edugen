import { useState } from 'react'
import { GeneratedContent } from '../../api/endpoints'
import { NotificationContainer } from '../notifications/NotificationContainer'

interface ContentEditorProps {
  content: GeneratedContent
  onSave: (content: unknown) => void
}

export function ContentEditor({ content }: ContentEditorProps) {
  const [htmlContent] = useState(content.html_content || '')
  const [cssContent] = useState(content.css_content || '')
  const [jsContent] = useState(content.js_content || '')
  // const [activeTab] = useState<'preview'>('preview')
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>>([])

  // const addNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) => {
  //   const id = Math.random().toString(36).substr(2, 9)
  //   setNotifications(prev => [...prev, { id, title, message, type, duration }])
  // }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
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

      {/* Vista Previa Header */}
      <div className="border-b bg-gray-100">
        <div className="px-4 py-2">
          <div className="flex items-center text-sm font-medium text-blue-600">
            <span className="mr-2">👁️</span>
            Vista Previa del Contenido
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          {renderPreview()}
        </div>
      </div>
      
      {/* Notificaciones */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
        onUpdate={() => {}} 
      />
    </div>
  )
}
