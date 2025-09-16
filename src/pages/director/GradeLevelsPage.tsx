import { useState } from 'react'
import { useDirectorGradeLevels } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { GradeLevel } from '../../api/endpoints'
import { GradeLevelModal } from '../../components/modals/GradeLevelModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

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
    } catch {
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
    } catch {
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
      } catch {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="headline-2xl text-base-content">Gestión de Grados</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Crear Grado
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base-content">Lista de Grados</CardTitle>
        </CardHeader>
        <CardContent>
          {gradeLevels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/70">No hay grados registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-base-300">
                <thead className="bg-base-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Nivel
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
                  {gradeLevels.map((gradeLevel) => (
                    <tr key={gradeLevel.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-base-content">
                        {gradeLevel.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {gradeLevel.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {new Date(gradeLevel.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditGradeLevel(gradeLevel)}
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
                            onClick={() => handleDeleteGradeLevel(gradeLevel.id)}
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
