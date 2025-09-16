import { useEffect } from 'react'

export const useModal = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'
      // Asegurar que el modal cubra toda la pantalla
      document.documentElement.style.overflow = 'hidden'
    } else {
      // Restaurar scroll cuando el modal se cierra
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }

    return () => {
      // Cleanup: restaurar scroll al desmontar
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // El modal se cerrará a través de la función onClose que se pase
        // Este hook solo maneja el comportamiento del body
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])
}

