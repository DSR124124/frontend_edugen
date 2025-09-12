import { USER_ROLES } from '../utils/constants'

export interface RouteConfig {
  path: string
  component: string
  title: string
  description?: string
  roles: string[]
  icon?: string
  children?: RouteConfig[]
  hidden?: boolean
}

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/login',
    component: 'Login',
    title: 'Iniciar Sesión',
    roles: [],
    hidden: true,
  },
  {
    path: '/logout',
    component: 'Logout',
    title: 'Cerrar Sesión',
    roles: [],
    hidden: true,
  },

  // Dashboard routes
  {
    path: '/dashboard',
    component: 'DashboardRouter',
    title: 'Dashboard',
    roles: [USER_ROLES.DIRECTOR, USER_ROLES.PROFESOR, USER_ROLES.ALUMNO],
    icon: 'LayoutDashboard',
  },

  // Director routes
  {
    path: '/director',
    component: 'DirectorDashboard',
    title: 'Panel Director',
    description: 'Gestión administrativa de la institución',
    roles: [USER_ROLES.DIRECTOR],
    icon: 'BarChart3',
  },
  {
    path: '/students',
    component: 'StudentsPage',
    title: 'Estudiantes',
    description: 'Gestión de estudiantes',
    roles: [USER_ROLES.DIRECTOR],
    icon: 'GraduationCap',
  },
  {
    path: '/professors',
    component: 'ProfessorsPage',
    title: 'Profesores',
    description: 'Gestión de profesores',
    roles: [USER_ROLES.DIRECTOR],
    icon: 'Users',
  },

  // Academic routes
  {
    path: '/sections',
    component: 'Sections',
    title: 'Secciones',
    description: 'Gestión de secciones académicas',
    roles: [USER_ROLES.DIRECTOR, USER_ROLES.PROFESOR],
    icon: 'Users',
  },
  {
    path: '/courses',
    component: 'Courses',
    title: 'Cursos',
    description: 'Gestión de cursos',
    roles: [USER_ROLES.PROFESOR, USER_ROLES.ALUMNO],
    icon: 'BookOpen',
  },

  // Portfolio routes
  {
    path: '/portfolio',
    component: 'MyPortfolio',
    title: 'Portafolio',
    description: 'Mi portafolio académico',
    roles: [USER_ROLES.ALUMNO],
    icon: 'FolderOpen',
  },

  // Settings routes
  {
    path: '/profile',
    component: 'Profile',
    title: 'Configuración',
    description: 'Configuración de perfil',
    roles: [USER_ROLES.DIRECTOR, USER_ROLES.PROFESOR, USER_ROLES.ALUMNO],
    icon: 'Settings',
  },
]

export const getRoutesForRole = (role: string): RouteConfig[] => {
  return routes.filter(route => 
    route.roles.length === 0 || route.roles.includes(role)
  ).filter(route => !route.hidden)
}

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path)
}

export const isRouteAccessible = (path: string, role: string): boolean => {
  const route = getRouteByPath(path)
  if (!route) return false
  
  return route.roles.length === 0 || route.roles.includes(role)
}
