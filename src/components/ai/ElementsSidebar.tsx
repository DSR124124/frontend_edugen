import { useState } from 'react'

interface ElementsSidebarProps {
  onAddElement: (elementHtml: string) => void
}

interface ElementCategory {
  id: string
  name: string
  icon: string
  elements: Element[]
}

interface Element {
  id: string
  name: string
  icon: string
  html: string
  description: string
}

const elementCategories: ElementCategory[] = [
  {
    id: 'text',
    name: 'Texto',
    icon: '📝',
    elements: [
      {
        id: 'title',
        name: 'Título Principal',
        icon: '📋',
        html: '<h1 class="text-4xl font-bold text-gray-800 mb-4">Título Principal</h1>',
        description: 'Título principal de la lección'
      },
      {
        id: 'subtitle',
        name: 'Subtítulo',
        icon: '📄',
        html: '<h2 class="text-2xl font-semibold text-gray-700 mb-3">Subtítulo</h2>',
        description: 'Subtítulo de sección'
      },
      {
        id: 'paragraph',
        name: 'Párrafo',
        icon: '📝',
        html: '<p class="text-gray-600 leading-relaxed mb-4">Escribe aquí el contenido de tu lección. Este es un párrafo de ejemplo que puedes editar.</p>',
        description: 'Párrafo de texto normal'
      },
      {
        id: 'quote',
        name: 'Cita',
        icon: '💬',
        html: '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">"Esta es una cita importante que quieres destacar."</blockquote>',
        description: 'Cita o texto destacado'
      }
    ]
  },
  {
    id: 'lists',
    name: 'Listas',
    icon: '📋',
    elements: [
      {
        id: 'bullet-list',
        name: 'Lista con viñetas',
        icon: '•',
        html: '<ul class="list-disc list-inside space-y-2 my-4"><li>Primer punto importante</li><li>Segundo punto importante</li><li>Tercer punto importante</li></ul>',
        description: 'Lista con viñetas'
      },
      {
        id: 'numbered-list',
        name: 'Lista numerada',
        icon: '1.',
        html: '<ol class="list-decimal list-inside space-y-2 my-4"><li>Primer paso</li><li>Segundo paso</li><li>Tercer paso</li></ol>',
        description: 'Lista numerada o de pasos'
      },
      {
        id: 'checklist',
        name: 'Lista de verificación',
        icon: '☑️',
        html: '<ul class="space-y-2 my-4"><li class="flex items-center"><input type="checkbox" class="mr-2" disabled> Tarea completada</li><li class="flex items-center"><input type="checkbox" class="mr-2" disabled> Tarea pendiente</li></ul>',
        description: 'Lista de tareas o verificación'
      }
    ]
  },
  {
    id: 'media',
    name: 'Medios',
    icon: '🖼️',
    elements: [
      {
        id: 'image',
        name: 'Imagen',
        icon: '🖼️',
        html: '<div class="my-4"><img src="https://via.placeholder.com/400x300/3b82f6/ffffff?text=Imagen+Educativa" alt="Imagen educativa" class="w-full h-auto rounded-lg shadow-md" /></div>',
        description: 'Imagen educativa'
      },
      {
        id: 'video',
        name: 'Video',
        icon: '🎥',
        html: '<div class="my-4"><div class="bg-gray-200 rounded-lg p-8 text-center"><p class="text-gray-600">📹 Video educativo</p><p class="text-sm text-gray-500 mt-2">Haz clic para agregar video</p></div></div>',
        description: 'Contenedor para video'
      },
      {
        id: 'audio',
        name: 'Audio',
        icon: '🎵',
        html: '<div class="my-4"><div class="bg-gray-200 rounded-lg p-6 text-center"><p class="text-gray-600">🎵 Audio educativo</p><p class="text-sm text-gray-500 mt-2">Haz clic para agregar audio</p></div></div>',
        description: 'Contenedor para audio'
      }
    ]
  },
  {
    id: 'interactive',
    name: 'Interactivo',
    icon: '🎯',
    elements: [
      {
        id: 'button',
        name: 'Botón',
        icon: '🔘',
        html: '<div class="my-4"><button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Hacer clic aquí</button></div>',
        description: 'Botón interactivo'
      },
      {
        id: 'text-input',
        name: 'Campo de texto',
        icon: '📝',
        html: '<div class="my-4"><input type="text" placeholder="Escribe tu respuesta aquí..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>',
        description: 'Campo de entrada de texto'
      },
      {
        id: 'textarea',
        name: 'Área de texto',
        icon: '📄',
        html: '<div class="my-4"><textarea placeholder="Escribe tu respuesta aquí..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"></textarea></div>',
        description: 'Área de texto multilínea'
      },
      {
        id: 'select',
        name: 'Lista desplegable',
        icon: '📋',
        html: '<div class="my-4"><select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"><option>Selecciona una opción</option><option>Opción 1</option><option>Opción 2</option></select></div>',
        description: 'Lista desplegable de opciones'
      }
    ]
  },
  {
    id: 'layout',
    name: 'Estructura',
    icon: '📦',
    elements: [
      {
        id: 'section',
        name: 'Sección',
        icon: '📦',
        html: '<div class="bg-gray-50 border border-gray-200 rounded-lg p-6 my-4"><h3 class="text-xl font-semibold text-gray-800 mb-3">Nueva Sección</h3><p class="text-gray-600">Contenido de la sección...</p></div>',
        description: 'Contenedor de sección'
      },
      {
        id: 'card',
        name: 'Tarjeta',
        icon: '🃏',
        html: '<div class="bg-white border border-gray-200 rounded-lg shadow-md p-6 my-4"><h4 class="text-lg font-semibold text-gray-800 mb-2">Título de la tarjeta</h4><p class="text-gray-600">Contenido de la tarjeta...</p></div>',
        description: 'Tarjeta de contenido'
      },
      {
        id: 'divider',
        name: 'Separador',
        icon: '➖',
        html: '<hr class="my-6 border-gray-300" />',
        description: 'Línea separadora'
      },
      {
        id: 'spacer',
        name: 'Espaciador',
        icon: '⬜',
        html: '<div class="h-8"></div>',
        description: 'Espacio en blanco'
      }
    ]
  },
  {
    id: 'math',
    name: 'Matemáticas',
    icon: '🔢',
    elements: [
      {
        id: 'formula',
        name: 'Fórmula',
        icon: '📐',
        html: '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4 text-center"><p class="text-lg font-mono text-blue-800">E = mc²</p></div>',
        description: 'Fórmula matemática'
      },
      {
        id: 'equation',
        name: 'Ecuación',
        icon: '⚖️',
        html: '<div class="bg-green-50 border border-green-200 rounded-lg p-4 my-4 text-center"><p class="text-lg font-mono text-green-800">x = (-b ± √(b² - 4ac)) / 2a</p></div>',
        description: 'Ecuación matemática'
      },
      {
        id: 'fraction',
        name: 'Fracción',
        icon: '🔢',
        html: '<div class="bg-purple-50 border border-purple-200 rounded-lg p-4 my-4 text-center"><p class="text-lg font-mono text-purple-800">1/2 + 1/3 = 5/6</p></div>',
        description: 'Fracción matemática'
      }
    ]
  }
]

