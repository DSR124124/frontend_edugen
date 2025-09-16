import { NotificationAction } from '../hooks/useNotifications'

export interface NotificationContextType {
  // Métodos básicos mejorados
  showSuccess: (title: string, message: string, options?: {
    duration?: number
    persistent?: boolean
    actions?: NotificationAction[]
    group?: string
  }) => void
  showError: (title: string, message: string, options?: {
    duration?: number
    persistent?: boolean
    actions?: NotificationAction[]
    group?: string
  }) => void
  showWarning: (title: string, message: string, options?: {
    duration?: number
    persistent?: boolean
    actions?: NotificationAction[]
    group?: string
  }) => void
  showInfo: (title: string, message: string, options?: {
    duration?: number
    persistent?: boolean
    actions?: NotificationAction[]
    group?: string
  }) => void
  
  // Nuevos métodos
  showLoading: (title: string, message: string, options?: {
    group?: string
    persistent?: boolean
  }) => void
  showProgress: (title: string, message: string, progress: number, options?: {
    group?: string
    persistent?: boolean
    actions?: NotificationAction[]
  }) => void
  showCustom: (notification: Omit<import('../hooks/useNotifications').NotificationData, 'id'>) => void
  
  // Métodos de gestión
  updateNotification: (id: string, updates: Partial<import('../hooks/useNotifications').NotificationData>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
  clearGroup: (group: string) => void
}
