import React from 'react'
import { User } from '../../api/endpoints'
import { getUserRoleDisplayName, getUserRoleColor, getInitials, formatDate } from '../../utils/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'

interface UserProfileProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  showActions?: boolean
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {getInitials(user.first_name, user.last_name)}
            </div>
            <div>
              <CardTitle className="text-xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <p className="text-gray-600">@{user.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUserRoleColor(user.role)}`}>
              {getUserRoleDisplayName(user.role)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información Personal */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
              <p className="text-gray-900">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre de Usuario</label>
              <p className="text-gray-900">@{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Rol</label>
              <p className="text-gray-900">{getUserRoleDisplayName(user.role)}</p>
            </div>
            {user.role === 'PROFESOR' && user.specialty_display && (
              <div>
                <label className="text-sm font-medium text-gray-500">Especialidad</label>
                <p className="text-gray-900">{user.specialty_display}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">ID de Usuario</label>
              <p className="text-gray-900 font-mono text-sm">#{user.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
              <p className="text-gray-900">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Información de Institución */}
        {user.institution && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Institucional</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Institución</label>
                <p className="text-gray-900">ID: {user.institution}</p>
              </div>
            </div>
          </div>
        )}

        {/* Secciones Asignadas para Profesores */}
        {user.role === 'PROFESOR' && user.assigned_sections && user.assigned_sections.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Secciones Asignadas</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2">
                {user.assigned_sections.map((section, index) => (
                  <div key={section.id} className="flex items-center justify-between bg-white rounded-md p-3 border border-blue-200">
                    <div>
                      <p className="font-medium text-gray-900">{section.name}</p>
                      <p className="text-sm text-gray-600">
                        {section.grade_level_name || 'Sin grado'} - {section.term_name || 'Sin período'}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Sección {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje si no hay secciones asignadas */}
        {user.role === 'PROFESOR' && (!user.assigned_sections || user.assigned_sections.length === 0) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Secciones Asignadas</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">No hay secciones asignadas</p>
            </div>
          </div>
        )}

        {/* Estadísticas del Usuario */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {user.role === 'PROFESOR' ? '0' : user.role === 'ALUMNO' ? '0' : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                {user.role === 'PROFESOR' ? 'Cursos' : user.role === 'ALUMNO' ? 'Calificaciones' : 'Usuarios'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-500">Actividades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-500">Proyectos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-gray-500">Activo</div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onEdit?.(user)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => onDelete?.(user)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            >
              Eliminar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
