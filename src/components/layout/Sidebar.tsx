import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { useUIStore } from '../../store/ui'
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
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cursos', href: '/courses', icon: BookOpen },
  { name: 'Secciones', href: '/sections', icon: Users },
  { name: 'Portafolio', href: '/portfolio', icon: FolderOpen },
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
  { name: 'IA Generador', href: '/ai-content', icon: Bot },
  { name: 'Contenidos Generados', href: '/generated-content', icon: FileText },
  { name: 'Configuración', href: '/profile', icon: Settings },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen } = useUIStore()

  const getNavigation = () => {
    switch (user?.role) {
      case 'DIRECTOR':
        return directorNavigation
      case 'PROFESOR':
        return professorNavigation
      default:
        return navigation
    }
  }

  const allNavigation = getNavigation()

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
                end={item.href === '/professor' || item.href === '/director' || item.href === '/dashboard'}
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
