import { useState } from 'react'
import { useDirectorTerms } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { Term } from '../../api/endpoints'
import { TermModal } from '../../components/modals/TermModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { LoadingState, EmptyTermsState } from '../../components/common'
import { 
  Calendar,
  Plus,
  Edit3,
  Trash2,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  BookOpen,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react'

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

  // Calcular estadísticas
  const activeTermsCount = terms.filter(term => term.is_active).length
  const inactiveTermsCount = terms.filter(term => !term.is_active).length
  const currentDate = new Date()
  const upcomingTermsCount = terms.filter(term => new Date(term.start_date) > currentDate).length

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 min-h-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
          <div className="flex items-center p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>Gestión de Períodos Académicos</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Administra los períodos académicos de tu institución
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 sm:py-12">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Cargando períodos</h3>
              <p className="text-xs sm:text-sm text-gray-600">Obteniendo información académica...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Gestión de Períodos Académicos</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Administra los períodos académicos de tu institución
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium space-x-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Crear Período</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total Períodos</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{terms.length}</p>
              <p className="text-xs text-blue-600 font-medium">Configurados</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Activos</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{activeTermsCount}</p>
              <p className="text-xs text-green-600 font-medium">En curso</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg flex-shrink-0">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Inactivos</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{inactiveTermsCount}</p>
              <p className="text-xs text-red-600 font-medium">Finalizados</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Próximos</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{upcomingTermsCount}</p>
              <p className="text-xs text-purple-600 font-medium">Por iniciar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Lista de Períodos Académicos</h2>
              <p className="text-xs sm:text-sm text-gray-600">Administra los períodos académicos de la institución</p>
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          {terms.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No hay períodos configurados</h3>
                  <p className="text-sm text-gray-600 mb-4">Comienza creando los períodos académicos de tu institución.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Primer Período</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Nombre</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Inicio</span>
                      </div>
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Fin</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>Estado</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {terms.map((term) => {
                    const startDate = new Date(term.start_date)
                    const endDate = new Date(term.end_date)
                    const currentDate = new Date()
                    const isUpcoming = startDate > currentDate
                    const isOngoing = startDate <= currentDate && endDate >= currentDate
                    const isFinished = endDate < currentDate
                    
                    return (
                      <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${
                                term.is_active 
                                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                              }`}>
                                {term.is_active ? (
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                ) : (
                                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                )}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {term.name}
                              </div>
                              <div className="text-xs text-gray-500 lg:hidden">
                                {startDate.toLocaleDateString('es-ES')} - {endDate.toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {startDate.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {endDate.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                              term.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {term.is_active ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> Activo</>
                              ) : (
                                <><XCircle className="w-3 h-3 mr-1" /> Inactivo</>
                              )}
                            </span>
                            {isUpcoming && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 w-fit">
                                <Clock className="w-3 h-3 mr-1" /> Próximo
                              </span>
                            )}
                            {isOngoing && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 w-fit">
                                <Activity className="w-3 h-3 mr-1" /> En curso
                              </span>
                            )}
                            {isFinished && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 w-fit">
                                <XCircle className="w-3 h-3 mr-1" /> Finalizado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleEditTerm(term)}
                              className="inline-flex items-center px-2 py-1 border border-blue-300 text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-xs"
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTerm(term.id)}
                              className="inline-flex items-center px-2 py-1 border border-red-300 text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
