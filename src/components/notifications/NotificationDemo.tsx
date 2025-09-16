import { useNotificationHelpers } from '../../hooks/useNotificationHelpers'
import { Button } from '../ui/Button'

export function NotificationDemo() {
  const {
    showApiSuccess,
    showApiError,
    showLoadingNotification,
    showProgressNotification,
    showConfirmation,
    showPersistentInfo,
    showValidationError,
    showSaveSuccess,
    showSaveError,
    showDeleteSuccess,
    showDeleteError,
    clearAll
  } = useNotificationHelpers()

  const handleApiSuccess = () => {
    showApiSuccess('Los datos se han cargado correctamente', 'Ver detalles')
  }

  const handleApiError = () => {
    showApiError(
      { message: 'Error de conexión con el servidor' },
      () => {}
    )
  }

  const handleLoading = () => {
    showLoadingNotification('Cargando datos', 'Por favor espera mientras cargamos la información...', 'loading-demo')
  }

  const handleProgress = () => {
    showProgressNotification('Procesando archivo', 'Subiendo archivo...', 0, 'progress-demo')
    
    // Simular progreso
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (progress >= 100) {
        clearInterval(interval)
        // Aquí podrías actualizar la notificación a success
      }
    }, 200)
  }

  const handleConfirmation = () => {
    showConfirmation(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer. ¿Deseas continuar?',
      () => {},
      () => {}
    )
  }

  const handlePersistentInfo = () => {
    showPersistentInfo(
      'Nueva funcionalidad disponible',
      'Hemos agregado nuevas características a tu dashboard. ¡Explóralas!',
      [
        {
          label: 'Explorar',
          onClick: () => {},
          variant: 'primary'
        },
        {
          label: 'Más tarde',
          onClick: () => {},
          variant: 'ghost'
        }
      ]
    )
  }

  const handleValidationError = () => {
    showValidationError('Email', 'El formato del email no es válido')
  }

  const handleSaveSuccess = () => {
    showSaveSuccess('Usuario')
  }

  const handleSaveError = () => {
    showSaveError('Usuario', { message: 'El email ya está en uso' })
  }

  const handleDeleteSuccess = () => {
    showDeleteSuccess('Archivo')
  }

  const handleDeleteError = () => {
    showDeleteError('Archivo', { message: 'No tienes permisos para eliminar este archivo' })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Demo de Notificaciones</h2>
        <Button onClick={clearAll} variant="outline">
          Limpiar todas
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Button onClick={handleApiSuccess} variant="primary">
          API Success
        </Button>
        
        <Button onClick={handleApiError} variant="danger">
          API Error
        </Button>
        
        <Button onClick={handleLoading} variant="secondary">
          Loading
        </Button>
        
        <Button onClick={handleProgress} variant="secondary">
          Progress
        </Button>
        
        <Button onClick={handleConfirmation} variant="outline">
          Confirmation
        </Button>
        
        <Button onClick={handlePersistentInfo} variant="secondary">
          Persistent Info
        </Button>
        
        <Button onClick={handleValidationError} variant="danger">
          Validation Error
        </Button>
        
        <Button onClick={handleSaveSuccess} variant="primary">
          Save Success
        </Button>
        
        <Button onClick={handleSaveError} variant="danger">
          Save Error
        </Button>
        
        <Button onClick={handleDeleteSuccess} variant="primary">
          Delete Success
        </Button>
        
        <Button onClick={handleDeleteError} variant="danger">
          Delete Error
        </Button>
      </div>
    </div>
  )
}
