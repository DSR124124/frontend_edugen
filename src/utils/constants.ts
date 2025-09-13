// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://d40ecad5f3db.ngrok-free.app/api/v1/',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const

// App Configuration
export const APP_CONFIG = {
  NAME: 'EDUGEN',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de Gestión Educativa',
} as const

// User Roles
export const USER_ROLES = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  DIRECTOR: 'DIRECTOR',
  PROFESOR: 'PROFESOR',
  ALUMNO: 'ALUMNO',
} as const

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DIRECTOR: '/director',
  STUDENTS: '/students',
  PROFESSORS: '/professors',
  SECTIONS: '/sections',
  COURSES: '/courses',
  PORTFOLIO: '/portfolio',
  PROFILE: '/profile',
  LOGOUT: '/logout',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const

// Form Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const
