import { useState } from 'react'
import { 
  BLOCK_CONFIGS, 
  BLOCK_CATEGORIES, 
  BlockType,
  BlockConfig
} from './BlockTools'

interface BlockSelectorProps {
  onAddBlock: (type: BlockType) => void
  className?: string
}

export function BlockSelector({ onAddBlock, className = '' }: BlockSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof BLOCK_CATEGORIES | 'all'>('basic')

  // Filtrar bloques según la categoría
  const getFilteredBlocks = (): BlockConfig[] => {
    if (selectedCategory === 'all') {
      return BLOCK_CONFIGS
    }
    
    return BLOCK_CONFIGS.filter(block => block.category === selectedCategory)
  }

  const filteredBlocks = getFilteredBlocks()

  return (
    <div className={`block-selector flex flex-col h-full ${className}`}>
      {/* Selector de Categorías */}
      <div className="mb-4 flex-shrink-0">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as keyof typeof BLOCK_CATEGORIES | 'all')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">Todas las categorías</option>
          <option value="basic">Básicos</option>
          <option value="content">Contenido</option>
          <option value="interactive">Interactivos</option>
          <option value="media">Media</option>
          <option value="layout">Layout</option>
          <option value="advanced">Avanzados</option>
        </select>
      </div>

      {/* Lista de bloques - Ocupa todo el espacio restante */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay bloques en esta categoría</p>
          </div>
        ) : (
          filteredBlocks.map((block) => {
            const Icon = block.icon
            return (
              <button
                key={block.type}
                onClick={() => onAddBlock(block.type)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all"
              >
                <div className="p-2 rounded-lg bg-blue-100">
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 text-left">
                  <h4 className="font-medium">{block.name}</h4>
                  <p className="text-sm text-gray-500">{block.description}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
