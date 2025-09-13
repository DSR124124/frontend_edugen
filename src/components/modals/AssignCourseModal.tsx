import { useState } from 'react'

interface Course {
  id: number
  name: string
  code: string
  description?: string
  institution: number
  created_at: string
}

interface Section {
  id: number
  name: string
  course?: {
    id: number
    name: string
    code: string
  }
  grade_level?: {
    id: number
    name: string
    level: number
  }
  term?: {
    id: number
    name: string
    is_active: boolean
  }
}


interface AssignCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    section_ids: number[]
  }) => void
  loading: boolean
  course: Course | null
  sections: Section[]
}

export function AssignCourseModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  course,
  sections
}: AssignCourseModalProps) {
  const [formData, setFormData] = useState({
    section_ids: [] as number[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    setFormData({
      section_ids: []
    })
    onClose()
  }

  const handleSectionChange = (sectionId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        section_ids: [...prev.section_ids, sectionId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        section_ids: prev.section_ids.filter(id => id !== sectionId)
      }))
    }
  }

  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Asignar Curso: {course.name}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Salones</label>
              <p className="text-xs text-gray-500 mb-2">Selecciona los salones (A, B, C, etc.) donde se impartirá este curso</p>
              <div className="mt-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {sections && sections.length > 0 ? (
                  sections.map((section) => (
                    <label key={section.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.section_ids.includes(section.id)}
                        onChange={(e) => handleSectionChange(section.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">Salón {section.name}</span>
                      {section.grade_level && (
                        <span className="text-xs text-gray-500">({section.grade_level.name})</span>
                      )}
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-2">No tienes salones asignados</p>
                )}
              </div>
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
              disabled={loading || formData.section_ids.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Asignando...' : 'Asignar a Salones'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
