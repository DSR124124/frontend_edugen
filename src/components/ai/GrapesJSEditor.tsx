import { useEffect, useRef, useState } from 'react'
import { GeneratedContent } from '../../api/endpoints'
import { ContentEditor } from './ContentEditor'

interface GrapesJSEditorProps {
  content: GeneratedContent
  onSave: (content: unknown) => void
}

interface CommandsConfig {
  [key: string]: {
    run: (editor: any) => void
  }
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
}

export function GrapesJSEditor({ content, onSave }: GrapesJSEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<GrapesJSEditor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useSimpleEditor, setUseSimpleEditor] = useState(true) // Usar editor simple por defecto

  // Solo inicializar GrapesJS si no se está usando el editor simple
  useEffect(() => {
    if (useSimpleEditor) {
      setIsLoading(false)
      return
    }

    // Timeout para evitar que se quede cargando indefinidamente
    const timeout = setTimeout(() => {
      if (isLoading) {
        setUseSimpleEditor(true)
        setIsLoading(false)
      }
    }, 10000) // 10 segundos de timeout

    const initEditor = async () => {
      if (editorRef.current && !editor && !useSimpleEditor) {
        try {
          // Importar GrapesJS dinámicamente
          const grapesjs = await import('grapesjs')
          
          const editorInstance = grapesjs.default.init({
            container: editorRef.current,
            height: '100%',
            width: '100%',
            storageManager: false,
            // Configuración completa para editor visual tipo WordPress
            plugins: [
              'gjs-blocks-basic',
              'gjs-plugin-forms',
              'gjs-preset-webpage'
            ],
            pluginsOpts: {
              'gjs-blocks-basic': { flexGrid: 1 },
              'gjs-plugin-forms': {
                blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio']
              },
              'gjs-preset-webpage': {
                modalImportTitle: 'Importar Template',
                modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Pegar aquí tu HTML/CSS y hacer clic en Importar</div>',
                modalImportContent: function(editor: any) {
                  return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
                }
              }
            },
            // Configuración del canvas
            canvas: {
              styles: [
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
              ]
            },
            // Paneles laterales
            panels: {
              defaults: [
                {
                  id: 'layers',
                  el: '.panel__right',
                  resizable: {
                    maxDim: 350,
                    minDim: 200,
                    tc: false,
                    cl: true,
                    cr: false,
                    bc: false,
                    keyWidth: 'flex-basis',
                  },
                },
                {
                  id: 'panel-switcher',
                  el: '.panel__switcher',
                  buttons: [
                    {
                      id: 'show-layers',
                      active: true,
                      label: 'Capas',
                      command: 'show-layers',
                      togglable: false,
                    },
                    {
                      id: 'show-style',
                      active: true,
                      label: 'Estilos',
                      command: 'show-styles',
                      togglable: false,
                    },
                    {
                      id: 'show-traits',
                      active: true,
                      label: 'Configuración',
                      command: 'show-traits',
                      togglable: false,
                    }
                  ],
                },
                {
                  id: 'panel-devices',
                  el: '.panel__devices',
                  buttons: [
                    {
                      id: 'device-desktop',
                      label: '🖥️',
                      command: 'set-device-desktop',
                      active: true,
                      togglable: false,
                    },
                    {
                      id: 'device-tablet',
                      label: '📱',
                      command: 'set-device-tablet',
                      togglable: false,
                    },
                    {
                      id: 'device-mobile',
                      label: '📱',
                      command: 'set-device-mobile',
                      togglable: false,
                    }
                  ],
                }
              ]
            },
            // Bloques básicos para arrastrar
            blockManager: {
              appendTo: '.blocks-container'
            },
            // Selector de estilos
            selectorManager: {
              appendTo: '.styles-container'
            },
            // Trait manager para propiedades
            traitManager: {
              appendTo: '.traits-container'
            },
            // Comandos personalizados
            commands: {
              // 'show-layers': {
              //   run: function(editor: any) {
              //     const panel = editor.Panels.getPanel('layers')
              //     if (panel) panel.set('visible', true)
              //   }
              // },
              // 'show-styles': {
              //   run: function(editor: any) {
              //     const panel = editor.Panels.getPanel('layers')
              //     if (panel) panel.set('visible', false)
              //   }
              // },
              // 'show-traits': {
              //   run: function(editor: any) {
              //     const panel = editor.Panels.getPanel('layers')
              //     if (panel) panel.set('visible', false)
              //   }
              // },
              'set-device-desktop': {
                run: function(editor: any) {
                  editor.setDevice('Desktop')
                }
              },
              'set-device-tablet': {
                run: function(editor: any) {
                  editor.setDevice('Tablet')
                }
              },
              'set-device-mobile': {
                run: function(editor: any) {
                  editor.setDevice('Mobile portrait')
                }
              }
            } as CommandsConfig
          })

          // Cargar contenido generado
          if (content) {
            try {
              // Verificar que el contenido HTML sea válido
              if (content.html_content && content.html_content.trim()) {
                editorInstance.setComponents(content.html_content)
              }
              
              // Verificar que el contenido CSS sea válido
              if (content.css_content && content.css_content.trim()) {
                editorInstance.setStyle(content.css_content)
              }
              
              // Agregar JavaScript si existe
              if (content.js_content && content.js_content.trim()) {
                const script = document.createElement('script')
                script.textContent = content.js_content
                script.id = `grapesjs-script-${content.id}`
                // Remover script anterior si existe
                const existingScript = document.getElementById(`grapesjs-script-${content.id}`)
                if (existingScript) {
                  existingScript.remove()
                }
                document.head.appendChild(script)
              }
            } catch {
              // Mostrar contenido de fallback
              editorInstance.setComponents('<div class="p-4 text-center text-gray-600"><h3>Error al cargar contenido</h3><p>El contenido generado no se pudo cargar correctamente.</p></div>')
            }
          }

          clearTimeout(timeout)
          setEditor(editorInstance)
          setIsLoading(false)
        } catch {
          clearTimeout(timeout)
          setUseSimpleEditor(true)
          setIsLoading(false)
        }
      }
    }

    initEditor()

    return () => {
      clearTimeout(timeout)
      if (editor) {
        editor.destroy()
      }
    }
  }, [editor, content, isLoading, useSimpleEditor])

  const handleSave = async () => {
    if (editor && !isSaving) {
      setIsSaving(true)
      try {
        const html = editor.getHtml()
        const css = editor.getCss() || ''
        const components = editor.getComponents()
        
        const updatedContent = {
          html,
          css,
          components,
          title: content.title,
          id: content.id
        }
        
        await onSave(updatedContent)
        
        // Mostrar mensaje de éxito
        editor.Modal.setTitle('¡Guardado!')
        editor.Modal.setContent('El contenido educativo ha sido guardado exitosamente.')
        editor.Modal.open()
      } catch (error) {
        console.error('Error al guardar contenido:', error)
        editor.Modal.setTitle('Error')
        editor.Modal.setContent(`Hubo un error al guardar el contenido: ${error instanceof Error ? error.message : 'Error desconocido'}. Inténtalo de nuevo.`)
        editor.Modal.open()
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handlePreview = () => {
    if (editor) {
      editor.runCommand('preview')
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
          <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    )
  }

  // Si se decidió usar el editor simple, mostrar el editor simple
  if (useSimpleEditor) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar para cambiar de editor */}
        <div className="p-2 border-b bg-gray-50">
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setUseSimpleEditor(false)
                setIsLoading(true)
                setEditor(null)
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              title="Cambiar a GrapesJS"
            >
              🎨 Usar GrapesJS
            </button>
          </div>
        </div>
        <div className="flex-1">
          <ContentEditor content={content} onSave={onSave} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar el editor</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setError(null)
                setIsLoading(true)
                setEditor(null)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
            >
              Intentar GrapesJS de nuevo
            </button>
            <button
              onClick={() => setUseSimpleEditor(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Usar Editor Simple
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Editor de Contenido - {content.title}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setUseSimpleEditor(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              title="Cambiar a editor simple"
            >
              📝 Editor Simple
            </button>
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              disabled={isSaving}
            >
              Vista Previa
            </button>
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
      </div>

      {/* Editor Layout tipo WordPress */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel Izquierdo - Bloques */}
        <div className="w-64 bg-gray-100 border-r flex flex-col">
          <div className="p-3 border-b bg-white">
            <h4 className="font-semibold text-gray-800">Elementos</h4>
            <p className="text-sm text-gray-600">Arrastra elementos al canvas</p>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="blocks-container"></div>
          </div>
        </div>

        {/* Área Central - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Barra de Herramientas del Canvas */}
          <div className="p-2 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="panel__devices flex space-x-1"></div>
              </div>
              <div className="panel__switcher flex space-x-1"></div>
            </div>
          </div>
          
          {/* Canvas */}
          <div className="flex-1 relative">
            <div ref={editorRef} className="h-full w-full"></div>
          </div>
        </div>

        {/* Panel Derecho - Propiedades */}
        <div className="w-80 bg-gray-100 border-l flex flex-col">
          <div className="p-3 border-b bg-white">
            <h4 className="font-semibold text-gray-800">Propiedades</h4>
            <p className="text-sm text-gray-600">Configura el elemento seleccionado</p>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="traits-container"></div>
            <div className="styles-container"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
