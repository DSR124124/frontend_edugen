import { useAuthStore } from '../../store/auth'
import { useUIStore } from '../../store/ui'
import { User, LogOut, Menu } from 'lucide-react'
import logoImage from '../../assets/images/logos/logo.png?url'

export function Header() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <header className="bg-white shadow-sm border-b" style={{ borderColor: 'var(--color-base-300)' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md transition-colors"
            style={{ 
              color: 'var(--color-base-content)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-base-200)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center p-1" style={{ backgroundColor: 'var(--color-primary-50)' }}>
              <img
                src={logoImage}
                alt="EduGen Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="headline-xl" style={{ color: 'var(--color-primary)' }}>EDUGEN</h1>
          </div>
          
          {/* Botón para ocultar sidebar cuando está abierto */}
          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="ml-6 px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                color: 'var(--color-base-content)',
                backgroundColor: 'var(--color-base-200)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-base-300)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-base-200)'}
              title="Ocultar navegación"
            >
              Ocultar Nav
            </button>
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
            onClick={logout}
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
