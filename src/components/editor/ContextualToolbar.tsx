// import React from 'react' // Unused import
import { Button } from '../ui/Button'
import { 
  Copy, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Wand2,
  Loader2
} from 'lucide-react'

interface ContextualToolbarProps {
  blockId: string
  onAction: (action: string, blockId: string) => void
  onAIAction: (action: string, prompt: string) => void
  enableAI?: boolean
  isLoading?: boolean
}

export function ContextualToolbar({
  blockId,
  onAction,
  onAIAction,
  enableAI = true,
  isLoading = false
}: ContextualToolbarProps) {
  const handleAction = (action: string) => {
    onAction(action, blockId)
  }

  const handleAIAction = (action: string, prompt: string) => {
    onAIAction(action, prompt)
  }

  return (
    <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-10">
      {/* Block Actions */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAction('duplicate')}
        className="h-8 w-8 p-0"
        title="Duplicar bloque"
      >
        <Copy className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAction('move_up')}
        className="h-8 w-8 p-0"
        title="Mover arriba"
      >
        <MoveUp className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAction('move_down')}
        className="h-8 w-8 p-0"
        title="Mover abajo"
      >
        <MoveDown className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAction('delete')}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Eliminar bloque"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* AI Actions */}
      {enableAI && (
        <div className="border-l border-gray-200 pl-1 ml-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAIAction('improve', 'Mejora este bloque')}
            disabled={isLoading}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Mejorar con IA"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
