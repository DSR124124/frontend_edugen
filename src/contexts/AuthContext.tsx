import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuthStore } from '../store/auth'
import { useError } from './ErrorContext'

interface AuthContextType {
  isTokenExpired: boolean
  setTokenExpired: (expired: boolean) => void
  handleTokenExpiry: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isTokenExpired, setIsTokenExpired] = useState(false)
  const { logout } = useAuthStore()
  const { addError } = useError()

  const setTokenExpired = (expired: boolean) => {
    setIsTokenExpired(expired)
  }

  const handleTokenExpiry = () => {
    setIsTokenExpired(true)
    addError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning')
    
    // Clear auth data
    logout()
    
    // Redirect to login after a short delay to show the error
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }

  // Show token expiry message
  useEffect(() => {
    if (isTokenExpired) {
      addError('Tu sesión ha expirado. Redirigiendo al login...', 'warning')
    }
  }, [isTokenExpired, addError])

  const value = {
    isTokenExpired,
    setTokenExpired,
    handleTokenExpiry,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
