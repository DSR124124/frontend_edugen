import { useCallback } from 'react'
import { useNotificationContext } from './useNotificationContext'
import { NotificationAction } from './useNotifications'

export function useNotificationHelpers() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showProgress,
    showCustom,
    updateNotification,
    removeNotification,
    clearAll,
    clearGroup
  } = useNotificationContext()

  // Helper para notificaciones de API
  const showApiSuccess = useCallback((message: string, action?: string) => {
    showSuccess('Éxito', message, {
      actions: action ? [{
        label: action,
        onClick: () => {},
        variant: 'primary' as const
      }] : undefined
    })
  }, [showSuccess])

  const showApiError = useCallback((error: any, retryAction?: () => void) => {
    const errorMessage = error?.response?.data?.message || error?.message || 'Ha ocurrido un error inesperado'
    const actions: NotificationAction[] = []
    
    if (retryAction) {
      actions.push({
        label: 'Reintentar',
        onClick: retryAction,
        variant: 'primary'
      })
    }
    
    actions.push({
      label: 'Cerrar',
      onClick: () => {},
      variant: 'ghost'
    })

    showError('Error', errorMessage, {
      persistent: true,
      actions
    })
  }, [showError])

  // Helper para notificaciones de carga
  const showLoadingNotification = useCallback((title: string, message: string, group?: string) => {
    showLoading(title, message, { group })
  }, [showLoading])

  const updateLoadingToSuccess = useCallback((notificationId: string, title: string, message: string) => {
    updateNotification(notificationId, {
      type: 'success',
      title,
      message,
      duration: 3000,
      persistent: false
    })
  }, [updateNotification])

  const updateLoadingToError = useCallback((notificationId: string, title: string, message: string) => {
    updateNotification(notificationId, {
      type: 'error',
      title,
      message,
      duration: 5000,
      persistent: false
    })
  }, [updateNotification])

  // Helper para notificaciones de progreso
  const showProgressNotification = useCallback((
    title: string, 
    message: string, 
    initialProgress: number = 0,
    group?: string
  ) => {
    return showProgress(title, message, initialProgress, { group })
  }, [showProgress])

  const updateProgress = useCallback((notificationId: string, progress: number, message?: string) => {
    updateNotification(notificationId, {
      progress,
      message: message || `Progreso: ${Math.round(progress)}%`
    })
  }, [updateNotification])

  // Helper para notificaciones de confirmación
  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showCustom({
      type: 'warning',
      title,
      message,
      persistent: true,
      actions: [
        {
          label: 'Confirmar',
          onClick: onConfirm,
          variant: 'primary'
        },
        {
          label: 'Cancelar',
          onClick: onCancel || (() => {}),
          variant: 'ghost'
        }
      ]
    })
  }, [showCustom])

  // Helper para notificaciones de información persistente
  const showPersistentInfo = useCallback((
    title: string,
    message: string,
    actions?: NotificationAction[]
  ) => {
    showInfo(title, message, {
      persistent: true,
      actions
    })
  }, [showInfo])

  // Helper para notificaciones de validación
  const showValidationError = useCallback((field: string, message: string) => {
    showError(`Error de validación: ${field}`, message, {
      duration: 4000
    })
  }, [showError])

  // Helper para notificaciones de guardado
  const showSaveSuccess = useCallback((entity: string) => {
    showSuccess('Guardado exitoso', `${entity} se ha guardado correctamente`, {
      duration: 3000
    })
  }, [showSuccess])

  const showSaveError = useCallback((entity: string, error?: any) => {
    const errorMessage = error?.message || `No se pudo guardar ${entity}`
    showError('Error al guardar', errorMessage, {
      duration: 5000
    })
  }, [showError])

  // Helper para notificaciones de eliminación
  const showDeleteSuccess = useCallback((entity: string) => {
    showSuccess('Eliminado exitoso', `${entity} se ha eliminado correctamente`, {
      duration: 3000
    })
  }, [showSuccess])

  const showDeleteError = useCallback((entity: string, error?: any) => {
    const errorMessage = error?.message || `No se pudo eliminar ${entity}`
    showError('Error al eliminar', errorMessage, {
      duration: 5000
    })
  }, [showError])

  return {
    // Métodos básicos
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showProgress,
    showCustom,
    updateNotification,
    removeNotification,
    clearAll,
    clearGroup,
    
    // Helpers específicos
    showApiSuccess,
    showApiError,
    showLoadingNotification,
    updateLoadingToSuccess,
    updateLoadingToError,
    showProgressNotification,
    updateProgress,
    showConfirmation,
    showPersistentInfo,
    showValidationError,
    showSaveSuccess,
    showSaveError,
    showDeleteSuccess,
    showDeleteError,
  }
}
