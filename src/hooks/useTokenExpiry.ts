import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { useError } from '../contexts/ErrorContext'

export const useTokenExpiry = () => {
  const [isTokenExpired, setIsTokenExpired] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { logout } = useAuthStore()
  const { addError } = useError()

  useEffect(() => {
    const handleTokenExpired = () => {
      setIsTokenExpired(true)
      addError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning')
      
      // Clear auth data
      logout()
    }

    // Listen for token expiry event
    window.addEventListener('tokenExpired', handleTokenExpired)

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired)
    }
  }, [logout, addError])

  const handleRedirectToLogin = () => {
    setIsRedirecting(true)
    // Small delay to show the loading state
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  }

  const dismissModal = () => {
    setIsTokenExpired(false)
  }

  return {
    isTokenExpired,
    isRedirecting,
    handleRedirectToLogin,
    dismissModal,
  }
}
