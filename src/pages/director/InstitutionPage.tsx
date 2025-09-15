import { useState } from 'react'
import { useDirectorInstitution } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { Institution } from '../../api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'

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
    } catch (error) {
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error">Error al cargar la información de la institución</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  if (!institution) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/70">No se encontró información de la institución</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="headline-2xl text-base-content">Información de la Institución</h1>
        {!isEditing && (
          <Button
            onClick={handleEdit}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Editar Información
          </Button>
        )}
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base-content">Datos de la Institución</CardTitle>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre de la Institución"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Código"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </div>

              <Textarea
                label="Dirección"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                rows={3}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  disabled={updateInstitution.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  loading={updateInstitution.isPending}
                  disabled={updateInstitution.isPending}
                >
                  {updateInstitution.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label text-base-content/70">
                    Nombre de la Institución
                  </label>
                  <p className="text-large font-semibold text-base-content">{institution.name}</p>
                </div>

                <div>
                  <label className="label text-base-content/70">
                    Código
                  </label>
                  <p className="text-large font-semibold text-base-content">{institution.code}</p>
                </div>

                <div>
                  <label className="label text-base-content/70">
                    Teléfono
                  </label>
                  <p className="text-large text-base-content">{institution.phone || 'No especificado'}</p>
                </div>

                <div>
                  <label className="label text-base-content/70">
                    Email
                  </label>
                  <p className="text-large text-base-content">{institution.email || 'No especificado'}</p>
                </div>
              </div>

              <div>
                <label className="label text-base-content/70">
                  Dirección
                </label>
                <p className="text-large text-base-content">{institution.address || 'No especificada'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-base-300">
                <div>
                  <label className="label text-base-content/70">
                    Fecha de Creación
                  </label>
                  <p className="text-small text-base-content/70">
                    {new Date(institution.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="label text-base-content/70">
                    Última Actualización
                  </label>
                  <p className="text-small text-base-content/70">
                    {new Date(institution.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
