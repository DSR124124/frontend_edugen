import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Loader2, Info } from 'lucide-react'
import { NotificationAction } from '../../hooks/useNotifications'

export interface NotificationProps {
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
  onClose: (id: string) => void
}

export function Notification({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  persistent = false,
  actions = [],
  progress,
  icon,
  onClose 
}: NotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)
  

  useEffect(() => {
    // Iniciar animación de entrada inmediatamente
    const enterTimer = setTimeout(() => {
      setIsAnimating(true)
    }, 50)

    // Auto-cierre
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => {
        clearTimeout(timer)
        clearTimeout(enterTimer)
      }
    }

    return () => clearTimeout(enterTimer)
  }, [id, duration, persistent])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setShouldRender(false)
      setTimeout(() => onClose(id), 100)
    }, 400)
  }

  const getIcon = () => {
    if (icon) return icon
    
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'error':
        return <XCircle className="h-5 w-5" />
      case 'warning':
        return <AlertCircle className="h-5 w-5" />
      case 'info':
        return <Info className="h-5 w-5" />
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />
      case 'progress':
        return <Loader2 className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getNotificationColors = () => {
    switch (type) {
      case 'success':
        return {
          background: '#E8F5E8',
          border: '#00BF4A',
          text: '#1B5E20'
        }
      case 'error':
        return {
          background: '#FFEBEE',
          border: '#FF3A24',
          text: '#B71C1C'
        }
      case 'warning':
        return {
          background: '#FFF8E1',
          border: '#F7A325',
          text: '#E65100'
        }
      case 'info':
        return {
          background: '#E3F2FD',
          border: '#0074EE',
          text: '#0D47A1'
        }
      case 'loading':
      case 'progress':
        return {
          background: '#005CFF',
          border: '#0048CC',
          text: '#FFFFFF'
        }
      default:
        return {
          background: '#E3F2FD',
          border: '#0074EE',
          text: '#0D47A1'
        }
    }
  }



  if (!shouldRender) return null

  const colors = getNotificationColors()
  

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
          }
          @keyframes slideIn {
            0% { 
              transform: translateX(120%) scale(0.8);
              opacity: 0;
            }
            100% { 
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            0% { 
              transform: translateX(0) scale(1);
              opacity: 1;
            }
            100% { 
              transform: translateX(120%) scale(0.8);
              opacity: 0;
            }
          }
        `}
      </style>
      <div
        style={{ 
          position: 'relative',
          backgroundColor: colors.background,
          color: colors.text,
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          minWidth: '320px',
          maxWidth: '420px',
          border: `2px solid ${colors.border}`,
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto',
          transform: isAnimating ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.8)',
          opacity: isAnimating ? 1 : 0,
          animation: isAnimating 
            ? 'slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, float 3s ease-in-out infinite 0.5s'
            : 'slideOut 0.4s ease-in forwards'
        }}
      >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          flexShrink: 0, 
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: type === 'loading' || type === 'progress' 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.1)'
        }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 4px 0', 
            fontSize: '16px', 
            fontWeight: '600',
            lineHeight: '1.4'
          }}>
            {title}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            opacity: 0.9,
            lineHeight: '1.5'
          }}>
            {message}
          </p>
          
          {/* Progress Bar for progress type */}
          {type === 'progress' && progress !== undefined && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '12px', 
                marginBottom: '4px',
                opacity: 0.8
              }}>
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '4px', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease-in-out',
                    width: `${Math.min(100, Math.max(0, progress))}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Actions */}
          {actions.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: '4px',
                    border: type === 'loading' || type === 'progress' 
                      ? '1px solid rgba(255, 255, 255, 0.3)'
                      : '1px solid rgba(0, 0, 0, 0.2)',
                    backgroundColor: type === 'loading' || type === 'progress' 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)',
                    color: colors.text,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = type === 'loading' || type === 'progress' 
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = type === 'loading' || type === 'progress' 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text,
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease-in-out',
            opacity: 0.7,
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = type === 'loading' || type === 'progress' 
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.opacity = '0.7'
          }}
        >
          ×
        </button>
      </div>
      </div>
    </>
  )
}
