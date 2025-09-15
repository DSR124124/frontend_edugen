import { useState, useEffect } from 'react'
import { GradeLevel } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface GradeLevelModalProps {
  isOpen: boolean
  onClose: () => void
  gradeLevel: GradeLevel | null
  onSave: (gradeLevelData: Partial<GradeLevel>) => Promise<void>
  loading: boolean
}

export function GradeLevelModal({ isOpen, onClose, gradeLevel, onSave, loading }: GradeLevelModalProps) {
  const [formData, setFormData] = useState<Partial<GradeLevel>>({
    name: '',
    level: 1,
  })

  useEffect(() => {
    if (gradeLevel) {
      setFormData({
        name: gradeLevel.name,
        level: gradeLevel.level,
      })
    } else {
      setFormData({
        name: '',
        level: 1,
      })
    }
  }, [gradeLevel])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={gradeLevel ? 'Editar Grado' : 'Crear Grado'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Grado"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Ej: 1er Grado, 2do Grado"
          required
        />

        <Input
          label="Nivel"
          type="number"
          name="level"
          value={formData.level || 1}
          onChange={handleChange}
          min="1"
          required
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Guardando...' : (gradeLevel ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
