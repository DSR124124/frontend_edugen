import { useState } from 'react'
import { useDirectorGradeLevels } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { GradeLevel } from '../../api/endpoints'
import { GradeLevelModal } from '../../components/modals/GradeLevelModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'

export function GradeLevelsPage() {
  const {
    gradeLevels,
    isLoading,
    createGradeLevel,
    updateGradeLevel,
    deleteGradeLevel,
  } = useDirectorGradeLevels()
  
  const { showSuccess, showError } = useNotificationContext()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [editingGradeLevel, setEditingGradeLevel] = useState<GradeLevel | null>(null)
  const [gradeLevelToDelete, setGradeLevelToDelete] = useState<number | null>(null)

  const handleCreateGradeLevel = async (data: Partial<GradeLevel>) => {
    try {
      await createGradeLevel.mutateAsync(data)
      setShowCreateModal(false)
      showSuccess('Éxito', 'Grado creado correctamente')
    } catch (error) {
      showError('Error', 'Error al crear el grado')
    }
  }

  const handleEditGradeLevel = (gradeLevel: GradeLevel) => {
    setEditingGradeLevel(gradeLevel)
    setShowEditModal(true)
  }

  const handleSaveGradeLevel = async (data: Partial<GradeLevel>) => {
    if (!editingGradeLevel) return

    try {
      await updateGradeLevel.mutateAsync({ id: editingGradeLevel.id, data })
      setShowEditModal(false)
      setEditingGradeLevel(null)
      showSuccess('Éxito', 'Grado actualizado correctamente')
    } catch (error) {
      showError('Error', 'Error al actualizar el grado')
    }
  }

  const handleDeleteGradeLevel = (id: number) => {
    setGradeLevelToDelete(id)
    setShowConfirmDelete(true)
  }

  const confirmDeleteGradeLevel = async () => {
    if (gradeLevelToDelete) {
      try {
        await deleteGradeLevel.mutateAsync(gradeLevelToDelete)
        setShowConfirmDelete(false)
        setGradeLevelToDelete(null)
        showSuccess('Éxito', 'Grado eliminado correctamente')
      } catch (error) {
        showError('Error', 'Error al eliminar el grado')
      }
    }
  }

  const cancelDeleteGradeLevel = () => {
    setShowConfirmDelete(false)
    setGradeLevelToDelete(null)
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Grados</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Crear Grado
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {gradeLevels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay grados registrados</p>
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
                      Nivel
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
                  {gradeLevels.map((gradeLevel) => (
                    <tr key={gradeLevel.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {gradeLevel.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {gradeLevel.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(gradeLevel.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditGradeLevel(gradeLevel)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteGradeLevel(gradeLevel.id)}
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

      {/* Modales */}
      <GradeLevelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        gradeLevel={null}
        onSave={handleCreateGradeLevel}
        loading={createGradeLevel.isPending}
      />

      <GradeLevelModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingGradeLevel(null)
        }}
        gradeLevel={editingGradeLevel}
        onSave={handleSaveGradeLevel}
        loading={updateGradeLevel.isPending}
      />

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={cancelDeleteGradeLevel}
        onConfirm={confirmDeleteGradeLevel}
        title="Eliminar Grado"
        message="¿Estás seguro de que quieres eliminar este grado? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteGradeLevel.isPending}
      />
    </div>
  )
}
