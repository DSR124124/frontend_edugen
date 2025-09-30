import { useState, useEffect } from 'react'
import { Section } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

interface SectionModalProps {
  isOpen: boolean
  onClose: () => void
  section: Section | null
  onSave: (sectionData: Partial<Section>) => Promise<void>
  loading: boolean
  terms: Array<{id: number, name: string, is_active: boolean}>
  gradeLevels: Array<{id: number, name: string, level: number}>
}

export function SectionModal({ 
  isOpen, 
  onClose, 
  section, 
  onSave, 
  loading, 
  terms,
  gradeLevels
}: SectionModalProps) {
  type FormState = Omit<Partial<Section>, 'term' | 'grade_level'> & { term?: number | ''; grade_level?: number | '' }
  const [formData, setFormData] = useState<FormState>({
    name: '',
    capacity: 30,
    term: '',
    grade_level: '',
  })

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        capacity: section.capacity,
        term: (section.term as unknown as { id?: number })?.id ?? '',
        grade_level: (section.grade_level as unknown as { id?: number })?.id ?? '',
      })
    } else {
      setFormData({
        name: '',
        capacity: 30,
        term: '',
        grade_level: '',
      })
    }
  }, [section])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value,
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Adaptar a tipos de API: enviamos IDs numéricos
    const payload: Partial<Section> = {
      name: formData.name,
      capacity: formData.capacity,
      term: Number(formData.term) as unknown as Section['term'],
      grade_level: Number(formData.grade_level) as unknown as Section['grade_level'],
    }
    await onSave(payload)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={section ? 'Editar Sección' : 'Crear Sección'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de la Sección"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Ej: Sección A, Sección B"
          required
        />

        <Input
          label="Capacidad"
          type="number"
          name="capacity"
          value={formData.capacity || 30}
          onChange={handleChange}
          min="1"
          max="100"
          required
        />

        <Select
          label="Grado"
          name="grade_level"
          value={(formData.grade_level as number | '') ?? ''}
          onChange={handleChange}
          placeholder="Seleccionar grado"
          options={gradeLevels.map((grade) => ({
            value: grade.id,
            label: `${grade.name} (Nivel ${grade.level})`
          }))}
          required
        />

        <Select
          label="Período Académico"
          name="term"
          value={(formData.term as number | '') ?? ''}
          onChange={handleChange}
          placeholder="Seleccionar período"
          options={terms.map((term) => ({
            value: term.id,
            label: `${term.name} ${term.is_active ? '(Activo)' : ''}`
          }))}
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
            {loading ? 'Guardando...' : (section ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
