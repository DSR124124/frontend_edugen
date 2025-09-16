import { useState } from 'react'
import { useDirectorUsers } from '../../hooks/useDirectorUsers'
import { useAuthStore } from '../../store/auth'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { UserDetailModal } from '../../components/modals/UserDetailModal'
import { EditUserModal } from '../../components/modals/EditUserModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { CreateUserModal } from '../../components/modals/CreateUserModal'
import { User } from '../../api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

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

  const handleCreateUser = async (userData: any) => {
    try {
      const newUser = await createUser(userData)
      
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
      
    } catch (err: any) {
      showError(
        '❌ Error al Registrar Usuario',
        err.response?.data?.detail || 'No se pudo registrar el usuario. Inténtalo de nuevo.',
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
      } catch (err: any) {
        showError(
          'Error al Eliminar Usuario',
          err.response?.data?.detail || 'No se pudo eliminar el usuario.',
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
    } catch (error: any) {
      showError(
        'Error al Actualizar Usuario',
        error.response?.data?.detail || 'No se pudo actualizar el usuario.',
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
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-base-200)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="headline-2xl text-base-content">Panel del Director</h1>
          <p className="text-base-content/70 mt-2">Bienvenido, {user?.first_name} {user?.last_name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated">
            <CardContent>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-primary-100">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-base-content/70">Total Usuarios</p>
                  <p className="headline-2xl text-base-content">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-success-100">
                  <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-base-content/70">Profesores</p>
                  <p className="headline-2xl text-base-content">
                    {users.filter(u => u.role === 'PROFESOR').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-secondary-100">
                  <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-base-content/70">Estudiantes</p>
                  <p className="headline-2xl text-base-content">
                    {users.filter(u => u.role === 'ALUMNO').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Section */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base-content">Usuarios</CardTitle>
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setUserType('PROFESOR')
                    setShowCreateUser(true)
                  }}
                  variant="primary"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                >
                  Crear Profesor
                </Button>
                <Button
                  onClick={() => {
                    setUserType('ALUMNO')
                    setShowCreateUser(true)
                  }}
                  variant="secondary"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
                    </svg>
                  }
                >
                  Crear Estudiante
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-base-content">Cargando usuarios...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-error mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-base-300">
                  <thead className="bg-base-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-base-100 divide-y divide-base-300">
                    {currentUsers.map((user, index) => {
                      // Verificar si el usuario es recién creado (último en la lista)
                      const isNewUser = index === users.length - 1
                      const createdDate = new Date(user.created_at)
                      const isRecentlyCreated = (Date.now() - createdDate.getTime()) < 30000 // 30 segundos
                      
                      return (
                        <tr key={user.id} className={`hover:bg-base-200/50 ${isNewUser && isRecentlyCreated ? 'border-l-4 border-success bg-success-100' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ 
                                  backgroundColor: user.role === 'PROFESOR' ? 'var(--color-success-100)' : 'var(--color-primary)',
                                  color: user.role === 'PROFESOR' ? 'var(--color-success)' : 'white'
                                }}>
                                  <span className="text-sm font-medium">
                                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-medium text-base-content">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  {isNewUser && isRecentlyCreated && (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success">
                                      ✨ Nuevo
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-base-content/70">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{
                                backgroundColor: user.role === 'PROFESOR' ? 'var(--color-success-100)' : 'var(--color-primary)',
                                color: user.role === 'PROFESOR' ? 'var(--color-success)' : 'white'
                              }}>
                                {user.role === 'PROFESOR' ? '👨‍🏫 Profesor' : '👨‍🎓 Estudiante'}
                              </span>
                              {user.specialty && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-base-200 text-base-content">
                                  {user.specialty_display || user.specialty}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleViewUser(user)}
                                variant="ghost"
                                size="sm"
                                leftIcon={
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                }
                              >
                                Ver
                              </Button>
                              <Button
                                onClick={() => handleEditUser(user)}
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
                                onClick={() => handleDeleteUser(user.id)}
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
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-base-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-base-content/70">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalUsers)} de {totalUsers} usuarios
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Botón Anterior */}
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    ← Anterior
                  </Button>

                  {/* Números de página */}
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Mostrar solo algunas páginas alrededor de la actual
                      const showPage = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                      
                      if (!showPage) {
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 py-1 text-sm text-base-content/70">...</span>
                        }
                        return null
                      }

                      return (
                        <Button
                          key={page}
                          onClick={() => goToPage(page)}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Botón Siguiente */}
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Siguiente →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

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
