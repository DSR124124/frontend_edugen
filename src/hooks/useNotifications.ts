import { useState, useCallback, useRef } from 'react'

export interface NotificationAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
  group?: string
  progress?: number
  icon?: React.ReactNode
  timestamp?: Date
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const notificationIdRef = useRef(0)

  const generateId = useCallback(() => {
    return `notification-${++notificationIdRef.current}-${Date.now()}`
  }, [])

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = generateId()
    const newNotification = { 
      ...notification, 
      id,
      timestamp: new Date(),
      duration: notification.duration ?? (notification.persistent ? 0 : 5000)
    }
    
    setNotifications(prev => {
      // Si hay un grupo, reemplazar notificaciones del mismo grupo
      if (notification.group) {
        const filtered = prev.filter(n => n.group !== notification.group)
        return [...filtered, newNotification]
      }
      return [...prev, newNotification]
    })
  }, [generateId])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const updateNotification = useCallback((id: string, updates: Partial<NotificationData>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, ...updates } : notification
      )
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const clearGroup = useCallback((group: string) => {
    setNotifications(prev => prev.filter(notification => notification.group !== group))
  }, [])

  // Métodos básicos mejorados
  const showSuccess = useCallback((title: string, message: string, options?: {
    duration?: number
    persistent?: boolean
    actions?: NotificationAction[]
    group?: string
  }) => {
    addNotification({ 
      type: 'success', 
      title, 
      message, 
      duration: options?.duration,
      persistent: options?.persistent,
      actions: options?.actions,
      group: options?.group
    })
  }, [addNotification])

  const showError = useCallback((title: string, message: string, options?: {
    duration?: number
    persistent?: boolean
    actions?: NotificationAction[]
    group?: string
  }) => {
    addNotification({ 
      type: 'error', 
      title, 
      message, 
      duration: options?.duration,
      persistent: options?.persistent,
      actions: options?.actions,
      group: options?.group
    })
  }, [addNotification])

  const showWarning = useCallback((title: string, message: string, options?: {
    duration?: number
    persistent?: boolean
    actions?: NotificationAction[]
    group?: string
  }) => {
    addNotification({ 
      type: 'warning', 
      title, 
      message, 
      duration: options?.duration,
      persistent: options?.persistent,
      actions: options?.actions,
      group: options?.group
    })
  }, [addNotification])

  const showInfo = useCallback((title: string, message: string, options?: {
    duration?: number
    persistent?: boolean
    actions?: NotificationAction[]
    group?: string
  }) => {
    addNotification({ 
      type: 'info', 
      title, 
      message, 
      duration: options?.duration,
      persistent: options?.persistent,
      actions: options?.actions,
      group: options?.group
    })
  }, [addNotification])

  // Nuevos métodos
  const showLoading = useCallback((title: string, message: string, options?: {
    group?: string
    persistent?: boolean
  }) => {
    addNotification({ 
      type: 'loading', 
      title, 
      message, 
      duration: 0,
      persistent: options?.persistent ?? true,
      group: options?.group
    })
  }, [addNotification])

  const showProgress = useCallback((title: string, message: string, progress: number, options?: {
    group?: string
    persistent?: boolean
    actions?: NotificationAction[]
  }) => {
    addNotification({ 
      type: 'progress', 
      title, 
      message, 
      progress,
      duration: 0,
      persistent: options?.persistent ?? true,
      group: options?.group,
      actions: options?.actions
    })
  }, [addNotification])

  const showCustom = useCallback((notification: Omit<NotificationData, 'id'>) => {
    addNotification(notification)
  }, [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,
    clearGroup,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showProgress,
    showCustom,
  }
}
