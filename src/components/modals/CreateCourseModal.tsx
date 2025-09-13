import { useState } from 'react'

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


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Curso</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Curso</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Código del Curso</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Créditos</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.credits}
                      onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
