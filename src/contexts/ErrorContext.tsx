import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface ErrorInfo {
  id: string
  message: string
  type: 'error' | 'warning' | 'info'
  timestamp: Date
  details?: string
}

interface ErrorContextType {
  errors: ErrorInfo[]
  addError: (message: string, type?: ErrorInfo['type'], details?: string) => void
  removeError: (id: string) => void
  clearErrors: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function useError() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

interface ErrorProviderProps {
  children: ReactNode
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errors, setErrors] = useState<ErrorInfo[]>([])

  const addError = useCallback((message: string, type: ErrorInfo['type'] = 'error', details?: string) => {
    const error: ErrorInfo = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date(),
      details,
    }
    
    setErrors(prev => [...prev, error])
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== error.id))
    }, 5000)
  }, [])

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const value = {
    errors,
    addError,
    removeError,
    clearErrors,
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}
