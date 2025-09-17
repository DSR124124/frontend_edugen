import React from 'react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showMessage?: boolean
}

export function LoadingSpinner({ 
  message = "Espere unos momentos, se está cargando...", 
  size = 'md',
  className = '',
  showMessage = true
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {showMessage && (
        <p className={`text-gray-600 text-center ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  )
}

// Variante para overlays completos
interface LoadingOverlayProps {
  message?: string
  isVisible: boolean
  className?: string
}

export function LoadingOverlay({ 
  message = "Espere unos momentos, se está cargando...", 
  isVisible,
  className = ''
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl">
        <LoadingSpinner 
          message={message}
          size="lg"
          showMessage={true}
        />
      </div>
    </div>
  )
}

// Variante para botones
interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = "Cargando...",
  className = '',
  disabled = false,
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center space-x-2 ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      )}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  )
}

// Variante para cards/containers
interface LoadingCardProps {
  message?: string
  isVisible: boolean
  className?: string
}

export function LoadingCard({ 
  message = "Espere unos momentos, se está cargando...", 
  isVisible,
  className = ''
}: LoadingCardProps) {
  if (!isVisible) return null

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
      <LoadingSpinner 
        message={message}
        size="lg"
        showMessage={true}
      />
    </div>
  )
}

// Variante para listas/grillas
interface LoadingListProps {
  message?: string
  itemCount?: number
  className?: string
}

export function LoadingList({ 
  message = "Espere unos momentos, se está cargando...", 
  itemCount = 3,
  className = ''
}: LoadingListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
      <div className="text-center py-4">
        <LoadingSpinner 
          message={message}
          size="sm"
          showMessage={true}
        />
      </div>
    </div>
  )
}