export function ElementsSidebar({ onAddElement }: ElementsSidebarProps) {
  const [activeCategory, setActiveCategory] = useState<string>('text')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = elementCategories.map(category => ({
    ...category,
    elements: category.elements.filter(element =>
      element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      element.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.elements.length > 0)

  const handleElementClick = (element: Element) => {
    onAddElement(element.html)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Barra de búsqueda */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Buscar elementos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Categorías */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map(category => (
          <div key={category.id} className="border-b border-gray-100">
            <button
              onClick={() => setActiveCategory(activeCategory === category.id ? '' : category.id)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium text-gray-800">{category.name}</span>
              </div>
              <span className={`transform transition-transform ${activeCategory === category.id ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {activeCategory === category.id && (
              <div className="bg-gray-50">
                {category.elements.map(element => (
                  <button
                    key={element.id}
                    onClick={() => handleElementClick(element)}
                    className="w-full px-6 py-3 text-left hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-start space-x-3"
                  >
                    <span className="text-lg mt-0.5">{element.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800">{element.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{element.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Información de ayuda */}
      <div className="p-4 bg-blue-50 border-t">
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">💡 Consejo:</p>
          <p>Haz clic en cualquier elemento para agregarlo al editor. Luego puedes editarlo directamente en el canvas.</p>
        </div>
      </div>
    </div>
  )
}
