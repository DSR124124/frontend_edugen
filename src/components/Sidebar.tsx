import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useUIStore } from '../store/ui'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FolderOpen, 
  Settings,
  GraduationCap,
  BarChart3
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cursos', href: '/courses', icon: BookOpen },
  { name: 'Secciones', href: '/sections', icon: Users },
  { name: 'Portafolio', href: '/portfolio', icon: FolderOpen },
  { name: 'Configuración', href: '/profile', icon: Settings },
]

const directorNavigation = [
  { name: 'Analíticas', href: '/analytics', icon: BarChart3 },
  { name: 'Estudiantes', href: '/students', icon: GraduationCap },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen } = useUIStore()

  const isDirector = user?.role === 'DIRECTOR'
  const allNavigation = isDirector ? [...navigation, ...directorNavigation] : navigation

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full pt-16">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {allNavigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-base-content hover:bg-base-200 hover:text-base-content'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
