import { VALIDATION } from './constants'

/**
 * Format a date string to a readable format
 */
export const formatDate = (date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) return 'Fecha no disponible'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida'
  }
  
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format a date and time string
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get initials from a name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email)
}

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`)
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula')
  }
  
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Get user role display name
 */
export const getUserRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    ADMINISTRATOR: 'Administrador',
    DIRECTOR: 'Director',
    PROFESOR: 'Profesor',
    ALUMNO: 'Estudiante',
  }
  return roleMap[role] || role
}

/**
 * Get user role color
 */
export const getUserRoleColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    ADMINISTRATOR: 'bg-purple-100 text-purple-800',
    DIRECTOR: 'bg-blue-100 text-blue-800',
    PROFESOR: 'bg-green-100 text-green-800',
    ALUMNO: 'bg-orange-100 text-orange-800',
  }
  return colorMap[role] || 'bg-gray-100 text-gray-800'
}
