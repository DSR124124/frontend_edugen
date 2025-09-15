import { useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { getUserRoleDisplayName, getInitials } from '../../utils/helpers'

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="headline-2xl text-base-content">Mi Perfil</h1>
        <p className="text-base-content/70 mt-2">Gestiona tu información personal</p>
      </div>

      {/* User Avatar and Basic Info */}
      <Card variant="elevated">
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold" style={{ 
              backgroundColor: user?.role === 'PROFESOR' ? 'var(--color-success-100)' : 'var(--color-primary)',
              color: user?.role === 'PROFESOR' ? 'var(--color-success)' : 'white'
            }}>
              {user ? getInitials(user.first_name, user.last_name) : 'U'}
            </div>
            <div className="flex-1">
              <h2 className="headline-xl text-base-content">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-base-content/70">@{user?.username}</p>
              <div className="mt-2">
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full" style={{
                  backgroundColor: user?.role === 'PROFESOR' ? 'var(--color-success-100)' : 'var(--color-primary)',
                  color: user?.role === 'PROFESOR' ? 'var(--color-success)' : 'white'
                }}>
                  {user?.role ? getUserRoleDisplayName(user.role) : 'Usuario'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base-content">Información Personal</CardTitle>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "primary"}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>

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
              <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: 'var(--color-base-300)' }}>
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Nombre</label>
                  <p className="text-regular text-base-content">{user?.first_name}</p>
                </div>
                <div>
                  <label className="label">Apellido</label>
                  <p className="text-regular text-base-content">{user?.last_name}</p>
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <p className="text-regular text-base-content">{user?.email}</p>
              </div>
              <div>
                <label className="label">Usuario</label>
                <p className="text-regular text-base-content">@{user?.username}</p>
              </div>
              <div>
                <label className="label">Rol</label>
                <p className="text-regular text-base-content">{user?.role ? getUserRoleDisplayName(user.role) : 'Usuario'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
