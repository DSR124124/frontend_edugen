import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface Course {
  id: number
  name: string
  code: string
  description: string
  credits: number
  institution: number
  created_at: string
  updated_at: string
}

interface EditCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    code: string
    description: string
    credits: number
  }) => void
  loading: boolean
  course: Course | null
}

interface FormErrors {
  name: string
  code: string
  credits: string
}

export function EditCourseModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  course
}: EditCourseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 0
  })
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    code: '',
    credits: ''
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Actualizar el formulario cuando cambie el curso
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        code: course.code,
        description: course.description || '',
        credits: course.credits || 0
      })
    }
    // Limpiar errores y estado tocado
    setErrors({
      name: '',
      code: '',
      credits: ''
    })
    setTouched({})
    setIsSubmitting(false)
  }, [course])

  const validateField = (fieldName: string, value: string | number): string => {
    switch (fieldName) {
      case 'name':
        if (!value || !String(value).trim()) {
          return 'El nombre del curso es requerido'
        }
        if (String(value).trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres'
        }
        return ''
      case 'code':
        if (!value || !String(value).trim()) {
          return 'El código del curso es requerido'
        }
        if (String(value).trim().length < 2) {
          return 'El código debe tener al menos 2 caracteres'
        }
        return ''
      case 'credits': {
        const creditsNum = Number(value)
        if (isNaN(creditsNum) || creditsNum < 0) {
          return 'Los créditos deben ser un número mayor o igual a 0'
        }
        return ''
      }
      default:
        return ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateField('name', formData.name),
      code: validateField('code', formData.code),
      credits: validateField('credits', formData.credits)
    }

    setErrors(newErrors)
    setTouched({
      name: true,
      code: true,
      credits: true
    })

    return !newErrors.name && !newErrors.code && !newErrors.credits
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = validateForm()
    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        credits: formData.credits
      })
      onClose()
    } catch (error) {
      console.error('Error updating course:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? (parseInt(value) || 0) : value
    }))
    
    // Marcar campo como tocado
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    
    // Validar campo en tiempo real
    const fieldError = validateField(name, name === 'credits' ? (parseInt(value) || 0) : value)
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }))
  }

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      credits: 0
    })
    setErrors({
      name: '',
      code: '',
      credits: ''
    })
    setTouched({})
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Curso"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Curso"
          value={formData.name}
          onChange={handleChange}
          name="name"
          placeholder="Ej: Matemáticas Básicas"
          required
          error={errors.name && touched.name ? errors.name : undefined}
          disabled={loading || isSubmitting}
        />

        <Input
          label="Código del Curso"
          value={formData.code}
          onChange={handleChange}
          name="code"
          placeholder="Ej: MAT101"
          required
          error={errors.code && touched.code ? errors.code : undefined}
          disabled={loading || isSubmitting}
        />

        <Textarea
          label="Descripción (Opcional)"
          value={formData.description}
          onChange={handleChange}
          name="description"
          rows={3}
          placeholder="Descripción detallada del curso (opcional)"
          helperText="Proporciona una descripción detallada del curso para ayudar a los estudiantes"
          disabled={loading || isSubmitting}
        />

        <Input
          label="Créditos"
          type="number"
          min="0"
          value={formData.credits}
          onChange={handleChange}
          name="credits"
          placeholder="0"
          required
          error={errors.credits && touched.credits ? errors.credits : undefined}
          disabled={loading || isSubmitting}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={loading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={loading || isSubmitting || !formData.name.trim() || !formData.code.trim()}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}