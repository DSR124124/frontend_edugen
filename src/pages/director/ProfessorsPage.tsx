import { useEffect, useState } from 'react'
import { useDirectorApi } from '../../hooks/useDirectorApi'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { UserDetailModal } from '../../components/modals/UserDetailModal'
import { EditUserModal } from '../../components/modals/EditUserModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { CreateUserModal } from '../../components/modals/CreateUserModal'
import { User } from '../../api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export function ProfessorsPage() {
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

  // Filtrar solo profesores
  const professors = users.filter(user => user.role === 'PROFESOR')

  useEffect(() => {
    loadUsers()
  }, [loadUsers]) // Remove loadUsers dependency to prevent infinite loop

  const handleCreateUser = async (userData: {
    username: string
    email: string
    first_name: string
    last_name: string
    password: string
    assigned_sections_ids: number[]
    specialty?: string
  }) => {
    try {
      await createUser({ ...userData, role: 'PROFESOR' })
      setShowCreateUser(false)
      showSuccess('Éxito', 'Profesor creado correctamente')
    } catch {
      showError('Error', 'Error al crear el profesor')
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
        showSuccess('Éxito', 'Profesor eliminado correctamente')
      } catch {
        showError('Error', 'Error al eliminar el profesor')
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
      
      showSuccess('Éxito', 'Profesor actualizado correctamente')
    } catch {
      showError('Error', 'Error al actualizar el profesor')
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="headline-2xl text-base-content">
          Gestión de Profesores
        </h1>
        <p className="text-base-content/70 mt-2">
          Administra los profesores de tu institución
        </p>
      </div>

      {/* Stats Card */}
      <Card variant="elevated">
        <CardContent>
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-small font-medium text-base-content/70">Total Profesores</p>
              <p className="headline-2xl text-base-content">{professors.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professors Section */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base-content">Profesores</CardTitle>
            <Button
              onClick={() => setShowCreateUser(true)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Crear Profesor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-base-content/70">Cargando...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-error">{error}</p>
              <Button
                onClick={() => loadUsers()}
                variant="outline"
                className="mt-2"
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
                      Profesor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Sección Asignada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-base-100 divide-y divide-base-300">
                  {professors.map((professor) => (
                    <tr key={professor.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-success">
                                {professor.first_name.charAt(0)}{professor.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-base-content">
                              {professor.first_name} {professor.last_name}
                            </div>
                            <div className="text-sm text-base-content/70">
                              @{professor.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {professor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {professor.specialty_display || 'Sin especialidad'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                        {professor.assigned_sections && professor.assigned_sections.length > 0 
                          ? professor.assigned_sections.map(section => 
                              `${section.name} (${section.grade_level_name || 'Sin grado'})`
                            ).join(', ')
                          : 'Sin secciones asignadas'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleViewUser(professor)}
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
                            onClick={() => handleEditUser(professor)}
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
                            onClick={() => handleDeleteUser(professor.id)}
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

      {/* Create Professor Modal */}
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSave={handleCreateUser}
        loading={loading}
        userType="PROFESOR"
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
        title="Eliminar Profesor"
        message="¿Estás seguro de que quieres eliminar este profesor? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
      />
    </div>
  )
}
