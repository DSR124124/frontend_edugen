import { Notification } from './Notification'
import { NotificationData } from '../../hooks/useNotifications'

interface NotificationContainerProps {
  notifications: NotificationData[]
  onRemove: (id: string) => void
  onUpdate?: (id: string, updates: Partial<NotificationData>) => void
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  
  // Agrupar notificaciones por posición
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const position = notification.group || 'default'
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(notification)
    return acc
  }, {} as Record<string, NotificationData[]>)

  return (
    <div style={{ 
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999998,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxHeight: 'calc(100vh - 40px)',
      overflow: 'visible',
      paddingRight: '8px',
      paddingLeft: '8px'
    }}>
      {Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
        <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groupNotifications.map((notification, index) => (
            <div
              key={notification.id}
              style={{
                pointerEvents: 'auto',
                transform: `translateY(${index * 8}px)`,
                transition: 'transform 0.3s ease-in-out',
                overflow: 'visible'
              }}
            >
              <Notification
                {...notification}
                onClose={onRemove}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
