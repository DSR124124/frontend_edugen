import { useState } from 'react'
import { useDirectorUsers } from '../../hooks/useDirectorUsers'
import { useAuthStore } from '../../store/auth'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { UserDetailModal } from '../../components/modals/UserDetailModal'
import { EditUserModal } from '../../components/modals/EditUserModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { CreateUserModal } from '../../components/modals/CreateUserModal'
import { User } from '../../api/endpoints'
import { 
  BarChart3,
  Users,
  GraduationCap,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  UserCheck,
  School
} from 'lucide-react'

export function DirectorDashboard() {
  const { user } = useAuthStore()
  const { showSuccess, showError } = useNotificationContext()
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
  } = useDirectorUsers()

  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  const [userType, setUserType] = useState<'PROFESOR' | 'ALUMNO'>('PROFESOR')
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Users are loaded automatically by the hook

  // Calcular datos de paginación
  const totalUsers = users.length
  const totalPages = Math.ceil(totalUsers / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const newUser = await createUser({ ...userData, password: 'defaultPassword123' })
      
      // Mostrar notificación de éxito con detalles específicos
      if (userData.role === 'PROFESOR') {
        showSuccess(
          ' ¡Profesor Registrado Exitosamente!',
          `El profesor ${newUser.first_name} ${newUser.last_name} (${newUser.username}) ha sido registrado correctamente y ya aparece en la lista de docentes activos.`,
          { duration: 6000 }
        )
      } else {
        showSuccess(
          '¡Estudiante Registrado Exitosamente!',
          `El estudiante ${newUser.first_name} ${newUser.last_name} (${newUser.username}) ha sido registrado correctamente y ya aparece en la lista de estudiantes.`,
          { duration: 6000 }
        )
      }
      
      // Cerrar el modal
      setShowCreateUser(false)
      
      // La lista se actualiza automáticamente gracias al hook useDirectorUsers
      
    } catch (err: unknown) {
      showError(
        '❌ Error al Registrar Usuario',
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'No se pudo registrar el usuario. Inténtalo de nuevo.',
        { duration: 5000 }
      )
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
        showSuccess(
          'Usuario Eliminado',
          'El usuario ha sido eliminado correctamente.',
          { duration: 3000 }
        )
        setShowConfirmDelete(false)
        setUserToDelete(null)
      } catch (err: unknown) {
        showError(
          'Error al Eliminar Usuario',
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'No se pudo eliminar el usuario.',
          { duration: 5000 }
        )
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
      
      // Mostrar notificación de éxito
      showSuccess(
        'Usuario Actualizado',
        'Los datos del usuario han sido actualizados correctamente.',
        { duration: 3000 }
      )
    } catch (error: unknown) {
      showError(
        'Error al Actualizar Usuario',
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'No se pudo actualizar el usuario.',
        { duration: 5000 }
      )
    }
  }

  const handleCloseEditUser = () => {
    setShowEditUser(false)
    setEditingUser(null)
  }

  const handleDeleteUserFromModal = (user: User) => {
    handleDeleteUser(user.id)
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0" data-tour="director-dashboard">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
        <div className="flex items-center p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Panel del Director</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Gestión integral de la institución educativa - Bienvenido, {user?.first_name} {user?.last_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6" data-tour="dashboard-stats">
        {/* Total Usuarios */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total Usuarios</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{users.length}</p>
              <p className="text-xs text-blue-600 font-medium">Sistema activo</p>
            </div>
          </div>
        </div>

        {/* Profesores */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Profesores</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {users.filter(u => u.role === 'PROFESOR').length}
              </p>
              <p className="text-xs text-green-600 font-medium">Docentes activos</p>
            </div>
          </div>
        </div>

        {/* Estudiantes */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Estudiantes</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {users.filter(u => u.role === 'ALUMNO').length}
              </p>
              <p className="text-xs text-purple-600 font-medium">Alumnos matriculados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm" data-tour="dashboard-content">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <School className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Gestión de Usuarios</h2>
                <p className="text-xs sm:text-sm text-gray-600">Administra profesores y estudiantes</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3" data-tour="dashboard-actions">
              <button
                onClick={() => {
                  setUserType('PROFESOR')
                  setShowCreateUser(true)
                }}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Crear Profesor</span>
              </button>
              <button
                onClick={() => {
                  setUserType('ALUMNO')
                  setShowCreateUser(true)
                }}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Crear Estudiante</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Cargando usuarios</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Obteniendo información del sistema...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Error al cargar</h3>
                  <p className="text-sm text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user, index) => {
                    // Verificar si el usuario es recién creado (último en la lista)
                    const isNewUser = index === users.length - 1
                    const createdDate = new Date(user.created_at)
                    const isRecentlyCreated = (Date.now() - createdDate.getTime()) < 30000 // 30 segundos
                    
                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${isNewUser && isRecentlyCreated ? 'border-l-4 border-green-500 bg-green-50' : ''}`}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${
                                user.role === 'PROFESOR' 
                                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
                                  : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                              }`}>
                                <span className="text-xs sm:text-sm font-medium">
                                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {user.first_name} {user.last_name}
                                </div>
                                {isNewUser && isRecentlyCreated && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1 sm:mt-0">
                                    ✨ Nuevo
                                  </span>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                @{user.username}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden mt-1">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                              user.role === 'DIRECTOR'
                                ? 'bg-yellow-100 text-yellow-800'
                                : user.role === 'PROFESOR'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}>
                              {user.role === 'DIRECTOR' ? (
                                <><Crown className="w-3 h-3 mr-1" /> Director</>
                              ) : user.role === 'PROFESOR' ? (
                                <><Users className="w-3 h-3 mr-1" /> Profesor</>
                              ) : (
                                <><GraduationCap className="w-3 h-3 mr-1" /> Estudiante</>
                              )}
                            </span>
                            {user.specialty && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 w-fit">
                                {user.specialty_display || user.specialty}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-gray-700 bg-white rounded hover:bg-gray-50 transition-colors text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Ver</span>
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="inline-flex items-center px-2 py-1 border border-blue-300 text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-xs"
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
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

        {/* Controles de Paginación */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(endIndex, totalUsers)}</span> de <span className="font-medium">{totalUsers}</span> usuarios
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                {/* Botón Anterior */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números de página */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Mostrar solo algunas páginas alrededor de la actual
                    const showPage = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                    
                    if (!showPage) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 py-1 text-sm text-gray-500">...</span>
                      }
                      return null
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSave={handleCreateUser}
        loading={loading}
        userType={userType}
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
        loading={false}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Eliminar Usuario"
        message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
      />
    </div>
  )
}
