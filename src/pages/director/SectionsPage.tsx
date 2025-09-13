import { useState, useEffect } from 'react'
import { useDirectorSections } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { directorApi } from '../../api/endpoints'
import { Section } from '../../api/endpoints'
import { SectionModal } from '../../components/modals/SectionModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'

export function SectionsPage() {
  const {
    sections,
    isLoading,
    createSection,
    updateSection,
    deleteSection,
  } = useDirectorSections()
  
  const { showSuccess, showError } = useNotificationContext()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null)
  const [sectionOptions, setSectionOptions] = useState<{
    terms: Array<{id: number, name: string, is_active: boolean}>,
    grade_levels: Array<{id: number, name: string, level: number}>
  }>({
    terms: [],
    grade_levels: []
  })

  // Cargar opciones para crear secciones
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await directorApi.getSectionOptions()
        setSectionOptions(response.data)
      } catch (error) {
        showError('Error', 'Error al cargar las opciones para crear secciones')
      }
    }
    loadOptions()
  }, [showError])

  const handleCreateSection = async (data: Partial<Section>) => {
    try {
      await createSection.mutateAsync(data)
      setShowCreateModal(false)
      showSuccess('Éxito', 'Sección creada correctamente')
    } catch (error) {
      showError('Error', 'Error al crear la sección')
    }
  }

  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setShowEditModal(true)
  }

  const handleSaveSection = async (data: Partial<Section>) => {
    if (!editingSection) return

    try {
      await updateSection.mutateAsync({ id: editingSection.id, data })
      setShowEditModal(false)
      setEditingSection(null)
      showSuccess('Éxito', 'Sección actualizada correctamente')
    } catch (error) {
      showError('Error', 'Error al actualizar la sección')
    }
  }

  const handleDeleteSection = (id: number) => {
    setSectionToDelete(id)
    setShowConfirmDelete(true)
  }

  const confirmDeleteSection = async () => {
    if (sectionToDelete) {
      try {
        await deleteSection.mutateAsync(sectionToDelete)
        setShowConfirmDelete(false)
        setSectionToDelete(null)
        showSuccess('Éxito', 'Sección eliminada correctamente')
      } catch (error) {
        showError('Error', 'Error al eliminar la sección')
      }
    }
  }

  const cancelDeleteSection = () => {
    setShowConfirmDelete(false)
    setSectionToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Secciones</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Crear Sección
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {sections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay secciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sections.map((section) => (
                    <tr key={section.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {section.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {section.grade_level?.name || `Grado ${section.grade_level}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {section.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(section.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditSection(section)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de crear sección */}
      <SectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        section={null}
        onSave={handleCreateSection}
        loading={createSection.isPending}
        terms={sectionOptions.terms}
        gradeLevels={sectionOptions.grade_levels}
      />

      {/* Modal de editar sección */}
      <SectionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingSection(null)
        }}
        section={editingSection}
        onSave={handleSaveSection}
        loading={updateSection.isPending}
        terms={sectionOptions.terms}
        gradeLevels={sectionOptions.grade_levels}
      />

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={cancelDeleteSection}
        onConfirm={confirmDeleteSection}
        title="Eliminar Sección"
        message="¿Estás seguro de que quieres eliminar esta sección? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteSection.isPending}
      />
    </div>
  )
}
