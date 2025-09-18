import { useState, useRef, useEffect, useCallback } from 'react'
import { GeneratedContent } from '../../api/endpoints'
import { LoadingState } from '../common/LoadingState'
import { ElementsSidebar } from '../../components/ai/ElementsSidebar'
import { Button } from '../ui/Button'
import { FiSave, FiEye, FiX, FiRefreshCw } from 'react-icons/fi'

interface ContentEditorModalProps {
  content: GeneratedContent
  isOpen: boolean
  onClose: () => void
  onSave: (content: GeneratedContent) => void
  isSaving?: boolean
}

interface GrapesJSEditor {
  getHtml: () => string
  getCss: () => string | undefined
  getComponents: () => unknown
  runCommand: (command: string) => void
  Modal: {
    setTitle: (title: string) => void
    setContent: (content: string) => void
    open: () => void
  }
  destroy: () => void
  addComponents: (components: string) => void
}

export function ContentEditorModal({ 
  content, 
  isOpen, 
  onClose, 
  onSave, 
  isSaving = false 
}: ContentEditorModalProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<GrapesJSEditor | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initEditor = useCallback(async () => {
    if (!editorRef.current) return

    setIsLoading(true)
    setError(null)

    // Agregar estilos CSS para GrapesJS
    const styleId = 'grapesjs-custom-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .gjs-cv-canvas {
          background: white !important;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
          height: 100vh !important;
          width: 100% !important;
          min-height: 100vh !important;
        }
        .gjs-selected {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px;
        }
        .gjs-hovered {
          outline: 1px solid #60a5fa !important;
          outline-offset: 1px;
        }
        .gjs-frame {
          width: 100% !important;
          height: 100% !important;
          min-height: 100vh !important;
        }
        .gjs-frame-wrapper {
          width: 100% !important;
          height: 100% !important;
          min-height: 100vh !important;
        }
      `
      document.head.appendChild(style)
    }

    try {
      const grapesjs = await import('grapesjs')
      
       const editorInstance = grapesjs.default.init({
         container: editorRef.current,
         height: '100%',
         width: '100%',
         storageManager: false,
         plugins: [],
         pluginsOpts: {},
         avoidInlineStyle: true,
         assetManager: {
           upload: false
         },
         layerManager: {
           appendTo: '.hidden-layer'
         },
         deviceManager: {
           devices: [
             {
               name: 'Desktop',
               width: ''
             }
           ]
         },
         canvas: {
           styles: [],
           scripts: [],
           stylePrefix: 'gjs-'
         },
         // Configuración para mejorar rendimiento
         showOffsets: false,
         panels: {
           defaults: []
         },
         blockManager: {
           appendTo: '.blocks-container',
           blocks: []
         },
         selectorManager: {
           appendTo: '.hidden-selector'
         },
         traitManager: {
           appendTo: '.hidden-traits'
         },
         commands: {},
         // Configuraciones adicionales para rendimiento
         modal: {
           title: 'Editor'
         },
         // Deshabilitar características que causan violaciones de rendimiento
         showToolbar: false,
         showDevices: false
       })

      // Cargar contenido existente con delay para mejor rendimiento
      setTimeout(() => {
        if (content) {
          try {
            console.log('🎨 [GRAPESJS] Cargando contenido:', {
              id: content.id,
              title: content.title,
              hasHtml: !!content.html_content,
              hasCss: !!content.css_content,
              hasJs: !!content.js_content
            })
            
            if (content.html_content && content.html_content.trim()) {
              console.log('🎨 [GRAPESJS] Cargando HTML:', content.html_content.substring(0, 200) + '...')
              editorInstance.setComponents(content.html_content)
              console.log('✅ [GRAPESJS] HTML cargado correctamente')
            } else {
              console.log('⚠️ [GRAPESJS] No hay contenido HTML, mostrando contenido de ejemplo')
              editorInstance.setComponents(`
                <div class="p-4 text-center text-gray-600">
                  <h3>Contenido de Ejemplo</h3>
                  <p>Haz clic en los elementos de la sidebar para agregar contenido.</p>
                </div>
              `)
            }
            
            if (content.css_content && content.css_content.trim()) {
              console.log('🎨 [GRAPESJS] Cargando CSS:', content.css_content.substring(0, 200) + '...')
              editorInstance.setStyle(content.css_content)
            }
            
            if (content.js_content && content.js_content.trim()) {
              console.log('🎨 [GRAPESJS] Cargando JS:', content.js_content.substring(0, 200) + '...')
              const script = document.createElement('script')
              script.textContent = content.js_content
              script.id = `grapesjs-script-${content.id}`
              const existingScript = document.getElementById(`grapesjs-script-${content.id}`)
              if (existingScript) {
                existingScript.remove()
              }
              document.head.appendChild(script)
            }
            
            console.log('✅ [GRAPESJS] Contenido cargado exitosamente')
          } catch (error) {
            console.error('❌ [GRAPESJS] Error al cargar contenido:', error)
          }
        }
      }, 200) // Aumentar delay para mejor rendimiento

       setEditor(editorInstance)
       setIsLoading(false)
       
       // Forzar redimensionamiento después de la inicialización
       setTimeout(() => {
         if (editorInstance) {
           // El editor ya está inicializado correctamente
           console.log('✅ [GRAPESJS] Editor inicializado correctamente')
         }
       }, 50) // Reducir timeout para mejor rendimiento
     } catch (error) {
       console.error('Error al inicializar editor:', error)
       setError('Error al cargar el editor. Por favor, intenta de nuevo.')
       setIsLoading(false)
     }
   }, [content])

  // Inicializar editor cuando se abre el modal
  useEffect(() => {
    if (isOpen && !editor) {
      initEditor()
    }
  }, [isOpen, editor, initEditor])

  // Limpiar editor cuando se cierra el modal
  useEffect(() => {
    if (!isOpen && editor) {
      editor.destroy()
      setEditor(null)
      // Limpiar estilos CSS personalizados
      const styleElement = document.getElementById('grapesjs-custom-styles')
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [isOpen, editor])

  // Manejar redimensionamiento de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (editor) {
        // El editor se redimensiona automáticamente
        console.log('🔄 [GRAPESJS] Redimensionando editor')
      }
    }

    if (isOpen) {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, editor])

  const handleAddElement = (elementHtml: string) => {
    if (editor) {
      try {
        editor.addComponents(elementHtml)
      } catch (error) {
        console.error('Error al agregar elemento:', error)
      }
    }
  }

  const handleSave = () => {
    if (editor) {
      const htmlContent = editor.getHtml()
      const cssContent = editor.getCss()
      const jsContent = content.js_content || ''
      
      const updatedContent = {
        ...content,
        html_content: htmlContent,
        css_content: cssContent || '',
        js_content: jsContent
      }
      
      onSave(updatedContent)
    }
  }

  const handlePreview = () => {
    if (editor) {
      try {
        if (editor.runCommand) {
          editor.runCommand('preview')
        }
      } catch {
        console.log('Vista previa no disponible')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-base-100" style={{ height: '100vh', width: '100vw' }}>
      {/* Modal */}
      <div className="flex h-full w-full">
        {/* Sidebar de Elementos */}
        <div className="w-80 bg-base-100 border-r border-base-300 flex flex-col" style={{ height: '100vh' }}>
          <div className="p-4 border-b border-base-300 bg-base-200">
            <h3 className="text-lg font-semibold text-base-content">
              Elementos Educativos
            </h3>
            <p className="text-sm text-base-content/70 mt-1">
              Haz clic para agregar al editor
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ElementsSidebar onAddElement={handleAddElement} />
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex flex-col bg-base-100" style={{ height: '100vh' }}>
          {/* Toolbar */}
          <div className="flex-shrink-0 p-4 border-b border-base-300 bg-base-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiRefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-base-content">
                    Editor de Contenido
                  </h3>
                  <p className="text-sm text-base-content/70">
                    {content.title}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="primary"
                  leftIcon={<FiSave className="w-4 h-4" />}
                  loading={isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                  onClick={handlePreview}
                  variant="primary"
                  leftIcon={<FiEye className="w-4 h-4" />}
                >
                  Vista Previa
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  leftIcon={<FiX className="w-4 h-4" />}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 relative bg-base-100 overflow-hidden" style={{ height: 'calc(100vh - 80px)', minHeight: 'calc(100vh - 80px)' }}>
            {isLoading && (
              <div className="absolute inset-0 bg-base-100 bg-opacity-90 flex items-center justify-center z-10">
                <LoadingState 
                  message="Cargando editor..." 
                  size="lg" 
                />
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 bg-base-100 flex items-center justify-center z-10">
                <div className="text-center max-w-md mx-auto p-6">
                  <div className="text-error text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-base-content mb-2">Error al cargar el editor</h3>
                  <p className="text-base-content/70 mb-4">{error}</p>
                  <Button
                    onClick={() => {
                      setError(null)
                      initEditor()
                    }}
                    variant="primary"
                    leftIcon={<FiRefreshCw className="w-4 h-4" />}
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              </div>
            )}
            
            <div 
              ref={editorRef} 
              className="h-full w-full absolute inset-0"
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Contenedores ocultos para managers */}
      <div className="hidden">
        <div className="hidden-selector"></div>
        <div className="hidden-traits"></div>
        <div className="hidden-layer"></div>
        <div className="blocks-container"></div>
      </div>
    </div>
  )
}
