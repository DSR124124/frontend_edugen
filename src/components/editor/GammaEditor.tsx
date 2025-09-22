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

// Función para comprimir imágenes
const compressImage = (dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new window.Image()
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo la proporción
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Convertir a base64 con compresión
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      resolve(compressedDataUrl)
    }
    
    img.src = dataUrl
  })
}

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
  onUpdateCalloutTitle: (blockId: string, title: string) => void
  onUpdateImageProperties: (blockId: string, media: { src: string; alt: string }) => void
  onUpdateListItems: (blockId: string, items: string[]) => void
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
  onUpdateCalloutTitle,
  onUpdateImageProperties,
  onUpdateListItems,
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
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
              
              const files = Array.from(e.dataTransfer.files)
              const imageFile = files.find(file => file.type.startsWith('image/'))
              
              if (imageFile) {
                const reader = new FileReader()
                reader.onload = async (event) => {
                  const imageUrl = event.target?.result as string
                  
                  // Comprimir imagen si es muy grande
                  const compressedUrl = await compressImage(imageUrl, 800, 600)
                  
                  onUpdateImageProperties(block.id, {
                    src: compressedUrl,
                    alt: block.media?.alt || imageFile.name
                  })
                }
                reader.readAsDataURL(imageFile)
              }
            }}
          >
            {block.media?.src && !block.media.src.startsWith('data:') && !block.media.src.startsWith('http') ? (
              // Mostrar placeholder si no es una imagen válida
              <div>
                <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">Arrastra una imagen aquí</p>
              </div>
            ) : block.media?.src ? (
              // Mostrar imagen real
              <div>
                <img 
                  src={block.media.src} 
                  alt={block.media.alt || 'Imagen'} 
                  className="max-w-full max-h-64 mx-auto rounded-lg mb-4"
                  onError={(e) => {
                    // Si la imagen falla al cargar, mostrar placeholder
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="hidden">
                  <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Arrastra una imagen aquí</p>
                </div>
              </div>
            ) : (
              // Mostrar placeholder por defecto
              <div>
                <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">Arrastra una imagen aquí</p>
              </div>
            )}
            
            <div className="space-y-2">
              <input
                type="text"
                value={block.media?.alt || ''}
                onChange={(e) => onUpdateImageProperties(block.id, { 
                  src: block.media?.src || '', 
                  alt: e.target.value 
                })}
                className="w-full text-center text-gray-500 border-none outline-none bg-transparent"
                placeholder="Título de la imagen..."
              />
              <input
                type="text"
                value={block.media?.src || ''}
                onChange={(e) => onUpdateImageProperties(block.id, { 
                  src: e.target.value, 
                  alt: block.media?.alt || '' 
                })}
                className="w-full text-center text-sm text-gray-400 border-none outline-none bg-transparent"
                placeholder="URL de la imagen..."
              />
              <div className="flex flex-col items-center space-y-2">
                <p className="text-xs text-gray-400">O arrastra una imagen desde tu computadora</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = async (event) => {
                        const imageUrl = event.target?.result as string
                        
                        // Comprimir imagen si es muy grande
                        const compressedUrl = await compressImage(imageUrl, 800, 600)
                        
                        onUpdateImageProperties(block.id, {
                          src: compressedUrl,
                          alt: block.media?.alt || file.name
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                  id={`file-input-${block.id}`}
                />
                <button
                  onClick={() => document.getElementById(`file-input-${block.id}`)?.click()}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Seleccionar archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {block.type === 'list' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <div className="space-y-2">
            {block.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-400">•</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items]
                    newItems[index] = e.target.value
                    onUpdateListItems(block.id, newItems)
                  }}
                  className="flex-1 text-gray-700 border-none outline-none bg-transparent"
                  placeholder="Elemento de la lista..."
                />
                <button
                  onClick={() => {
                    const newItems = block.items.filter((_, i) => i !== index)
                    onUpdateListItems(block.id, newItems)
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...block.items, 'Nuevo elemento']
                onUpdateListItems(block.id, newItems)
              }}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              + Agregar elemento
            </button>
          </div>
        </div>
      )}

      {block.type === 'callout' && (
        <div className={`p-4 rounded-lg border-l-4 ${
          block.variant === 'info' ? 'bg-blue-50 border-blue-400' :
          block.variant === 'warning' ? 'bg-yellow-50 border-yellow-400' :
          block.variant === 'success' ? 'bg-green-50 border-green-400' :
          'bg-red-50 border-red-400'
        }`}>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => onUpdateCalloutTitle(block.id, e.target.value)}
            className="w-full font-semibold mb-2 border-none outline-none bg-transparent"
            placeholder="Título del callout (opcional)..."
          />
          <textarea
            value={block.content}
            onChange={(e) => onUpdateContent(block.id, e.target.value)}
            className="w-full text-gray-700 border-none outline-none bg-transparent resize-none"
            placeholder="Contenido del callout..."
            rows={3}
          />
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
          const temp = updatedBlocks[blockIndex - 1]
          updatedBlocks[blockIndex - 1] = updatedBlocks[blockIndex]
          updatedBlocks[blockIndex] = temp
        }
        break

      case 'move_down':
        if (blockIndex < updatedBlocks.length - 1) {
          const temp = updatedBlocks[blockIndex + 1]
          updatedBlocks[blockIndex + 1] = updatedBlocks[blockIndex]
          updatedBlocks[blockIndex] = temp
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
  }, [document, addToHistory])

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
        } else if (block.type === 'callout') {
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

  // Update callout title
  const updateCalloutTitle = useCallback((blockId: string, title: string) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId && block.type === 'callout') {
        return { ...block, title } as Block
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

  // Update image properties
  const updateImageProperties = useCallback((blockId: string, media: { src: string; alt: string }) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId && block.type === 'image') {
        return { ...block, media: { ...block.media, ...media } } as Block
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

  // Update list items
  const updateListItems = useCallback((blockId: string, items: string[]) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId && block.type === 'list') {
        return { ...block, items } as Block
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

  // Update document when initialDocument changes (only if it's a different document)
  useEffect(() => {
    if (initialDocument && initialDocument.id !== document.id) {
      setDocument(initialDocument)
    }
  }, [initialDocument, document.id])

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

  const handleUpdateCalloutTitle = useCallback((blockId: string, title: string) => {
    updateCalloutTitle(blockId, title)
  }, [updateCalloutTitle])

  const handleUpdateImageProperties = useCallback((blockId: string, media: { src: string; alt: string }) => {
    updateImageProperties(blockId, media)
  }, [updateImageProperties])

  const handleUpdateListItems = useCallback((blockId: string, items: string[]) => {
    updateListItems(blockId, items)
  }, [updateListItems])

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
              onUpdateCalloutTitle={handleUpdateCalloutTitle}
              onUpdateImageProperties={handleUpdateImageProperties}
              onUpdateListItems={handleUpdateListItems}
              onBlockAction={handleBlockAction}
              onAIAction={handleAIAction}
            />
          ))
        )}
      </div>

    </div>
  )
}
