import { useEffect, useState } from 'react'
import { useDirectorApi } from '../../hooks/useDirectorApi'
import { UserDetailModal } from '../../components/modals/UserDetailModal'
import { EditUserModal } from '../../components/modals/EditUserModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { CreateUserModal } from '../../components/modals/CreateUserModal'
import { User } from '../../api/endpoints'
import { useNotificationContext } from '../../contexts/NotificationContext'

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

  const handleCreateUser = async (studentData: {
    username: string
    email: string
    first_name: string
    last_name: string
    password: string
    assigned_sections_ids: number[]
    role: 'ALUMNO'
  }) => {
    try {
      await createUser(studentData)
      setShowCreateUser(false)
      showSuccess('Éxito', 'Estudiante creado correctamente')
    } catch (err) {
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
      } catch (err) {
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
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Estudiantes
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los estudiantes de tu institución
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Estudiantes</h2>
              <button
                onClick={() => setShowCreateUser(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Estudiante
              </button>
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
                  onClick={() => loadUsers()}
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
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sección
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">
                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{student.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.assigned_sections && student.assigned_sections.length > 0 
                            ? student.assigned_sections.map(section => 
                                `${section.name} (${section.grade_level_name || 'Sin grado'})`
                              ).join(', ')
                            : 'Sin secciones asignadas'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewUser(student)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleEditUser(student)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteUser(student.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Eliminar
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
    </div>
  )
}
