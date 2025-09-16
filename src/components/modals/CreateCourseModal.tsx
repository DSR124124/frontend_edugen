import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

// interface Course {
//   id: number
//   name: string
//   code: string
//   description?: string
//   institution: number
//   created_at: string
// }


interface CreateCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    code: string
    description: string
    credits: number
  }) => void
  loading: boolean
}

export function CreateCourseModal({
  isOpen,
  onClose,
  onSubmit,
  loading
}: CreateCourseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      credits: 0,
      // section_ids: [],
      // grade_level_id: ''
    })
    onClose()
  }


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Nuevo Curso"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Curso"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        
        <Input
          label="Código del Curso"
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          required
        />
        
        <Textarea
          label="Descripción (Opcional)"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
        
        <Input
          label="Créditos"
          type="number"
          min="0"
          value={formData.credits.toString()}
          onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {loading ? 'Creando...' : 'Crear Curso'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
