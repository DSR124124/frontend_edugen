import { useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { getUserRoleDisplayName, getInitials } from '../../utils/helpers'
import { 
  User,
  Edit3,
  Save,
  X,
  Mail,
  AtSign,
  Award,
  Sparkles,
  Settings,
  UserCircle
} from 'lucide-react'

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
    <div className="space-y-3 sm:space-y-4 min-h-0" data-tour="settings-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6" data-tour="settings-header">
        <div className="flex items-center p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Mi Perfil</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Gestiona tu información personal y configuración
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Avatar and Basic Info */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm" data-tour="settings-content">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Información del Usuario</h2>
              <p className="text-xs sm:text-sm text-gray-600">Datos básicos de tu cuenta</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                {user ? getInitials(user.first_name, user.last_name) : 'U'}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">@{user?.username}</p>
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  <Award className="w-3 h-3 mr-1" />
                  {user?.role ? getUserRoleDisplayName(user.role) : 'Usuario'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Información Personal</h2>
                <p className="text-xs sm:text-sm text-gray-600">Edita tus datos personales</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              data-tour="edit-profile-button"
              className={`inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors space-x-2 ${
                isEditing 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nombre</label>
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.first_name}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Apellido</label>
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.last_name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email</label>
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <AtSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Usuario</label>
                    <p className="text-sm font-medium text-gray-900 truncate">@{user?.username}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Award className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Rol</label>
                    <p className="text-sm font-medium text-gray-900">{user?.role ? getUserRoleDisplayName(user.role) : 'Usuario'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
