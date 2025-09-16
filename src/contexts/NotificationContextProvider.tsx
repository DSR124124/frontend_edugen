import { ReactNode } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationContainer } from '../components/notifications/NotificationContainer'
import { NotificationContext } from './NotificationContext'

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    notifications,
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
  } = useNotifications()
  

  return (
    <NotificationContext.Provider value={{
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
    }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  )
}
