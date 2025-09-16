import { useState, useEffect } from 'react'
import { useDirectorSections } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { directorApi } from '../../api/endpoints'
import { Section } from '../../api/endpoints'
import { SectionModal } from '../../components/modals/SectionModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoadingState, EmptySectionsState } from '../../components/common'

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
      } catch {
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
    } catch {
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
    } catch {
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
      } catch {
        showError('Error', 'Error al eliminar la sección')
      }
    }
  }

  const cancelDeleteSection = () => {
    setShowConfirmDelete(false)
    setSectionToDelete(null)
  }

  if (isLoading) {
    return <LoadingState message="Cargando secciones..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="headline-2xl text-base-content">Gestión de Secciones</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Crear Sección
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base-content">Lista de Secciones</CardTitle>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <EmptySectionsState 
              onAddSection={() => setShowCreateModal(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-base-300">
                <thead className="bg-base-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Capacidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-base-100 divide-y divide-base-300">
                  {sections.map((section) => (
                    <tr key={section.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-base-content">
                        {section.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {section.grade_level?.name || `Grado ${section.grade_level}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {section.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {new Date(section.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditSection(section)}
                            variant="ghost"
                            size="sm"
                            leftIcon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            }
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteSection(section.id)}
                            variant="danger"
                            size="sm"
                            leftIcon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            }
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
