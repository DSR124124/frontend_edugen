import { VALIDATION } from './constants'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'Este campo es obligatorio'
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return null
  }

  // Min length validation
  if (rules.minLength && value.toString().length < rules.minLength) {
    return `Debe tener al menos ${rules.minLength} caracteres`
  }

  // Max length validation
  if (rules.maxLength && value.toString().length > rules.maxLength) {
    return `No puede tener más de ${rules.maxLength} caracteres`
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value.toString())) {
    return 'Formato inválido'
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value)
  }

  return null
}

export const validateForm = (data: Record<string, any>, rules: ValidationRules): ValidationResult => {
  const errors: Record<string, string> = {}

  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field]
    const value = data[field]
    const error = validateField(value, fieldRules)
    
    if (error) {
      errors[field] = error
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: VALIDATION.EMAIL_REGEX,
  },
  password: {
    required: true,
    minLength: VALIDATION.PASSWORD_MIN_LENGTH,
    custom: (value: string) => {
      const validation = validatePassword(value)
      return validation.isValid ? null : validation.errors[0]
    },
  },
  username: {
    required: true,
    minLength: VALIDATION.USERNAME_MIN_LENGTH,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  },
  phone: {
    pattern: /^[+]?[\d\s\-\(\)]+$/,
  },
}

// Password validation helper
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
