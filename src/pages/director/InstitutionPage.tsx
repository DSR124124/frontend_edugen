import { useState } from 'react'
import { useDirectorInstitution } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { Institution } from '../../api/endpoints'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { 
  Building2,
  Edit3,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export function InstitutionPage() {
  const { institution, isLoading, error, updateInstitution } = useDirectorInstitution()
  const { showSuccess, showError } = useNotificationContext()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Institution>>({})

  const handleEdit = () => {
    if (institution) {
      setFormData({
        name: institution.name,
        code: institution.code,
        address: institution.address,
        phone: institution.phone,
        email: institution.email,
      })
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  const handleSave = async () => {
    try {
      await updateInstitution.mutateAsync(formData)
      setIsEditing(false)
      setFormData({})
      showSuccess('Éxito', 'Información de la institución actualizada correctamente')
    } catch {
      showError('Error', 'Error al actualizar la información de la institución')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 min-h-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
          <div className="flex items-center p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>Información de la Institución</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Gestiona los datos principales de tu institución educativa
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 sm:py-12">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Cargando información</h3>
              <p className="text-xs sm:text-sm text-gray-600">Obteniendo datos de la institución...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 sm:space-y-4 min-h-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
          <div className="flex items-center p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>Información de la Institución</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Gestiona los datos principales de tu institución educativa
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 sm:py-12">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Error al cargar</h3>
              <p className="text-sm text-red-600 mb-4">{error instanceof Error ? error.message : String(error)}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!institution) {
    return (
      <div className="space-y-3 sm:space-y-4 min-h-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
          <div className="flex items-center p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>Información de la Institución</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Gestiona los datos principales de tu institución educativa
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 sm:py-12">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Institución no encontrada</h3>
              <p className="text-sm text-gray-600">Contacta al administrador del sistema para configurar la información de tu institución.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0" data-tour="institution-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6" data-tour="institution-header">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Información de la Institución</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Gestiona los datos principales de tu institución educativa
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              data-tour="edit-institution-button"
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium space-x-2"
            >
              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Editar Información</span>
              <span className="sm:hidden">Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm" data-tour="institution-content">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Datos de la Institución</h2>
              <p className="text-xs sm:text-sm text-gray-600">Información principal de la institución educativa</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          {isEditing ? (
            <form className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la Institución *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Nombre completo de la institución"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Código *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      name="code"
                      value={formData.code || ''}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Código único de la institución"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Número de teléfono principal"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="correo@institucion.edu"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <Textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="pl-10 pt-3"
                    rows={3}
                    placeholder="Dirección completa de la institución"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={updateInstitution.isPending}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateInstitution.isPending}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium space-x-2"
                >
                  {updateInstitution.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Nombre de la Institución
                    </label>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{institution.name}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="h-4 w-4 text-green-600" />
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Código
                    </label>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{institution.code}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-4 w-4 text-purple-600" />
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Teléfono
                    </label>
                  </div>
                  <p className="text-base sm:text-lg text-gray-900">{institution.phone || 'No especificado'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="h-4 w-4 text-cyan-600" />
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Email
                    </label>
                  </div>
                  <p className="text-base sm:text-lg text-gray-900">{institution.email || 'No especificado'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Dirección
                  </label>
                </div>
                <p className="text-base sm:text-lg text-gray-900">{institution.address || 'No especificada'}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Fecha de Creación
                    </label>
                  </div>
                  <p className="text-sm text-gray-700">
                    {new Date(institution.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Última Actualización
                    </label>
                  </div>
                  <p className="text-sm text-gray-700">
                    {new Date(institution.updated_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
