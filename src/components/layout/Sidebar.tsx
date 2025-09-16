import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { useSidebar } from '../../hooks/useSidebar'
import logoImage from '../../assets/images/logos/logo.png?url'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings,
  GraduationCap,
  Calendar,
  Layers,
  UserCheck,
  Building2,
  FolderOpen,
  Bot,
  FileText,
  BarChart3,
  Home,
} from 'lucide-react'

const studentNavigation = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Mi Sección', href: '/my-section', icon: Users },
  { name: 'Mi Portafolio', href: '/student-portfolio', icon: FolderOpen },
  { name: 'Configuración', href: '/profile', icon: Settings },
]

const directorNavigation = [
  { name: 'Dashboard', href: '/director', icon: LayoutDashboard },
  { name: 'Institución', href: '/director/institution', icon: Building2 },
  { name: 'Grados', href: '/director/grades', icon: Layers },
  { name: 'Períodos', href: '/director/terms', icon: Calendar },
  { name: 'Secciones', href: '/director/sections', icon: Users },
  { name: 'Estudiantes', href: '/director/students', icon: GraduationCap },
  { name: 'Profesores', href: '/director/professors', icon: UserCheck },
  { name: 'Configuración', href: '/profile', icon: Settings },
]

const professorNavigation = [
  { name: 'Dashboard', href: '/professor', icon: LayoutDashboard },
  { name: 'Mis Cursos', href: '/professor/courses', icon: BookOpen },
  { name: 'Temas', href: '/professor/topics', icon: Layers },
  { name: 'Mis Secciones', href: '/professor/sections', icon: Users },
  { name: 'Mis Estudiantes', href: '/professor/students', icon: GraduationCap },
  { name: 'Portafolios', href: '/professor/portfolios', icon: FolderOpen },
  { name: 'Analytics', href: '/material-analytics', icon: BarChart3 },
  { name: 'IA Generador', href: '/ai-content', icon: Bot },
  { name: 'Contenidos Generados', href: '/generated-content', icon: FileText },
  { name: 'Configuración', href: '/profile', icon: Settings },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, closeSidebarOnMobile } = useSidebar()

  const getNavigation = () => {
    switch (user?.role) {
      case 'DIRECTOR':
        return directorNavigation
      case 'PROFESOR':
        return professorNavigation
      case 'ALUMNO':
        return studentNavigation
      default:
        return studentNavigation
    }
  }

  const allNavigation = getNavigation()

  return (
    <>
      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo del sistema - Parte superior */}
          <div className="flex items-center justify-center px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center p-2" style={{ backgroundColor: 'var(--color-primary-50)' }}>
                <img
                  src={logoImage}
                  alt="EDUGEN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary-content)' }}>
                  EDUGEN
                </h2>
                <p className="text-xs opacity-80" style={{ color: 'var(--color-primary-content)' }}>
                  Sistema Educativo
                </p>
              </div>
            </div>
          </div>
          
          {/* Línea divisoria debajo del logo */}
          <div className="mx-4 border-b-2 border-white opacity-60"></div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {allNavigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/professor' || item.href === '/director' || item.href === '/dashboard'}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? 'bg-white bg-opacity-20 text-white font-semibold' 
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`
                  }
                  onClick={closeSidebarOnMobile}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
