import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
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
  Cpu,
  Database,
  Cloud,
  Zap,
  Shield,
  Globe,
  Code,
  Wifi,
  Smartphone,
  Monitor,
  Server,
  // Iconos educativos adicionales
  BookMarked,
  Calculator,
  Microscope,
  Atom,
  Beaker,
  Brain,
  Lightbulb,
  PenTool,
  Ruler,
  Target,
  Award,
  Star,
  Trophy,
  BookCheck,
  ClipboardList,
  FileCheck,
  Library,
  School,
  // Iconos tecnológicos adicionales
  Terminal,
  GitBranch,
  HardDrive,
  Router,
  Wrench,
  Lock,
  Key,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Camera,
  Video,
  Headphones,
  Printer,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

// Interfaces para la navegación
interface SubNavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavigationItem {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: SubNavigationItem[]
}

const studentNavigation: NavigationItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Mi Sección', href: '/my-section', icon: Users },
  { name: 'Mi Portafolio', href: '/student-portfolio', icon: FolderOpen },
  { name: 'Configuración', href: '/profile', icon: Settings },
]

const directorNavigation: NavigationItem[] = [
  // Inicio
  { 
    name: 'Inicio', 
    icon: Home,
    subItems: [
      { name: 'Dashboard', href: '/director', icon: LayoutDashboard },
    ]
  },
  
  // Académico
  { 
    name: 'Académico', 
    icon: BookOpen,
    subItems: [
      { name: 'Grados', href: '/director/grades', icon: Layers },
      { name: 'Períodos', href: '/director/terms', icon: Calendar },
      { name: 'Secciones', href: '/director/sections', icon: School },
    ]
  },
  
  // Personas
  { 
    name: 'Personas', 
    icon: Users,
    subItems: [
      { name: 'Estudiantes', href: '/director/students', icon: GraduationCap },
      { name: 'Profesores', href: '/director/professors', icon: UserCheck },
    ]
  },
  
  // Administración
  { 
    name: 'Administración', 
    icon: Settings,
    subItems: [
      { name: 'Institución', href: '/director/institution', icon: Building2 },
      { name: 'Configuración', href: '/profile', icon: Wrench },
    ]
  },
]

