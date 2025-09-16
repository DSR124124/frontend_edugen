import { useState, useEffect } from 'react'
import { Term } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface TermModalProps {
  isOpen: boolean
  onClose: () => void
  term: Term | null
  onSave: (termData: Partial<Term>) => Promise<void>
  loading: boolean
}

export function TermModal({ isOpen, onClose, term, onSave, loading }: TermModalProps) {
  const [formData, setFormData] = useState<Partial<Term>>({
    name: '',
    start_date: '',
    end_date: '',
    is_active: true,
  })

  useEffect(() => {
    if (term) {
      setFormData({
        name: term.name,
        start_date: term.start_date,
        end_date: term.end_date,
        is_active: term.is_active,
      })
    } else {
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
      })
    }
  }, [term])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value,
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
      title={term ? 'Editar Período' : 'Crear Período'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Período"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Ej: 2025-I, 2025-II"
          required
        />

        <Input
          label="Fecha de Inicio"
          type="date"
          name="start_date"
          value={formData.start_date || ''}
          onChange={handleChange}
          required
        />

        <Input
          label="Fecha de Fin"
          type="date"
          name="end_date"
          value={formData.end_date || ''}
          onChange={handleChange}
          required
        />

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active || false}
              onChange={handleChange}
              className="mr-2 rounded border-base-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-base-content">
              Período Activo
            </span>
          </label>
        </div>

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
            {loading ? 'Guardando...' : (term ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
