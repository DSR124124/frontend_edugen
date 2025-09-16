import { FiAlertCircle, FiRefreshCw, FiHome, FiArrowLeft } from 'react-icons/fi'

interface ErrorStateProps {
  error: string | Error
  onRetry?: () => void
  retryLabel?: string
  showHomeButton?: boolean
  showBackButton?: boolean
  onHome?: () => void
  onBack?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ErrorState({ 
  error,
  onRetry,
  retryLabel = "Reintentar",
  showHomeButton = false,
  showBackButton = false,
  onHome,
  onBack,
  className = "",
  size = 'md'
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className={`p-3 bg-error-100 rounded-full mb-4 ${sizeClasses[size]}`}>
        <FiAlertCircle className={`w-full h-full text-error`} />
      </div>
      
      <h3 className={`headline-xl text-base-content mb-2 ${textSizeClasses[size]}`}>
        Error al cargar
      </h3>
      
      <p className={`text-base-content/70 mb-6 text-center max-w-md ${textSizeClasses[size]}`}>
        {errorMessage}
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>{retryLabel}</span>
          </button>
        )}

        {showBackButton && onBack && (
          <button 
            onClick={onBack}
            className="btn btn-outline btn-secondary flex items-center space-x-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        )}

        {showHomeButton && onHome && (
          <button 
            onClick={onHome}
            className="btn btn-outline btn-accent flex items-center space-x-2"
          >
            <FiHome className="w-4 h-4" />
            <span>Inicio</span>
          </button>
        )}
      </div>
    </div>
  )
}

// Variantes específicas para casos comunes
export function PageErrorState({ 
  error, 
  onRetry, 
  onHome 
}: { 
  error: string | Error
  onRetry?: () => void
  onHome?: () => void
}) {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="text-center max-w-md">
        <ErrorState 
          error={error}
          onRetry={onRetry}
          onHome={onHome}
          showHomeButton={true}
          size="lg"
        />
      </div>
    </div>
  )
}

export function CardErrorState({ 
  error, 
  onRetry 
}: { 
  error: string | Error
  onRetry?: () => void
}) {
  return (
    <div className="card p-4">
      <ErrorState 
        error={error}
        onRetry={onRetry}
        size="md"
      />
    </div>
  )
}

export function TableErrorState({ 
  error, 
  onRetry 
}: { 
  error: string | Error
  onRetry?: () => void
}) {
  return (
    <div className="text-center py-8">
      <ErrorState 
        error={error}
        onRetry={onRetry}
        size="md"
      />
    </div>
  )
}
