import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { GeneratedContent } from '../../api/endpoints'
import { FiEye, FiX } from 'react-icons/fi'

interface ContentViewModalProps {
  isOpen: boolean
  onClose: () => void
  content: GeneratedContent | null
}

export function ContentViewModal({
  isOpen,
  onClose,
  content
}: ContentViewModalProps) {
  if (!isOpen || !content) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vista Previa del Contenido"
      size="xl"
    >
      <div className="space-y-4">
        {/* Header del contenido */}
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <FiEye className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-base-content truncate">
                {content.title || 'Sin título'}
              </h3>
              <p className="text-sm text-base-content/70 truncate">
                {content.description || 'Sin descripción'}
              </p>
            </div>
          </div>
        </div>

        {/* Vista previa del contenido */}
        <div className="bg-white rounded-lg shadow-sm border border-base-300 overflow-hidden">
          <div className="p-4 border-b border-base-300 bg-base-100">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-base-content">
                Vista Previa
              </h4>
              <div className="flex items-center space-x-2 text-xs text-base-content/70">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Contenido cargado</span>
              </div>
            </div>
          </div>
          
          <div className="h-96 sm:h-[500px] overflow-hidden">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${content.title || 'Vista Previa'}</title>
                  <style>
                    body {
                      margin: 0;
                      padding: 20px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                      line-height: 1.6;
                      color: #333;
                    }
                    ${content.css_content || ''}
                  </style>
                </head>
                <body>
                  ${content.html_content || '<div class="text-center text-gray-500 p-8">No hay contenido disponible</div>'}
                  <script>
                    ${content.js_content || ''}
                  </script>
                </body>
                </html>
              `}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              title="Vista Previa del Contenido"
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-base-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-base-content mb-2">
              Información del Contenido
            </h4>
            <div className="space-y-1 text-sm text-base-content/70">
              <p><strong>Tipo:</strong> {content.content_type || 'No especificado'}</p>
              <p><strong>Fecha de creación:</strong> {new Date(content.created_at).toLocaleDateString('es-ES')}</p>
              <p><strong>Última actualización:</strong> {new Date(content.updated_at).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
          
          <div className="bg-base-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-base-content mb-2">
              Detalles Técnicos
            </h4>
            <div className="space-y-1 text-sm text-base-content/70">
              <p><strong>HTML:</strong> {content.html_content ? `${content.html_content.length} caracteres` : 'No disponible'}</p>
              <p><strong>CSS:</strong> {content.css_content ? `${content.css_content.length} caracteres` : 'No disponible'}</p>
              <p><strong>JavaScript:</strong> {content.js_content ? `${content.js_content.length} caracteres` : 'No disponible'}</p>
            </div>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            leftIcon={<FiX className="w-4 h-4" />}
          >
            Cerrar Vista Previa
          </Button>
        </div>
      </div>
    </Modal>
  )
}
