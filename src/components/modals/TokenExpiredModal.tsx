import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface TokenExpiredModalProps {
  isOpen: boolean
  onClose: () => void
  onRedirectToLogin: () => void
}

export const TokenExpiredModal: React.FC<TokenExpiredModalProps> = ({
  isOpen,
  onClose,
  onRedirectToLogin,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sesión Expirada"
      size="md"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tu sesión ha expirado
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          Por seguridad, tu sesión ha expirado. Necesitas iniciar sesión nuevamente para continuar.
        </p>
        
        <div className="flex justify-center space-x-3">
          <Button
            variant="primary"
            onClick={onRedirectToLogin}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            }
          >
            Ir al Login
          </Button>
        </div>
      </div>
    </Modal>
  )
}
