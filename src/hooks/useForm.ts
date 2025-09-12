import { useState, useCallback } from 'react'
import { validateForm, ValidationRules, ValidationResult } from '../utils/validation'

export interface UseFormOptions<T> {
  initialValues: T
  validationRules?: ValidationRules
  onSubmit: (values: T) => void | Promise<void>
}

export interface UseFormReturn<T> {
  values: T
  errors: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
  setValue: (field: keyof T, value: any) => void
  setValues: (values: Partial<T>) => void
  setError: (field: keyof T, error: string) => void
  setErrors: (errors: Record<string, string>) => void
  clearErrors: () => void
  reset: () => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  validate: () => ValidationResult
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }, [errors])

  const setValuesHandler = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }))
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }))
  }, [])

  const setErrorsHandler = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors)
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }, [initialValues])

  const validate = useCallback((): ValidationResult => {
    if (Object.keys(validationRules).length === 0) {
      return { isValid: true, errors: {} }
    }
    
    return validateForm(values, validationRules)
  }, [values, validationRules])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Validate form
    const validation = validate()
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    // Clear previous errors
    setErrors({})
    setIsSubmitting(true)

    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues: setValuesHandler,
    setError,
    setErrors: setErrorsHandler,
    clearErrors,
    reset,
    handleSubmit,
    validate,
  }
}