const professorNavigation: NavigationItem[] = [
  // Inicio
  { name: 'Inicio', href: '/professor', icon: Home },
  
  // Docencia
  { 
    name: 'Docencia', 
    icon: GraduationCap,
    subItems: [
      { name: 'Mis Cursos', href: '/professor/courses', icon: BookOpen },
      { name: 'Mis Secciones', href: '/professor/sections', icon: Users },
      { name: 'Mis Estudiantes', href: '/professor/students', icon: UserCheck },
      { name: 'Portafolios', href: '/professor/portfolios', icon: FolderOpen },
      { name: 'Temas', href: '/professor/topics', icon: Layers },
    ]
  },
  
  // Contenido & IA
  { 
    name: 'Contenido & IA', 
    icon: Bot,
    subItems: [
      { name: 'IA Generador', href: '/ai-content', icon: Brain },
      { name: 'Contenidos Generados', href: '/generated-content', icon: FileText },
    ]
  },
  
  // Gestión
  { 
    name: 'Gestión', 
    icon: Settings,
    subItems: [
      { name: 'Analytics', href: '/material-analytics', icon: BarChart3 },
      { name: 'Configuración', href: '/profile', icon: Wrench },
    ]
  },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, closeSidebarOnMobile, isMobile } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Configurar expansión por defecto según el rol del usuario
    if (user?.role === 'DIRECTOR') {
      return ['Inicio', 'Académico'] // Para directores, expandir Inicio y Académico por defecto
    } else if (user?.role === 'PROFESOR') {
      return ['Docencia'] // Para profesores, expandir Docencia por defecto
    }
    return [] // Para estudiantes u otros roles, no expandir nada por defecto
  })

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

  // Función para alternar la expansión de un item
  const toggleItemExpansion = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  // Verificar si un item está expandido
  const isItemExpanded = (itemName: string) => {
    return expandedItems.includes(itemName)
  }

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        sidebarOpen &&
        isMobile
      ) {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen && isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen, isMobile, setSidebarOpen])

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
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
        }}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Elementos flotantes educativos y tecnológicos distribuidos por todo el sidebar */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Elementos distribuidos uniformemente usando posicionamiento porcentual */}
            
            {/* Fila 1 - Top 5% */}
            <div className="absolute left-2 animate-pulse" style={{ top: '5%', animationDelay: '0.2s' }}>
              <BookMarked className="w-3 h-3 text-white/20" />
            </div>
            <div className="absolute right-3 animate-bounce" style={{ top: '5%', animationDelay: '0.4s' }}>
              <Calculator className="w-4 h-4 text-white/15" />
            </div>
            <div className="absolute left-8 animate-pulse" style={{ top: '5%', animationDelay: '0.6s' }}>
              <Microscope className="w-3 h-3 text-white/25" />
            </div>
            <div className="absolute right-8 animate-bounce" style={{ top: '5%', animationDelay: '0.8s' }}>
              <Atom className="w-4 h-4 text-white/10" />
            </div>
            
            {/* Fila 2 - Top 15% */}
            <div className="absolute left-3 animate-pulse" style={{ top: '15%', animationDelay: '1s' }}>
              <Cpu className="w-4 h-4 text-white/20" />
            </div>
            <div className="absolute right-4 animate-bounce" style={{ top: '15%', animationDelay: '1.2s' }}>
              <Database className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute left-10 animate-pulse" style={{ top: '15%', animationDelay: '1.4s' }}>
              <Cloud className="w-5 h-5 text-white/10" />
            </div>
            <div className="absolute right-10 animate-bounce" style={{ top: '15%', animationDelay: '1.6s' }}>
              <Terminal className="w-3 h-3 text-white/25" />
            </div>
            
            {/* Fila 3 - Top 25% */}
            <div className="absolute left-2 animate-pulse" style={{ top: '25%', animationDelay: '1.8s' }}>
              <Lightbulb className="w-4 h-4 text-white/20" />
            </div>
            <div className="absolute right-3 animate-bounce" style={{ top: '25%', animationDelay: '2s' }}>
              <PenTool className="w-3 h-3 text-white/25" />
            </div>
            <div className="absolute left-8 animate-pulse" style={{ top: '25%', animationDelay: '2.2s' }}>
              <Ruler className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute right-8 animate-bounce" style={{ top: '25%', animationDelay: '2.4s' }}>
              <Target className="w-4 h-4 text-white/20" />
            </div>
            
            {/* Fila 4 - Top 35% */}
            <div className="absolute left-3 animate-pulse" style={{ top: '35%', animationDelay: '2.6s' }}>
              <Router className="w-4 h-4 text-white/20" />
            </div>
            <div className="absolute right-4 animate-bounce" style={{ top: '35%', animationDelay: '2.8s' }}>
              <Wrench className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute left-10 animate-pulse" style={{ top: '35%', animationDelay: '3s' }}>
              <Lock className="w-3 h-3 text-white/25" />
            </div>
            <div className="absolute right-10 animate-bounce" style={{ top: '35%', animationDelay: '3.2s' }}>
              <Key className="w-3 h-3 text-white/20" />
            </div>
            
            {/* Fila 5 - Top 45% */}
            <div className="absolute left-2 animate-pulse" style={{ top: '45%', animationDelay: '3.4s' }}>
              <Trophy className="w-4 h-4 text-white/20" />
            </div>
            <div className="absolute right-3 animate-bounce" style={{ top: '45%', animationDelay: '3.6s' }}>
              <BookCheck className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute left-8 animate-pulse" style={{ top: '45%', animationDelay: '3.8s' }}>
              <ClipboardList className="w-3 h-3 text-white/25" />
            </div>
            <div className="absolute right-8 animate-bounce" style={{ top: '45%', animationDelay: '4s' }}>
              <PenTool className="w-3 h-3 text-white/20" />
            </div>
            
            {/* Fila 6 - Top 55% */}
            <div className="absolute left-3 animate-pulse" style={{ top: '55%', animationDelay: '4.2s' }}>
              <Zap className="w-3 h-3 text-white/20" />
            </div>
            <div className="absolute right-4 animate-bounce" style={{ top: '55%', animationDelay: '4.4s' }}>
              <Shield className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute left-10 animate-pulse" style={{ top: '55%', animationDelay: '4.6s' }}>
              <Globe className="w-4 h-4 text-white/10" />
            </div>
            <div className="absolute right-10 animate-bounce" style={{ top: '55%', animationDelay: '4.8s' }}>
              <Code className="w-3 h-3 text-white/25" />
            </div>
            
            {/* Fila 7 - Top 65% */}
            <div className="absolute left-2 animate-pulse" style={{ top: '65%', animationDelay: '5s' }}>
              <Wifi className="w-3 h-3 text-white/20" />
            </div>
            <div className="absolute right-3 animate-bounce" style={{ top: '65%', animationDelay: '5.2s' }}>
              <Smartphone className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute left-8 animate-pulse" style={{ top: '65%', animationDelay: '5.4s' }}>
              <Monitor className="w-4 h-4 text-white/20" />
            </div>
            <div className="absolute right-8 animate-bounce" style={{ top: '65%', animationDelay: '5.6s' }}>
              <Server className="w-3 h-3 text-white/15" />
            </div>
            
            {/* Fila 8 - Top 75% */}
            <div className="absolute left-3 animate-pulse" style={{ top: '75%', animationDelay: '5.8s' }}>
              <School className="w-4 h-4 text-white/25" />
            </div>
            <div className="absolute right-4 animate-bounce" style={{ top: '75%', animationDelay: '6s' }}>
              <Filter className="w-3 h-3 text-white/20" />
            </div>
            <div className="absolute left-10 animate-pulse" style={{ top: '75%', animationDelay: '6.2s' }}>
              <Camera className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute right-10 animate-bounce" style={{ top: '75%', animationDelay: '6.4s' }}>
              <Video className="w-3 h-3 text-white/20" />
            </div>
            
            {/* Fila 9 - Top 85% */}
            <div className="absolute left-2 animate-pulse" style={{ top: '85%', animationDelay: '6.6s' }}>
              <Headphones className="w-3 h-3 text-white/25" />
            </div>
            <div className="absolute right-3 animate-bounce" style={{ top: '85%', animationDelay: '6.8s' }}>
              <Printer className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute left-8 animate-pulse" style={{ top: '85%', animationDelay: '7s' }}>
              <FileText className="w-3 h-3 text-white/20" />
            </div>
            <div className="absolute right-8 animate-bounce" style={{ top: '85%', animationDelay: '7.2s' }}>
              <Download className="w-3 h-3 text-white/15" />
            </div>
            
            {/* Fila 10 - Top 95% */}
            <div className="absolute left-3 animate-pulse" style={{ top: '95%', animationDelay: '7.4s' }}>
              <Upload className="w-3 h-3 text-white/25" />
            </div>
            <div className="absolute right-4 animate-bounce" style={{ top: '95%', animationDelay: '7.6s' }}>
              <Share2 className="w-3 h-3 text-white/20" />
            </div>
            <div className="absolute left-10 animate-pulse" style={{ top: '95%', animationDelay: '7.8s' }}>
              <BookOpen className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute right-10 animate-bounce" style={{ top: '95%', animationDelay: '8s' }}>
              <GraduationCap className="w-3 h-3 text-white/20" />
            </div>
            
            {/* Elementos adicionales distribuidos aleatoriamente */}
            <div className="absolute left-12 animate-pulse" style={{ top: '10%', animationDelay: '8.2s' }}>
              <Beaker className="w-3 h-3 text-white/20" />
            </div>
            <div className="absolute right-12 animate-bounce" style={{ top: '20%', animationDelay: '8.4s' }}>
              <Brain className="w-4 h-4 text-white/15" />
            </div>
            <div className="absolute left-14 animate-pulse" style={{ top: '30%', animationDelay: '8.6s' }}>
              <GitBranch className="w-3 h-3 text-white/20" />
            </div>
            <div className="absolute right-14 animate-bounce" style={{ top: '40%', animationDelay: '8.8s' }}>
              <HardDrive className="w-4 h-4 text-white/15" />
            </div>
            <div className="absolute left-12 animate-pulse" style={{ top: '50%', animationDelay: '9s' }}>
              <Award className="w-3 h-3 text-white/25" />
            </div>
            <div className="absolute right-12 animate-bounce" style={{ top: '60%', animationDelay: '9.2s' }}>
              <Star className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute left-14 animate-pulse" style={{ top: '70%', animationDelay: '9.4s' }}>
              <Eye className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute right-14 animate-bounce" style={{ top: '80%', animationDelay: '9.6s' }}>
              <Search className="w-3 h-3 text-white/25" />
            </div>
            <div className="absolute left-12 animate-pulse" style={{ top: '90%', animationDelay: '9.8s' }}>
              <FileCheck className="w-3 h-3 text-white/15" />
            </div>
            <div className="absolute right-12 animate-bounce" style={{ top: '100%', animationDelay: '10s' }}>
              <Library className="w-4 h-4 text-white/25" />
            </div>
          </div>

          {/* Logo del sistema - Parte superior */}
          <div className="flex items-center justify-center px-4 py-4 relative z-10">
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
          
          <nav className="flex-1 px-4 py-6 space-y-1 relative z-10">
            {allNavigation.map((item) => {
              const Icon = item.icon
              const hasSubItems = item.subItems && item.subItems.length > 0
              const isExpanded = isItemExpanded(item.name)

              return (
                <div key={item.name}>
                  {/* Item principal */}
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleItemExpansion(item.name)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors text-white hover:bg-white hover:bg-opacity-10"
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      <div className="transition-transform duration-200">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                  ) : (
                    <NavLink
                      to={item.href || '#'}
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
                  )}

                  {/* Sub-items expandibles */}
                  {hasSubItems && (
                    <div className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon
                        return (
                          <NavLink
                            key={subItem.name}
                            to={subItem.href}
                            className={({ isActive }) => 
                              `flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                isActive 
                                  ? 'bg-white bg-opacity-25 text-white font-semibold' 
                                  : 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-15 hover:text-opacity-100'
                              }`
                            }
                            onClick={closeSidebarOnMobile}
                          >
                            <SubIcon className="mr-2 h-4 w-4" />
                            {subItem.name}
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
