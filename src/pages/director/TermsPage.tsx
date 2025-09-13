import { useState } from 'react'
import { useDirectorTerms } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { Term } from '../../api/endpoints'
import { TermModal } from '../../components/modals/TermModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'

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
    } catch (error) {
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
    } catch (error) {
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
      } catch (error) {
        showError('Error', 'Error al eliminar el período')
      }
    }
  }

  const cancelDeleteTerm = () => {
    setShowConfirmDelete(false)
    setTermToDelete(null)
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Períodos Académicos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Crear Período
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {terms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay períodos registrados</p>
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
                      Fecha de Inicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {terms.map((term) => (
                    <tr key={term.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {term.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(term.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(term.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          term.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {term.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditTerm(term)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTerm(term.id)}
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
