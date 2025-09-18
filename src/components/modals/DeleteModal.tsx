import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FiAlertTriangle, FiTrash2, FiInfo } from 'react-icons/fi'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title: string
  itemName: string
  itemDescription?: string
  itemType: string
  warningMessage?: string
  details?: string[]
  confirmText?: string
  cancelText?: string
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title,
  itemName,
  itemDescription,
  itemType,
  warningMessage,
  details = [],
  confirmText,
  cancelText = 'Cancelar'
}: DeleteModalProps) {
  if (!isOpen) return null

  const defaultWarningMessage = `¿Estás seguro de que quieres eliminar este ${itemType.toLowerCase()}? Esta acción no se puede deshacer.`
  const defaultConfirmText = `Eliminar ${itemType}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Eliminar ${itemType}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Icono de advertencia */}
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-error-100">
            <FiAlertTriangle className="h-8 w-8 text-error" />
          </div>
        </div>

        {/* Información del elemento */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-base-content mb-2">
            {title}
          </h3>
          <div className="bg-base-200 rounded-lg p-4 mb-4">
            <div className="text-sm">
              <p className="font-medium text-base-content">
                {itemName}
              </p>
              {itemDescription && (
                <p className="text-base-content/70 mt-1 text-xs">
                  {itemDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de advertencia */}
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FiTrash2 className="h-5 w-5 text-error" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-error">
                Advertencia
              </h4>
              <p className="mt-1 text-sm text-error/80">
                {warningMessage || defaultWarningMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {details.length > 0 && (
          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-base-content/70" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-base-content">
                  ¿Qué se eliminará?
                </h4>
                <div className="mt-1 text-sm text-base-content/70">
                  <ul className="list-disc list-inside space-y-1">
                    {details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            variant="danger"
            loading={loading}
            disabled={loading}
            leftIcon={<FiTrash2 className="w-4 h-4" />}
          >
            {loading ? 'Eliminando...' : (confirmText || defaultConfirmText)}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
