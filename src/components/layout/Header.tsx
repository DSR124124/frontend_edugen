import { useAuthStore } from '../../store/auth'
import { useUIStore } from '../../store/ui'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { User, LogOut, Menu, X } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from '../ui/Breadcrumb'
import { TourMenu } from '../ui/TourMenu'
import { useLocation, useNavigate } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { showSuccess } = useNotificationContext()
  const location = useLocation()
  const navigate = useNavigate()

  // Generar breadcrumb basado en la estructura del sidebar por rol
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const path = location.pathname
    const role = user?.role

    const build = (items: { label: string; href?: string }[]): BreadcrumbItem[] =>
      items.map((it, idx) => idx === items.length - 1
        ? { label: it.label, current: true }
        : { label: it.label, href: it.href })

    // DIRECTOR
    if (role === 'DIRECTOR') {
      if (path === '/director') return build([
        { label: 'Inicio', href: '/director' },
        { label: 'Dashboard' },
      ])
      if (path === '/director/grades') return build([
        { label: 'Inicio', href: '/director' },
        { label: 'Académico' },
        { label: 'Grados' },
      ])
      if (path === '/director/terms') return build([
        { label: 'Inicio', href: '/director' },
        { label: 'Académico' },
        { label: 'Períodos' },
      ])
      if (path === '/director/sections') return build([
        { label: 'Inicio', href: '/director' },
        { label: 'Académico' },
        { label: 'Secciones' },
      ])
      if (path === '/director/students') return build([
        { label: 'Inicio', href: '/director' },
        { label: 'Personas' },
        { label: 'Estudiantes' },
      ])
      if (path === '/director/professors') return build([
        { label: 'Inicio', href: '/director' },
        { label: 'Personas' },
        { label: 'Profesores' },
      ])
      if (path === '/director/institution') return build([
        { label: 'Inicio', href: '/director' },
        { label: 'Administración' },
        { label: 'Institución' },
      ])
      if (path === '/profile') return build([
        { label: 'Inicio', href: '/director' },
        { label: 'Administración' },
        { label: 'Configuración' },
      ])
    }

    // PROFESOR
    if (role === 'PROFESOR') {
      if (path === '/professor') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Panel del Profesor' },
      ])
      if (path === '/professor/courses') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Docencia' },
        { label: 'Mis Cursos' },
      ])
      if (path === '/professor/sections') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Docencia' },
        { label: 'Mis Secciones' },
      ])
      if (path === '/professor/students') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Docencia' },
        { label: 'Mis Estudiantes' },
      ])
      if (path === '/professor/portfolios') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Docencia' },
        { label: 'Portafolios' },
      ])
      if (path === '/professor/topics') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Docencia' },
        { label: 'Temas' },
      ])
      if (path === '/ai-content') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Contenido & IA' },
        { label: 'IA Generador' },
      ])
      if (path === '/generated-content') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Contenido & IA' },
        { label: 'Contenido Generado' },
      ])
      if (path === '/material-analytics') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Gestión' },
        { label: 'Analytics' },
      ])
      if (path === '/profile') return build([
        { label: 'Inicio', href: '/professor' },
        { label: 'Gestión' },
        { label: 'Configuración' },
      ])
    }

    // ALUMNO / por defecto
    if (path === '/dashboard') return build([
      { label: 'Inicio' },
    ])
    if (path === '/my-section') return build([
      { label: 'Inicio', href: '/dashboard' },
      { label: 'Mi Sección' },
    ])
    if (path === '/student-portfolio') return build([
      { label: 'Inicio', href: '/dashboard' },
      { label: 'Mi Portafolio' },
    ])
    if (path === '/my-materials') return build([
      { label: 'Inicio', href: '/dashboard' },
      { label: 'Mis Materiales' },
    ])
    if (path === '/profile') return build([
      { label: 'Inicio', href: '/dashboard' },
      { label: 'Configuración' },
    ])

    return []
  }

  const breadcrumbItems = getBreadcrumbItems()

  const handleLogout = () => {
    // Mostrar notificación de cierre de sesión exitoso
    showSuccess(
      "¡Sesión Cerrada Exitosamente!",
      `Hasta luego, ${user?.first_name || 'Usuario'}. Tu sesión ha sido cerrada correctamente.`,
      { duration: 3000 }
    )
    
    // Esperar un momento para que se vea la notificación antes de cerrar sesión
    setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
    }, 500) // 0.5 segundos de delay
  }

  // Obtener el título de la página actual para móviles
  const getCurrentPageTitle = () => {
    const currentItem = breadcrumbItems.find(item => item.current)
    return currentItem?.label || 'Dashboard'
  }

  return (
    <header className="bg-white shadow-sm border-b relative z-40" style={{ borderColor: 'var(--color-base-300)' }}>
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          {/* Botón único para mostrar/ocultar sidebar */}
          <button
            onClick={toggleSidebar}
            data-tour="sidebar-toggle"
            className="p-2 rounded-md transition-colors hover:bg-gray-200 active:bg-gray-300 relative group flex-shrink-0"
            title={sidebarOpen ? "Cerrar barra de navegación" : "Abrir barra de navegación"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            
            {/* Tooltip personalizado - Solo en desktop */}
            <div className="hidden sm:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {sidebarOpen ? "Cerrar barra de navegación" : "Abrir barra de navegación"}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          </button>
          
          {/* Título de página actual para móviles */}
          <div className="sm:hidden flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate" style={{ color: 'var(--color-base-content)' }}>
              {getCurrentPageTitle()}
            </h1>
          </div>
          
          {/* Breadcrumb - Hidden on mobile for better space usage */}
          {breadcrumbItems.length > 0 && (
            <div className="hidden sm:block flex-1 min-w-0">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 sm:space-x-4">
          {/* Menú de Tours */}
          <TourMenu />

          <div className="flex items-center space-x-2 sm:space-x-3" data-tour="user-profile">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-100)' }}>
              <User className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="text-sm hidden sm:block">
              <p className="font-semibold" style={{ color: 'var(--color-base-content)' }}>{user?.first_name} {user?.last_name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--color-base-content)' }}>{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            data-tour="logout-button"
            className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95"
            style={{
              color: 'var(--color-base-content)',
              backgroundColor: 'var(--color-base-100)',
              border: `1px solid var(--color-base-300)`,
              minWidth: '44px', // Tamaño mínimo táctil
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-base-200)'
              e.currentTarget.style.borderColor = 'var(--color-primary-300)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-base-100)'
              e.currentTarget.style.borderColor = 'var(--color-base-300)'
            }}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
