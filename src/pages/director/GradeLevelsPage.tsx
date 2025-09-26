import { useState } from 'react'
import { useDirectorGradeLevels } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { GradeLevel } from '../../api/endpoints'
import { GradeLevelModal } from '../../components/modals/GradeLevelModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { LoadingState, EmptyGradeLevelsState } from '../../components/common'
import { 
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Hash,
  Sparkles,
  Award,
  BookOpen,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

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
      <div className="space-y-3 sm:space-y-4 min-h-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
          <div className="flex items-center p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>Gestión de Grados</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Administra los niveles académicos de tu institución
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 sm:py-12">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Cargando grados</h3>
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
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Gestión de Grados</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Administra los niveles académicos de tu institución
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium space-x-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Crear Grado</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total Grados</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{gradeLevels.length}</p>
              <p className="text-xs text-blue-600 font-medium">Niveles configurados</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Nivel Máximo</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {gradeLevels.length > 0 ? Math.max(...gradeLevels.map(g => g.level)) : 0}
              </p>
              <p className="text-xs text-green-600 font-medium">Grado superior</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Nivel Mínimo</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {gradeLevels.length > 0 ? Math.min(...gradeLevels.map(g => g.level)) : 0}
              </p>
              <p className="text-xs text-purple-600 font-medium">Grado inicial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Lista de Grados</h2>
              <p className="text-xs sm:text-sm text-gray-600">Administra los niveles académicos de la institución</p>
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          {gradeLevels.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No hay grados configurados</h3>
                  <p className="text-sm text-gray-600 mb-4">Comienza creando los niveles académicos de tu institución.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Primer Grado</span>
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
                        <Hash className="w-3 h-3" />
                        <span>Nivel</span>
                      </div>
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Fecha de Creación</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gradeLevels.map((gradeLevel) => (
                    <tr key={gradeLevel.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs sm:text-sm font-bold">
                                {gradeLevel.level}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {gradeLevel.name}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              Nivel {gradeLevel.level} • {new Date(gradeLevel.created_at).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Nivel {gradeLevel.level}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(gradeLevel.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => handleEditGradeLevel(gradeLevel)}
                            className="inline-flex items-center px-2 py-1 border border-blue-300 text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-xs"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGradeLevel(gradeLevel.id)}
                            className="inline-flex items-center px-2 py-1 border border-red-300 text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
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
