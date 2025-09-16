import { useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { getUserRoleDisplayName, getInitials } from '../../utils/helpers'
import { 
  FiUser,
  FiEdit,
  FiSave,
  FiX,
  FiMail,
  FiAtSign,
  FiAward
} from 'react-icons/fi'

export function Profile() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser(formData)
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <FiUser className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="headline-2xl text-base-content">
            Mi Perfil
          </h1>
          <p className="text-small text-base-content/70">
            Gestiona tu información personal
          </p>
        </div>
      </div>

      {/* User Avatar and Basic Info */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold bg-primary-100 text-primary">
            {user ? getInitials(user.first_name, user.last_name) : 'U'}
          </div>
          <div className="flex-1">
            <h2 className="headline-xl text-base-content">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-small text-base-content/70">@{user?.username}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary">
                <FiAward className="w-3 h-3 mr-1" />
                {user?.role ? getUserRoleDisplayName(user.role) : 'Usuario'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="headline-lg text-base-content flex items-center space-x-2">
            <FiUser className="w-5 h-5 text-primary" />
            <span>Información Personal</span>
          </h2>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "primary"}
            leftIcon={isEditing ? <FiX className="w-4 h-4" /> : <FiEdit className="w-4 h-4" />}
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className="flex justify-end space-x-3 pt-4 border-t border-base-300">
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                variant="outline"
                leftIcon={<FiX className="w-4 h-4" />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<FiSave className="w-4 h-4" />}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiUser className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <label className="text-small font-medium text-base-content/70">Nombre</label>
                  <p className="text-regular text-base-content">{user?.first_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiUser className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <label className="text-small font-medium text-base-content/70">Apellido</label>
                  <p className="text-regular text-base-content">{user?.last_name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <FiMail className="w-4 h-4 text-success" />
              </div>
              <div>
                <label className="text-small font-medium text-base-content/70">Email</label>
                <p className="text-regular text-base-content">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-info-100 rounded-lg">
                <FiAtSign className="w-4 h-4 text-info" />
              </div>
              <div>
                <label className="text-small font-medium text-base-content/70">Usuario</label>
                <p className="text-regular text-base-content">@{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <FiAward className="w-4 h-4 text-warning" />
              </div>
              <div>
                <label className="text-small font-medium text-base-content/70">Rol</label>
                <p className="text-regular text-base-content">{user?.role ? getUserRoleDisplayName(user.role) : 'Usuario'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
