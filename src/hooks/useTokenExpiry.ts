import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'

export const useTokenExpiry = () => {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { logout, isTokenExpired, setTokenExpired } = useAuthStore()

  useEffect(() => {
    const handleTokenExpired = () => {
      // Solo mostrar el modal - NO mostrar notificación toast
      setTokenExpired(true)
      
      // NO hacer logout inmediatamente - esperar a que el usuario confirme
    }

    // Listen for token expiry event
    window.addEventListener('tokenExpired', handleTokenExpired)

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired)
    }
  }, [setTokenExpired])

  const handleRedirectToLogin = () => {
    setIsRedirecting(true)
    
    // Ahora sí hacer logout y limpiar datos
    logout()
    
    // Small delay to show the loading state
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  }

  const dismissModal = () => {
    setTokenExpired(false)
    // Si el usuario cierra el modal sin ir al login, también hacer logout
    logout()
  }

  return {
    isTokenExpired,
    isRedirecting,
    handleRedirectToLogin,
    dismissModal,
  }
}
