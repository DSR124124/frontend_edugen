import React from 'react'

interface ProgressBarProps {
  progress: number
  message?: string
  isVisible: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  message = 'Generando contenido educativo...', 
  isVisible 
}) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {message}
            </h3>
            <p className="text-sm text-gray-600">
              Por favor espera mientras generamos tu contenido educativo...
            </p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>🎓 Generando contenido educativo personalizado</p>
            <p>⚡ Optimizado para edición con GrapesJS</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
