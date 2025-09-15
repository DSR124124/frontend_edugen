import { useAuthStore } from '../../store/auth'
import { useUIStore } from '../../store/ui'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { User, LogOut, Menu, X } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from '../ui/Breadcrumb'
import { useLocation } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { showSuccess } = useNotificationContext()
  const location = useLocation()

  // Generar breadcrumb basado en la ruta actual
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const path = location.pathname
    
    if (path === '/director') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Panel del Director', current: true }
      ]
    } else if (path === '/director/grades') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Panel del Director', href: '/director' },
        { label: 'Grados', current: true }
      ]
    } else if (path === '/director/terms') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Panel del Director', href: '/director' },
        { label: 'Períodos', current: true }
      ]
    } else if (path === '/director/sections') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Panel del Director', href: '/director' },
        { label: 'Secciones', current: true }
      ]
    } else if (path === '/director/students') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Panel del Director', href: '/director' },
        { label: 'Estudiantes', current: true }
      ]
    } else if (path === '/director/professors') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Panel del Director', href: '/director' },
        { label: 'Profesores', current: true }
      ]
    } else if (path === '/director/institution') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Panel del Director', href: '/director' },
        { label: 'Institución', current: true }
      ]
    } else if (path === '/profile') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Perfil', current: true }
      ]
    } else if (path === '/dashboard') {
      return [
        { label: 'Dashboard', current: true }
      ]
    }
    
    return []
  }

  const breadcrumbItems = getBreadcrumbItems()

  const handleLogout = () => {
    // Mostrar notificación de cierre de sesión exitoso
    showSuccess(
      "¡Sesión Cerrada Exitosamente!",
      `Hasta luego, ${user?.first_name || 'Usuario'}. Tu sesión ha sido cerrada correctamente.`,
      3000
    )
    
    // Esperar un momento para que se vea la notificación antes de cerrar sesión
    setTimeout(() => {
      logout()
    }, 500) // 0.5 segundos de delay
  }

  return (
    <header className="bg-white shadow-sm border-b relative z-40" style={{ borderColor: 'var(--color-base-300)' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Botón único para mostrar/ocultar sidebar */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md transition-colors hover:bg-gray-200 relative group"
            title={sidebarOpen ? "Cerrar barra de navegación" : "Abrir barra de navegación"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            
            {/* Tooltip personalizado */}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {sidebarOpen ? "Cerrar barra de navegación" : "Abrir barra de navegación"}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          </button>
          
          {/* Breadcrumb */}
          {breadcrumbItems.length > 0 && (
            <Breadcrumb items={breadcrumbItems} />
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-100)' }}>
              <User className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="text-sm">
              <p className="font-semibold" style={{ color: 'var(--color-base-content)' }}>{user?.first_name} {user?.last_name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--color-base-content)' }}>{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none"
            style={{
              color: 'var(--color-base-content)',
              backgroundColor: 'var(--color-base-100)',
              border: `1px solid var(--color-base-300)`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-base-200)'
              e.currentTarget.style.borderColor = 'var(--color-primary-300)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-base-100)'
              e.currentTarget.style.borderColor = 'var(--color-base-300)'
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
