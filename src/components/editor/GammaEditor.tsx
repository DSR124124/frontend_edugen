import { useState, useCallback, useEffect, memo } from 'react'
import { Document, Block, createBlock, HeroBlock, HeadingBlock, ImageBlock, ListBlock, CalloutBlock, ParagraphBlock, BlockMedia, BlockProps } from '../../types/block-schema'
import { ContextualToolbar } from './ContextualToolbar'
import { useDocumentHistory } from '../../hooks/useDocumentHistory'
import { Button } from '../ui/Button'
import { 
  Type,
  Image,
  List,
  Heading,
  Quote
} from 'lucide-react'

interface GammaEditorProps {
  document?: Document
  onSave?: (document: Document) => void
  onUpdate?: (document: Document) => void
  readOnly?: boolean
  enableAI?: boolean
  className?: string
}

interface BlockComponentProps {
  block: Block
  isSelected: boolean
  isNewlyAdded: boolean
  readOnly: boolean
  enableAI: boolean
  isLoading: boolean
  onSelect: (blockId: string) => void
  onUpdateContent: (blockId: string, content: string) => void
  onBlockAction: (action: string, blockId: string) => void
  onAIAction: (action: string, prompt: string) => void
}

// Memoized BlockComponent to prevent unnecessary re-renders
const BlockComponent = memo<BlockComponentProps>(({
  block,
  isSelected,
  isNewlyAdded,
  readOnly,
  enableAI,
  isLoading,
  onSelect,
  onUpdateContent,
  onBlockAction,
  onAIAction
}) => {
  return (
    <div
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${
        isNewlyAdded ? 'ring-2 ring-green-500 bg-green-50 animate-pulse' : ''
      } transition-all duration-200`}
      onClick={() => onSelect(block.id)}
    >
      {block.type === 'hero' && (
        <div className={`text-center py-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg ${block.props?.padding === 'medium' ? 'p-6' : ''}`}>
          <h1 className="text-4xl font-bold mb-4">{block.title}</h1>
          {block.subtitle && <p className="text-xl mb-4">{block.subtitle}</p>}
          {block.body && <p className="text-lg">{block.body}</p>}
        </div>
      )}

      {block.type === 'paragraph' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <textarea
            value={block.content}
            onChange={(e) => onUpdateContent(block.id, e.target.value)}
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe tu párrafo aquí..."
          />
        </div>
      )}

      {block.type === 'heading' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdateContent(block.id, e.target.value)}
            className="w-full text-2xl font-bold border-none outline-none bg-transparent"
            placeholder="Escribe tu encabezado aquí..."
          />
        </div>
      )}

      {block.type === 'image' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Imagen: {block.media?.alt || 'Sin título'}</p>
            <p className="text-sm text-gray-400 mt-2">URL: {block.media?.src}</p>
          </div>
        </div>
      )}

      {block.type === 'list' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <ul className="list-disc list-inside space-y-2">
            {block.items.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {block.type === 'callout' && (
        <div className={`p-4 rounded-lg border-l-4 ${
          block.variant === 'info' ? 'bg-blue-50 border-blue-400' :
          block.variant === 'warning' ? 'bg-yellow-50 border-yellow-400' :
          block.variant === 'success' ? 'bg-green-50 border-green-400' :
          'bg-red-50 border-red-400'
        }`}>
          {block.title && <h3 className="font-semibold mb-2">{block.title}</h3>}
          <p className="text-gray-700">{block.content}</p>
        </div>
      )}

      {/* Contextual Toolbar */}
      {isSelected && !readOnly && (
        <ContextualToolbar
          blockId={block.id}
          onAction={onBlockAction}
          onAIAction={onAIAction}
          enableAI={enableAI}
          isLoading={isLoading}
        />
      )}
    </div>
  )
})

BlockComponent.displayName = 'BlockComponent'

export function GammaEditor({
  document: initialDocument,
  onSave,
  onUpdate,
  readOnly = false,
  enableAI = true,
  className = ''
}: GammaEditorProps) {
  const [document, setDocument] = useState<Document>(
    initialDocument || {
      id: `doc_${Date.now()}`,
      title: 'Untitled Document',
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }
  )

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newlyAddedBlockId, setNewlyAddedBlockId] = useState<string | null>(null)

  // Manual save functionality (auto-save disabled to prevent conflicts)
  const [isSaving, setIsSaving] = useState(false)
  
  const saveDocument = useCallback(async () => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      await onSave?.(document)
    } catch (error) {
      console.error('Manual save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [document, onSave, isSaving])

  // Document history for undo/redo
  const { 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    addToHistory 
  } = useDocumentHistory(document, setDocument)

  // Handle AI actions
  const handleAIAction = useCallback(async (action: string, prompt: string) => {
    if (!enableAI) return

    setIsLoading(true)
    try {
      // Si el prompt es JSON (viene de AIActions), parsearlo
      let blocksToAdd: unknown[] = []
      
      try {
        const parsedBlocks = JSON.parse(prompt)
        if (Array.isArray(parsedBlocks)) {
          blocksToAdd = parsedBlocks
        } else {
          throw new Error('Not an array')
        }
      } catch {
        // Si no es JSON, generar usando la API
        const response = await fetch('/api/v1/ai/gamma/generate-blocks/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            prompt: `${action}: ${prompt}`,
            content_type: 'lesson',
            educational_level: 'intermediate',
            language: 'es'
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.blocks) {
            blocksToAdd = data.blocks
          } else {
            throw new Error('No blocks generated')
          }
        } else {
          throw new Error('API request failed')
        }
      }
      
      // Convertir bloques a formato del editor
      const newBlocks = blocksToAdd.map((block: unknown) => {
        const blockData = block as Record<string, unknown>
        // Mapear tipos de bloques
        switch (blockData.type) {
          case 'hero':
            return createBlock<HeroBlock>('hero', {
              title: String(blockData.title || 'Título'),
              subtitle: blockData.subtitle ? String(blockData.subtitle) : undefined,
              body: blockData.body ? String(blockData.body) : undefined,
              media: blockData.media as BlockMedia,
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          case 'heading':
            return createBlock<HeadingBlock>('heading', {
              level: (blockData.level as 1 | 2 | 3 | 4 | 5 | 6) || 2,
              content: String(blockData.content || blockData.title || 'Encabezado'),
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          case 'image':
            return createBlock<ImageBlock>('image', {
              media: (blockData.media as BlockMedia) || { type: 'image', src: '/api/placeholder/400/300', alt: 'Imagen' },
              caption: blockData.caption ? String(blockData.caption) : undefined,
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          case 'list':
            return createBlock<ListBlock>('list', {
              listType: (blockData.listType as 'ordered' | 'unordered') || 'unordered',
              items: (blockData.items as string[]) || ['Elemento 1', 'Elemento 2'],
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          case 'callout':
            return createBlock<CalloutBlock>('callout', {
              variant: (blockData.variant as 'info' | 'warning' | 'success' | 'error' | 'tip') || 'info',
              title: blockData.title ? String(blockData.title) : undefined,
              content: String(blockData.content || blockData.body || 'Contenido'),
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          default:
            return createBlock<ParagraphBlock>('paragraph', {
              content: String(blockData.content || blockData.body || `[AI Generated] ${action}`),
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
        }
      })
      
      const updatedDocument = {
        ...document,
        blocks: [...document.blocks, ...newBlocks],
        updatedAt: new Date().toISOString(),
        version: document.version + 1
      }
      
      setDocument(updatedDocument)
      addToHistory(updatedDocument)
      onUpdate?.(updatedDocument)
    } catch (error) {
      console.error('AI generation error:', error)
      
      // Fallback: crear un bloque simple
      const newBlock = createBlock<ParagraphBlock>('paragraph', {
        content: `[AI Generated] ${prompt || action}`,
        props: {
          padding: 'medium'
        }
      })
      
      const updatedDocument = {
        ...document,
        blocks: [...document.blocks, newBlock],
        updatedAt: new Date().toISOString(),
        version: document.version + 1
      }
      
      setDocument(updatedDocument)
      addToHistory(updatedDocument)
      onUpdate?.(updatedDocument)
    } finally {
      setIsLoading(false)
    }
  }, [document, enableAI, addToHistory, onUpdate])

  // Handle block actions
  const handleBlockAction = useCallback((action: string, blockId: string) => {
    const blockIndex = document.blocks.findIndex(b => b.id === blockId)
    if (blockIndex === -1) return

    const updatedBlocks = [...document.blocks]

    switch (action) {
      case 'duplicate': {
        const blockToDuplicate = document.blocks[blockIndex]
        const duplicatedBlock = {
          ...blockToDuplicate,
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        updatedBlocks.splice(blockIndex + 1, 0, duplicatedBlock)
        break
      }

      case 'delete':
        updatedBlocks.splice(blockIndex, 1)
        break

      case 'move_up':
        if (blockIndex > 0) {
          [updatedBlocks[blockIndex - 1], updatedBlocks[blockIndex]] = 
          [updatedBlocks[blockIndex], updatedBlocks[blockIndex - 1]]
        }
        break

      case 'move_down':
        if (blockIndex < updatedBlocks.length - 1) {
          [updatedBlocks[blockIndex], updatedBlocks[blockIndex + 1]] = 
          [updatedBlocks[blockIndex + 1], updatedBlocks[blockIndex]]
        }
        break
    }

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
    onUpdate?.(updatedDocument)
  }, [document, addToHistory, onUpdate])

  // Add new block
  const addBlock = useCallback((type: string) => {
    let newBlock: Block

    switch (type) {
      case 'heading':
        newBlock = createBlock<HeadingBlock>('heading', {
          level: 2,
          content: 'Nuevo encabezado',
          props: { padding: 'medium' }
        })
        break
      case 'image':
        newBlock = createBlock<ImageBlock>('image', {
          media: {
            type: 'image',
            src: '/api/placeholder/400/300',
            alt: 'Nueva imagen'
          },
          props: { padding: 'medium' }
        })
        break
      case 'list':
        newBlock = createBlock<ListBlock>('list', {
          listType: 'unordered',
          items: ['Elemento 1', 'Elemento 2', 'Elemento 3'],
          props: { padding: 'medium' }
        })
        break
      case 'callout':
        newBlock = createBlock<CalloutBlock>('callout', {
          variant: 'info',
          title: 'Nota importante',
          content: 'Este es un callout de ejemplo',
          props: { padding: 'medium' }
        })
        break
      default:
        newBlock = createBlock<ParagraphBlock>('paragraph', {
          content: 'Nuevo párrafo',
          props: { padding: 'medium' }
        })
    }

    const updatedDocument = {
      ...document,
      blocks: [...document.blocks, newBlock],
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }
    
    setDocument(updatedDocument)
    addToHistory(updatedDocument)
    
    // Mark the newly added block for visual feedback
    setNewlyAddedBlockId(newBlock.id)
    setSelectedBlockId(newBlock.id)
    
    // Clear the visual feedback after animation
    setTimeout(() => {
      setNewlyAddedBlockId(null)
    }, 2000)
  }, [document, addToHistory])

  // Update block content
  const updateBlockContent = useCallback((blockId: string, content: string) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId) {
        if (block.type === 'paragraph') {
          return { ...block, content } as Block
        } else if (block.type === 'heading') {
          return { ...block, content } as Block
        }
      }
      return block
    })

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
  }, [document, addToHistory])

  // Update document when initialDocument changes
  useEffect(() => {
    if (initialDocument) {
      setDocument(initialDocument)
    }
  }, [initialDocument])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            saveDocument()
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveDocument, undo, redo])

  // Memoized callbacks to prevent unnecessary re-renders
  const handleSelectBlock = useCallback((blockId: string) => {
    setSelectedBlockId(blockId)
  }, [])

  const handleUpdateBlockContent = useCallback((blockId: string, content: string) => {
    updateBlockContent(blockId, content)
  }, [updateBlockContent])

  return (
    <div className={`gamma-editor flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↶ Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↷ Redo
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {isSaving && (
            <span className="text-sm text-gray-500 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Guardando...
            </span>
          )}
          <button
            onClick={saveDocument}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
          >
            <span>💾</span>
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* Block Type Selector */}
      {!readOnly && (
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Agregar bloque:</span>
            <Button
              onClick={() => addBlock('paragraph')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Type className="w-4 h-4" />
              <span>Párrafo</span>
            </Button>
            <Button
              onClick={() => addBlock('heading')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Heading className="w-4 h-4" />
              <span>Encabezado</span>
            </Button>
            <Button
              onClick={() => addBlock('image')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Image className="w-4 h-4" />
              <span>Imagen</span>
            </Button>
            <Button
              onClick={() => addBlock('list')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <List className="w-4 h-4" />
              <span>Lista</span>
            </Button>
            <Button
              onClick={() => addBlock('callout')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Quote className="w-4 h-4" />
              <span>Callout</span>
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {document.blocks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">No hay bloques en este documento</p>
            <p className="text-sm">Haz clic en "Agregar bloque" para comenzar</p>
          </div>
        ) : (
          document.blocks.map(block => (
            <BlockComponent
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              isNewlyAdded={newlyAddedBlockId === block.id}
              readOnly={readOnly}
              enableAI={enableAI}
              isLoading={isLoading}
              onSelect={handleSelectBlock}
              onUpdateContent={handleUpdateBlockContent}
              onBlockAction={handleBlockAction}
              onAIAction={handleAIAction}
            />
          ))
        )}
      </div>

    </div>
  )
}
