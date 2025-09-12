import { useState, useEffect } from 'react'
import { Section } from '../api/endpoints'

interface SectionModalProps {
  isOpen: boolean
  onClose: () => void
  section: Section | null
  onSave: (sectionData: Partial<Section>) => Promise<void>
  loading: boolean
  professors: Array<{id: number, first_name: string, last_name: string, username: string}>
  terms: Array<{id: number, name: string, is_active: boolean}>
  gradeLevels: Array<{id: number, name: string, level: number}>
}

export function SectionModal({ 
  isOpen, 
  onClose, 
  section, 
  onSave, 
  loading, 
  professors, 
  terms,
  gradeLevels
}: SectionModalProps) {
  const [formData, setFormData] = useState<Partial<Section>>({
    name: '',
    capacity: 30,
    professor: 0,
    term: 0,
    grade_level: 0,
  })

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        capacity: section.capacity,
        professor: section.professor,
        term: section.term,
        grade_level: section.grade_level,
      })
    } else {
      setFormData({
        name: '',
        capacity: 30,
        professor: 0,
        term: 0,
        grade_level: 0,
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
    await onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {section ? 'Editar Sección' : 'Crear Sección'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Sección
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Sección A, Sección B"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity || 30}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
              required
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grado
            </label>
            <select
              name="grade_level"
              value={formData.grade_level || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>Seleccionar grado</option>
              {gradeLevels.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name} (Nivel {grade.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesor
            </label>
            <select
              name="professor"
              value={formData.professor || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>Seleccionar profesor</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.first_name} {professor.last_name} ({professor.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período Académico
            </label>
            <select
              name="term"
              value={formData.term || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>Seleccionar período</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} {term.is_active ? '(Activo)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (section ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
