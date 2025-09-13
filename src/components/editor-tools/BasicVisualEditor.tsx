import { useState, useRef, useEffect } from 'react'
import { GeneratedContent } from '../../api/endpoints'

// Importar herramientas educativas, de formato y de diseño
declare global {
  interface Window {
    EducationalContentTools: any
    TextFormatTools: any
    LayoutDesignTools: any
  }
}

interface BasicVisualEditorProps {
  content: GeneratedContent
  onSave: (content: unknown) => void
}

export function BasicVisualEditor({ content, onSave }: BasicVisualEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [activePanel, setActivePanel] = useState<'layers' | 'styles' | 'properties'>('layers')
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  const [editingText, setEditingText] = useState('')
  const [htmlContent, setHtmlContent] = useState(() => {
    // Procesar el contenido HTML generado para hacerlo editable
    if (content.html_content) {
      let processedHtml = content.html_content
      
      // Función mejorada para agregar clase editable-element
      const addEditableClass = (tag: string, html: string) => {
        // Buscar tanto con comillas dobles como simples
        const regex = new RegExp(`<${tag}([^>]*?)(?:class\\s*=\\s*["']([^"']*)["'])?([^>]*?)>`, 'gi')
        return html.replace(regex, (match, beforeClass, existingClass, afterClass) => {
          if (existingClass) {
            // Si ya tiene clase, agregar editable-element
            return `<${tag}${beforeClass}class="${existingClass} editable-element"${afterClass}>`
          } else {
            // Si no tiene clase, agregar nueva
            return `<${tag}${beforeClass}class="editable-element"${afterClass}>`
          }
        })
      }
      
      // Aplicar a todos los elementos comunes
      processedHtml = addEditableClass('h1', processedHtml)
      processedHtml = addEditableClass('h2', processedHtml)
      processedHtml = addEditableClass('h3', processedHtml)
      processedHtml = addEditableClass('h4', processedHtml)
      processedHtml = addEditableClass('h5', processedHtml)
      processedHtml = addEditableClass('h6', processedHtml)
      processedHtml = addEditableClass('p', processedHtml)
      processedHtml = addEditableClass('div', processedHtml)
      processedHtml = addEditableClass('span', processedHtml)
      processedHtml = addEditableClass('ul', processedHtml)
      processedHtml = addEditableClass('ol', processedHtml)
      processedHtml = addEditableClass('li', processedHtml)
      processedHtml = addEditableClass('button', processedHtml)
      processedHtml = addEditableClass('img', processedHtml)
      processedHtml = addEditableClass('a', processedHtml)
      processedHtml = addEditableClass('strong', processedHtml)
      processedHtml = addEditableClass('em', processedHtml)
      processedHtml = addEditableClass('b', processedHtml)
      processedHtml = addEditableClass('i', processedHtml)
      processedHtml = addEditableClass('u', processedHtml)
      processedHtml = addEditableClass('blockquote', processedHtml)
      processedHtml = addEditableClass('code', processedHtml)
      processedHtml = addEditableClass('pre', processedHtml)
      processedHtml = addEditableClass('table', processedHtml)
      processedHtml = addEditableClass('tr', processedHtml)
      processedHtml = addEditableClass('td', processedHtml)
      processedHtml = addEditableClass('th', processedHtml)
      
      return processedHtml
    }
    return ''
  })
  const [cssContent, setCssContent] = useState(content.css_content || '')
  const [jsContent, setJsContent] = useState(content.js_content || '')
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dropIndicator, setDropIndicator] = useState<{ x: number; y: number; visible: boolean; position: number }>({ x: 0, y: 0, visible: false, position: -1 })
  const canvasRef = useRef<HTMLDivElement>(null)

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
        
        // Mostrar mensaje de éxito
        alert('✅ Contenido guardado exitosamente')
      } catch (error) {
        console.error('Error al guardar contenido:', error)
        alert(`❌ Error al guardar contenido: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const addElement = (tag: string, content: string = '') => {
    // Mapeo de ejemplos educativos
    const educationalExamples: { [key: string]: string } = {
      'h1': 'Tema Principal',
      'h2': 'Objetivos de Aprendizaje', 
      'h3': 'Concepto Clave',
      'p': 'Explicación del contenido educativo',
      'ul': '<li>Punto importante</li><li>Otro concepto</li><li>Información adicional</li>',
      'button': 'Ejercicio',
      'img': '',
      'div': 'Sección de contenido'
    }
    
    const exampleContent = content || educationalExamples[tag] || 'Contenido educativo'
    const newElement = `<${tag} class="editable-element">${exampleContent}</${tag}>`
    setHtmlContent(prev => prev + newElement)
  }

  const addStyle = (selector: string, styles: string) => {
    const newStyle = `${selector} { ${styles} }`
    setCssContent(prev => prev + '\n' + newStyle)
  }

  const handleElementClick = (element: HTMLElement) => {
    // Remover selección anterior
    document.querySelectorAll('.editable-element.selected').forEach(sel => sel.classList.remove('selected'))
    
    // Seleccionar elemento actual
    element.classList.add('selected')
    setSelectedElement(element)
    
    // Actualizar el texto de edición
    setEditingText(element.textContent || '')
    
    // Activar automáticamente el panel de propiedades
    setActivePanel('properties')
  }

  // Funciones de arrastrar y soltar
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    setDraggedElement(elementType)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setDraggedElement(null)
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    
    // Mostrar indicador de drop
    if (isDragging) {
      const insertPosition = getInsertPosition(htmlContent, e.clientX, e.clientY)
      setDropIndicator({
        x: e.clientX,
        y: e.clientY,
        visible: true,
        position: insertPosition
      })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedElement) {
      const elementMap: { [key: string]: { tag: string; content: string } } = {
        'h1': { tag: 'h1', content: 'Tema Principal' },
        'h2': { tag: 'h2', content: 'Objetivos de Aprendizaje' },
        'h3': { tag: 'h3', content: 'Concepto Clave' },
        'p': { tag: 'p', content: 'Explicación del contenido educativo' },
        'ul': { tag: 'ul', content: '<li>Punto importante</li><li>Otro concepto</li><li>Información adicional</li>' },
        'button': { tag: 'button', content: 'Ejercicio' },
        'img': { tag: 'img', content: '' },
        'div': { tag: 'div', content: 'Sección de contenido' }
      }

      const element = elementMap[draggedElement]
      if (element) {
        const newElement = `<${element.tag} class="editable-element">${element.content}</${element.tag}>`
        
        // Obtener el contenido actual
        const currentContent = htmlContent
        
        if (currentContent) {
          // Calcular nueva posición en tiempo real
          const insertPosition = getInsertPosition(currentContent, e.clientX, e.clientY)
          
          if (insertPosition === -1) {
            // Insertar al final si no se puede determinar la posición
            setHtmlContent(prev => prev + newElement)
          } else {
            // Insertar en la posición específica
            const beforeInsert = currentContent.substring(0, insertPosition)
            const afterInsert = currentContent.substring(insertPosition)
            const newContent = beforeInsert + newElement + afterInsert
            setHtmlContent(newContent)
          }
        } else {
          // Si no hay contenido, agregar al principio
          setHtmlContent(newElement)
        }
      }
    }
    
    setDraggedElement(null)
    setIsDragging(false)
    setDropIndicator({ x: 0, y: 0, visible: false, position: -1 })
  }

  // Función mejorada para determinar dónde insertar el elemento
  const getInsertPosition = (content: string, x: number, y: number): number => {
    // Buscar elementos existentes en el DOM real
    const existingElements = document.querySelectorAll('.editable-element')
    if (existingElements.length === 0) {
      return -1 // Insertar al final si no hay elementos
    }

    let closestElement: HTMLElement | null = null
    let closestDistance = Infinity
    let insertBefore = false

    // Encontrar el elemento más cercano al punto de drop
    existingElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const elementTop = rect.top
      const elementBottom = rect.bottom
      const elementCenterY = rect.top + rect.height / 2
      
      // Calcular distancia al elemento
      let distance = Infinity
      let shouldInsertBefore = false
      
      if (y < elementTop) {
        // Arriba del elemento
        distance = elementTop - y
        shouldInsertBefore = true
      } else if (y > elementBottom) {
        // Abajo del elemento
        distance = y - elementBottom
        shouldInsertBefore = false
      } else {
        // Dentro del elemento
        distance = Math.abs(y - elementCenterY)
        shouldInsertBefore = y < elementCenterY
      }
      
      if (distance < closestDistance) {
        closestDistance = distance
        insertBefore = shouldInsertBefore
        closestElement = element as HTMLElement
      }
    })

    if (!closestElement) return -1

    // Obtener el HTML del elemento más cercano
    const elementHTML = closestElement.outerHTML
    const elementIndex = content.indexOf(elementHTML)
    
    if (elementIndex === -1) return -1

    if (insertBefore) {
      // Insertar antes del elemento
      return elementIndex
    } else {
      // Insertar después del elemento
      return elementIndex + elementHTML.length
    }
  }

  // Cargar herramientas educativas, de formato y de diseño
  useEffect(() => {
    const loadTools = async () => {
      try {
        // Cargar herramientas educativas
        const eduScript = document.createElement('script')
        eduScript.src = '/editor-educational-content.js'
        eduScript.onload = () => {
          if (window.EducationalContentTools) {
            window.EducationalContentTools.init()
          }
        }
        document.head.appendChild(eduScript)

        // Cargar herramientas de formato
        const formatScript = document.createElement('script')
        formatScript.src = '/editor-text-format.js'
        formatScript.onload = () => {
          if (window.TextFormatTools) {
            window.TextFormatTools.init()
          }
        }
        document.head.appendChild(formatScript)

        // Cargar herramientas de diseño
        const layoutScript = document.createElement('script')
        layoutScript.src = '/editor-layout-design.js'
        layoutScript.onload = () => {
          if (window.LayoutDesignTools) {
            window.LayoutDesignTools.init()
          }
        }
        document.head.appendChild(layoutScript)
      } catch (error) {
        console.error('Error cargando herramientas:', error)
      }
    }

    loadTools()
  }, [])

  // Procesar contenido existente para hacerlo editable
  useEffect(() => {
    const processExistingContent = () => {
      const editableContent = document.querySelector('.editable-content')
      if (editableContent) {
        // Buscar todos los elementos que deberían ser editables
        const allElements = editableContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span, ul, ol, li, button, img, a, strong, em, b, i, u, blockquote, code, pre, table, tr, td, th')
        allElements.forEach(element => {
          if (!element.classList.contains('editable-element')) {
            element.classList.add('editable-element')
          }
        })
      }
    }

    // Ejecutar después de que el componente se monte
    const timer = setTimeout(processExistingContent, 200)
    return () => clearTimeout(timer)
  }, [])

  // Verificar elementos editables cuando cambie el HTML
  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.editable-element')
      // Los elementos están listos para ser editables
      
      // Asegurar que todos los elementos dentro del editor sean editables
      const editableContent = document.querySelector('.editable-content')
      if (editableContent) {
        // Buscar elementos que no tengan la clase editable-element
        const allElements = editableContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span, ul, ol, li, button, img, a, strong, em, b, i, u, blockquote, code, pre, table, tr, td, th')
        allElements.forEach(element => {
          if (!element.classList.contains('editable-element')) {
            element.classList.add('editable-element')
          }
        })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [htmlContent])

  // Escuchar cambios de contenido desde las herramientas externas
  useEffect(() => {
    const handleContentChange = () => {
      const editableContent = document.querySelector('.editable-content')
      if (editableContent) {
        const newHtmlContent = editableContent.innerHTML
        if (newHtmlContent !== htmlContent) {
          setHtmlContent(newHtmlContent)
        }
        
        // Asegurar que los nuevos elementos sean editables
        const allElements = editableContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span, ul, ol, li, button, img, a, strong, em, b, i, u, blockquote, code, pre, table, tr, td, th')
        allElements.forEach(element => {
          if (!element.classList.contains('editable-element')) {
            element.classList.add('editable-element')
          }
        })
      }
    }

    // Escuchar evento personalizado de cambio de contenido
    document.addEventListener('contentChanged', handleContentChange)
    
    // También escuchar cambios directos en el DOM
    const editableContent = document.querySelector('.editable-content')
    if (editableContent) {
      editableContent.addEventListener('input', handleContentChange)
      editableContent.addEventListener('DOMSubtreeModified', handleContentChange)
    }

    return () => {
      document.removeEventListener('contentChanged', handleContentChange)
      if (editableContent) {
        editableContent.removeEventListener('input', handleContentChange)
        editableContent.removeEventListener('DOMSubtreeModified', handleContentChange)
      }
    }
  }, [htmlContent])


  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar Superior */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Editor Visual - {content.title}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

      {/* Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
                        {/* Panel Izquierdo - Elementos */}
                        <div className="w-64 bg-gray-100 border-r">
                          <div className="p-3 border-b bg-white">
                            <h4 className="font-semibold text-gray-800">Herramientas del Editor</h4>
                            <p className="text-sm text-gray-600">Herramientas especializadas para crear contenido educativo</p>
                          </div>
                          
                          {/* Panel de Herramientas Especializadas */}
                          <div className="p-3">
                            {/* Herramientas Educativas */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">🎓 Contenido Educativo</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      if (window.EducationalContentTools) {
                                        const toolsContainer = document.getElementById('educational-tools-container')
                                        if (toolsContainer) {
                                          // Limpiar contenido anterior
                                          toolsContainer.innerHTML = ''
                                          // Crear nuevas herramientas
                                          window.EducationalContentTools.createEducationalToolbar(toolsContainer)
                                        }
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Mostrar
                                  </button>
                                  <button
                                    onClick={() => {
                                      const toolsContainer = document.getElementById('educational-tools-container')
                                      if (toolsContainer) {
                                        toolsContainer.innerHTML = ''
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                  >
                                    Ocultar
                                  </button>
                                </div>
                              </div>
                              <div id="educational-tools-container" className="space-y-1"></div>
                            </div>
                            
                            {/* Herramientas de Formato */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">📝 Formato de Texto</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      if (window.TextFormatTools) {
                                        const toolsContainer = document.getElementById('format-tools-container')
                                        if (toolsContainer) {
                                          // Limpiar contenido anterior
                                          toolsContainer.innerHTML = ''
                                          // Crear nuevas herramientas
                                          window.TextFormatTools.createFormatToolbar(toolsContainer)
                                        }
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                  >
                                    Mostrar
                                  </button>
                                  <button
                                    onClick={() => {
                                      const toolsContainer = document.getElementById('format-tools-container')
                                      if (toolsContainer) {
                                        toolsContainer.innerHTML = ''
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                  >
                                    Ocultar
                                  </button>
                                </div>
                              </div>
                              <div id="format-tools-container" className="space-y-1"></div>
                            </div>
                            
                            {/* Herramientas de Diseño */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">🏗️ Diseño y Layout</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      if (window.LayoutDesignTools) {
                                        const toolsContainer = document.getElementById('layout-tools-container')
                                        if (toolsContainer) {
                                          // Limpiar contenido anterior
                                          toolsContainer.innerHTML = ''
                                          // Crear nuevas herramientas
                                          window.LayoutDesignTools.createLayoutToolbar(toolsContainer)
                                        }
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                                  >
                                    Mostrar
                                  </button>
                                  <button
                                    onClick={() => {
                                      const toolsContainer = document.getElementById('layout-tools-container')
                                      if (toolsContainer) {
                                        toolsContainer.innerHTML = ''
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                  >
                                    Ocultar
                                  </button>
                                </div>
                              </div>
                              <div id="layout-tools-container" className="space-y-1"></div>
                            </div>
                          </div>
        </div>

        {/* Área Central - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Barra de Herramientas */}
          <div className="p-2 border-b bg-white">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActivePanel('layers')}
                className={`px-3 py-1 rounded text-sm ${
                  activePanel === 'layers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Capas
              </button>
              <button
                onClick={() => setActivePanel('styles')}
                className={`px-3 py-1 rounded text-sm ${
                  activePanel === 'styles' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Estilos
              </button>
              <button
                onClick={() => setActivePanel('properties')}
                className={`px-3 py-1 rounded text-sm ${
                  activePanel === 'properties' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Propiedades
              </button>
            </div>
          </div>
          
          {/* Canvas */}
          <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
            <div 
              ref={canvasRef}
              className={`bg-white min-h-full p-6 rounded-lg shadow-sm transition-colors ${
                isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
              style={{ 
                minHeight: '500px',
                border: '2px dashed',
                position: 'relative'
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div 
                className="editable-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  
                  const target = e.target as HTMLElement
                  
                  // Buscar elemento editable
                  let element: HTMLElement | null = null
                  
                  if (target.classList.contains('editable-element')) {
                    element = target
                  } else {
                    element = target.closest('.editable-element') as HTMLElement
                  }
                  
                  if (element) {
                    handleElementClick(element)
                  }
                }}
              />
              {htmlContent === '' && (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-lg font-medium">Editor Visual</p>
                  <p className="text-sm">Arrastra elementos del panel izquierdo aquí o haz clic para agregar</p>
                </div>
              )}
              
              {/* Indicador de drop */}
              {dropIndicator.visible && (
                <div
                  className="absolute bg-blue-500 h-1 w-full rounded opacity-75 pointer-events-none z-10"
                  style={{
                    left: 0,
                    top: dropIndicator.y - canvasRef.current?.getBoundingClientRect().top || 0,
                    transform: 'translateY(-2px)'
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Panel Derecho - Propiedades */}
        <div className="w-80 bg-gray-100 border-l">
          {activePanel === 'layers' && (
            <div className="p-3">
              <h4 className="font-semibold text-gray-800 mb-3">Capas</h4>
              <div className="space-y-2">
                <div className="p-2 bg-white border rounded">
                  <div className="text-sm font-medium">Documento</div>
                  <div className="text-xs text-gray-500">Contenido principal</div>
                </div>
                {htmlContent && (
                  <div className="p-2 bg-white border rounded">
                    <div className="text-sm font-medium">Elementos</div>
                    <div className="text-xs text-gray-500">{htmlContent.split('<').length - 1} elementos</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activePanel === 'styles' && (
            <div className="p-3">
              <h4 className="font-semibold text-gray-800 mb-3">Estilos</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color de fondo
                  </label>
                  <input
                    type="color"
                    className="w-full h-8 border rounded"
                    onChange={(e) => addStyle('body', `background-color: ${e.target.value};`)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color de texto
                  </label>
                  <input
                    type="color"
                    className="w-full h-8 border rounded"
                    onChange={(e) => addStyle('body', `color: ${e.target.value};`)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamaño de fuente
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    onChange={(e) => addStyle('body', `font-size: ${e.target.value};`)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {activePanel === 'properties' && (
            <div className="p-3">
              <h4 className="font-semibold text-gray-800 mb-3">Propiedades</h4>
              {selectedElement ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texto del Elemento
                    </label>
                    <textarea
                      className="w-full p-2 border rounded min-h-[80px] resize-y"
                      value={editingText}
                      placeholder="Escribe el texto aquí..."
                      onChange={(e) => {
                        const newText = e.target.value
                        setEditingText(newText)
                        if (selectedElement) {
                          selectedElement.textContent = newText
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Haz clic aquí para editar el texto del elemento seleccionado
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clase CSS
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      defaultValue={selectedElement.className || ''}
                      onChange={(e) => {
                        if (selectedElement) {
                          selectedElement.className = e.target.value
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      defaultValue={selectedElement.id || ''}
                      onChange={(e) => {
                        if (selectedElement) {
                          selectedElement.id = e.target.value
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Selecciona un elemento para editarlo</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .editable-element {
          cursor: pointer;
          border: 2px dashed transparent;
          padding: 4px;
          margin: 2px;
          transition: all 0.2s;
          position: relative;
        }
        .editable-element:hover {
          border-color: #3b82f6;
          background-color: rgba(59, 130, 246, 0.1);
        }
        .editable-element.selected {
          border-color: #3b82f6;
          background-color: rgba(59, 130, 246, 0.2);
        }
        .editable-element::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 1px solid transparent;
          pointer-events: none;
        }
        .editable-element:hover::before {
          border-color: #3b82f6;
        }
        .editable-element.selected::before {
          border-color: #3b82f6;
          background-color: rgba(59, 130, 246, 0.1);
        }
        ${cssContent}
      ` }} />
    </div>
  )
}
