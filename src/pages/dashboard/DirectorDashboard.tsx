import { useState } from 'react'
import { useDirectorUsers } from '../../hooks/useDirectorUsers'
import { useAuthStore } from '../../store/auth'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { UserDetailModal } from '../../components/modals/UserDetailModal'
import { EditUserModal } from '../../components/modals/EditUserModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { CreateUserModal } from '../../components/modals/CreateUserModal'
import { User } from '../../api/endpoints'

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

  // Users are loaded automatically by the hook

  const handleCreateUser = async (userData: any) => {
    try {
      const newUser = await createUser(userData)
      
      // Mostrar notificación de éxito con detalles específicos
      if (userData.role === 'PROFESOR') {
        showSuccess(
          '🎉 ¡Profesor Registrado Exitosamente!',
          `El profesor ${newUser.first_name} ${newUser.last_name} (${newUser.username}) ha sido registrado correctamente y ya aparece en la lista de docentes activos.`,
          6000
        )
      } else {
        showSuccess(
          '🎉 ¡Estudiante Registrado Exitosamente!',
          `El estudiante ${newUser.first_name} ${newUser.last_name} (${newUser.username}) ha sido registrado correctamente y ya aparece en la lista de estudiantes.`,
          6000
        )
      }
      
      // Cerrar el modal
      setShowCreateUser(false)
      
      // La lista se actualiza automáticamente gracias al hook useDirectorUsers
      
    } catch (err: any) {
      showError(
        '❌ Error al Registrar Usuario',
        err.response?.data?.detail || 'No se pudo registrar el usuario. Inténtalo de nuevo.',
        5000
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
          3000
        )
        setShowConfirmDelete(false)
        setUserToDelete(null)
      } catch (err: any) {
        showError(
          'Error al Eliminar Usuario',
          err.response?.data?.detail || 'No se pudo eliminar el usuario.',
          5000
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
        3000
      )
    } catch (error: any) {
      showError(
        'Error al Actualizar Usuario',
        error.response?.data?.detail || 'No se pudo actualizar el usuario.',
        5000
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel del Director
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.first_name} {user?.last_name}
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/director/institution'}>
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Institución</p>
                <p className="text-lg font-semibold text-gray-900">Gestionar</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/director/grades'}>
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Grados</p>
                <p className="text-lg font-semibold text-gray-900">Gestionar</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/director/terms'}>
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Períodos</p>
                <p className="text-lg font-semibold text-gray-900">Gestionar</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/director/sections'}>
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Secciones</p>
                <p className="text-lg font-semibold text-gray-900">Gestionar</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/director/professors'}>
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profesores</p>
                <p className="text-lg font-semibold text-gray-900">Gestionar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profesores</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.role === 'PROFESOR').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.role === 'ALUMNO').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Usuarios</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setUserType('PROFESOR')
                    setShowCreateUser(true)
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <span>👨‍🏫</span>
                  <span>Crear Profesor</span>
                </button>
                <button
                  onClick={() => {
                    setUserType('ALUMNO')
                    setShowCreateUser(true)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>👨‍🎓</span>
                  <span>Crear Estudiante</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user, index) => {
                      // Verificar si el usuario es recién creado (último en la lista)
                      const isNewUser = index === users.length - 1
                      const createdDate = new Date(user.created_at)
                      const isRecentlyCreated = (Date.now() - createdDate.getTime()) < 30000 // 30 segundos
                      
                      return (
                        <tr key={user.id} className={isNewUser && isRecentlyCreated ? 'bg-green-50 border-l-4 border-green-400' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  user.role === 'PROFESOR' 
                                    ? 'bg-green-100' 
                                    : 'bg-blue-100'
                                }`}>
                                  <span className={`text-sm font-medium ${
                                    user.role === 'PROFESOR' 
                                      ? 'text-green-700' 
                                      : 'text-blue-700'
                                  }`}>
                                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  {isNewUser && isRecentlyCreated && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      ✨ Nuevo
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'PROFESOR' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'PROFESOR' ? '👨‍🏫 Profesor' : '👨‍🎓 Estudiante'}
                              </span>
                              {user.specialty && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                  {user.specialty_display || user.specialty}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="text-blue-600 hover:text-blue-900 font-medium hover:bg-blue-50 px-2 py-1 rounded"
                              >
                                👁️ Ver
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-green-600 hover:text-green-900 font-medium hover:bg-green-50 px-2 py-1 rounded"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900 font-medium hover:bg-red-50 px-2 py-1 rounded"
                              >
                                🗑️ Eliminar
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
    </div>
  )
}
