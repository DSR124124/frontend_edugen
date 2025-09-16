import { FiLoader } from 'react-icons/fi'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({ 
  message = "Cargando...", 
  size = 'md',
  className = ""
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary mb-4 ${sizeClasses[size]}`}>
        <FiLoader className="w-full h-full text-primary" />
      </div>
      <p className={`text-base-content/70 ${textSizeClasses[size]}`}>
        {message}
      </p>
    </div>
  )
}

// Variantes específicas para casos comunes
export function PageLoadingState({ message = "Cargando página..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="text-center">
        <LoadingState message={message} size="lg" />
      </div>
    </div>
  )
}

export function CardLoadingState({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="card p-4">
      <LoadingState message={message} size="md" />
    </div>
  )
}

export function TableLoadingState({ message = "Cargando datos..." }: { message?: string }) {
  return (
    <div className="text-center py-8">
      <LoadingState message={message} size="md" />
    </div>
  )
}
