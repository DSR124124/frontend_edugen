import { useState } from 'react'
import { useDirectorTerms } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { Term } from '../../api/endpoints'
import { TermModal } from '../../components/modals/TermModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoadingState, EmptyTermsState } from '../../components/common'

export function TermsPage() {
  const {
    terms,
    isLoading,
    createTerm,
    updateTerm,
    deleteTerm,
  } = useDirectorTerms()
  
  const { showSuccess, showError } = useNotificationContext()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [termToDelete, setTermToDelete] = useState<number | null>(null)

  const handleCreateTerm = async (data: Partial<Term>) => {
    try {
      await createTerm.mutateAsync(data)
      setShowCreateModal(false)
      showSuccess('Éxito', 'Período creado correctamente')
    } catch {
      showError('Error', 'Error al crear el período')
    }
  }

  const handleEditTerm = (term: Term) => {
    setEditingTerm(term)
    setShowEditModal(true)
  }

  const handleSaveTerm = async (data: Partial<Term>) => {
    if (!editingTerm) return

    try {
      await updateTerm.mutateAsync({ id: editingTerm.id, data })
      setShowEditModal(false)
      setEditingTerm(null)
      showSuccess('Éxito', 'Período actualizado correctamente')
    } catch {
      showError('Error', 'Error al actualizar el período')
    }
  }

  const handleDeleteTerm = (id: number) => {
    setTermToDelete(id)
    setShowConfirmDelete(true)
  }

  const confirmDeleteTerm = async () => {
    if (termToDelete) {
      try {
        await deleteTerm.mutateAsync(termToDelete)
        setShowConfirmDelete(false)
        setTermToDelete(null)
        showSuccess('Éxito', 'Período eliminado correctamente')
      } catch {
        showError('Error', 'Error al eliminar el período')
      }
    }
  }

  const cancelDeleteTerm = () => {
    setShowConfirmDelete(false)
    setTermToDelete(null)
  }

  if (isLoading) {
    return <LoadingState message="Cargando períodos académicos..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="headline-2xl text-base-content">Gestión de Períodos Académicos</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Crear Período
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base-content">Lista de Períodos Académicos</CardTitle>
        </CardHeader>
        <CardContent>
          {terms.length === 0 ? (
            <EmptyTermsState 
              onAddTerm={() => setShowCreateModal(true)}
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
                      Fecha de Inicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Fecha de Fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-base-100 divide-y divide-base-300">
                  {terms.map((term) => (
                    <tr key={term.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-base-content">
                        {term.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {new Date(term.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {new Date(term.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge-${term.is_active ? 'success' : 'info'}`}>
                          {term.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditTerm(term)}
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
                            onClick={() => handleDeleteTerm(term.id)}
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
      <TermModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        term={null}
        onSave={handleCreateTerm}
        loading={createTerm.isPending}
      />

      <TermModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTerm(null)
        }}
        term={editingTerm}
        onSave={handleSaveTerm}
        loading={updateTerm.isPending}
      />

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={cancelDeleteTerm}
        onConfirm={confirmDeleteTerm}
        title="Eliminar Período"
        message="¿Estás seguro de que quieres eliminar este período? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteTerm.isPending}
      />
    </div>
  )
}
