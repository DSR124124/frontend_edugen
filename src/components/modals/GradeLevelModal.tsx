import { useState, useEffect } from 'react'
import { GradeLevel } from '../../api/endpoints'

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {gradeLevel ? 'Editar Grado' : 'Crear Grado'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Grado
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1er Grado, 2do Grado"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel
            </label>
            <input
              type="number"
              name="level"
              value={formData.level || 1}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
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
              {loading ? 'Guardando...' : (gradeLevel ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
