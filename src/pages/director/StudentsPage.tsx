import { useEffect, useState } from 'react'
import { useDirectorApi } from '../../hooks/useDirectorApi'
import { UserDetailModal } from '../../components/modals/UserDetailModal'
import { EditUserModal } from '../../components/modals/EditUserModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { CreateUserModal } from '../../components/modals/CreateUserModal'
import { User } from '../../api/endpoints'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { 
  GraduationCap,
  Edit3,
  Trash2,
  Eye,
  Mail,
  BookOpen,
  Users,
  UserCheck,
  Sparkles,
  AlertCircle,
  School,
  UserPlus
} from 'lucide-react'

export function StudentsPage() {
  const {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useDirectorApi()

  const { showSuccess, showError } = useNotificationContext()

  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)

  // Filtrar solo estudiantes
  const students = users.filter(user => user.role === 'ALUMNO')

  useEffect(() => {
    loadUsers()
  }, [loadUsers]) // Remove loadUsers dependency to prevent infinite loop

  const handleCreateUser = async (userData: {
    username: string
    email: string
    first_name: string
    last_name: string
    password: string
    role: 'PROFESOR' | 'ALUMNO'
    assigned_sections_ids: number[]
    specialty?: string
  }) => {
    try {
      await createUser(userData)
      setShowCreateUser(false)
      showSuccess('Éxito', 'Estudiante creado correctamente')
    } catch {
      showError('Error', 'Error al crear el estudiante')
    }
  }

  const handleDeleteUser = (id: number) => {
    setUserToDelete(id)
    setShowConfirmDelete(true)
  }

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete)
        setShowConfirmDelete(false)
        setUserToDelete(null)
        showSuccess('Éxito', 'Estudiante eliminado correctamente')
      } catch {
        showError('Error', 'Error al eliminar el estudiante')
      }
    }
  }

  const cancelDeleteUser = () => {
    setShowConfirmDelete(false)
    setUserToDelete(null)
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditUser(true)
  }

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!editingUser) return
    
    try {
      await updateUser(editingUser.id, userData)
      
      // Cerrar el modal
      setShowEditUser(false)
      setEditingUser(null)
      
      showSuccess('Éxito', 'Usuario actualizado correctamente')
    } catch {
      showError('Error', 'Error al actualizar el usuario')
    }
  }

  const handleCloseEditUser = () => {
    setShowEditUser(false)
    setEditingUser(null)
  }

  const handleDeleteUserFromModal = (user: User) => {
    handleDeleteUser(user.id)
  }

  // Calcular estadísticas
  const studentsWithSections = students.filter(student => 
    student.assigned_sections && student.assigned_sections.length > 0
  ).length
  const studentsWithoutSections = students.length - studentsWithSections
  const totalSectionsAssigned = students.reduce((total, student) => 
    total + (student.assigned_sections?.length || 0), 0
  )

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0" data-tour="students-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6" data-tour="students-header">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Gestión de Estudiantes</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Administra los estudiantes de tu institución
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateUser(true)}
            data-tour="create-student-button"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium space-x-2"
          >
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Crear Estudiante</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6" data-tour="students-stats">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total Estudiantes</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{students.length}</p>
              <p className="text-xs text-blue-600 font-medium">Registrados</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Con Secciones</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{studentsWithSections}</p>
              <p className="text-xs text-green-600 font-medium">Asignados</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Sin Secciones</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{studentsWithoutSections}</p>
              <p className="text-xs text-orange-600 font-medium">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total Asignaciones</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalSectionsAssigned}</p>
              <p className="text-xs text-purple-600 font-medium">Secciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm" data-tour="students-content">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Lista de Estudiantes</h2>
              <p className="text-xs sm:text-sm text-gray-600">Administra los estudiantes de la institución</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Cargando estudiantes</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Obteniendo información de estudiantes...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Error al cargar estudiantes</h3>
                  <p className="text-sm text-gray-600 mb-4">{error || 'Ha ocurrido un error inesperado.'}</p>
                  <button
                    onClick={() => loadUsers()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <span>Reintentar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No hay estudiantes registrados</h3>
                  <p className="text-sm text-gray-600 mb-4">Comienza agregando estudiantes a tu institución.</p>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Primer Estudiante</span>
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
                        <GraduationCap className="w-3 h-3" />
                        <span>Estudiante</span>
                      </div>
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Secciones</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs sm:text-sm font-bold">
                                {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{student.username}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {student.email}
                            </div>
                            <div className="text-xs text-gray-500 lg:hidden">
                              {student.assigned_sections && student.assigned_sections.length > 0 
                                ? `${student.assigned_sections.length} sección${student.assigned_sections.length > 1 ? 'es' : ''}`
                                : 'Sin secciones'
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.email}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.assigned_sections && student.assigned_sections.length > 0 ? (
                          <div className="space-y-1">
                            {student.assigned_sections.map((section, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-1">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {section.name} ({section.grade_level_name || 'Sin grado'})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Sin secciones asignadas
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => handleViewUser(student)}
                            className="inline-flex items-center px-2 py-1 border border-blue-300 text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Ver</span>
                          </button>
                          <button
                            onClick={() => handleEditUser(student)}
                            className="inline-flex items-center px-2 py-1 border border-green-300 text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors text-xs"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(student.id)}
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

      {/* Create Student Modal */}
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSave={handleCreateUser}
        loading={loading}
        userType="ALUMNO"
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={showUserDetail}
        onClose={() => setShowUserDetail(false)}
        user={selectedUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUserFromModal}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditUser}
        onClose={handleCloseEditUser}
        user={editingUser}
        onSave={handleSaveUser}
        loading={loading}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Eliminar Estudiante"
        message="¿Estás seguro de que quieres eliminar este estudiante? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
      />
    </div>
  )
}
