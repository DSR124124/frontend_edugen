import React from 'react'
import { User } from '../../api/endpoints'
import { getUserRoleDisplayName, getInitials, formatDate } from '../../utils/helpers'
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
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--color-base-100)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ 
            backgroundColor: user.role === 'PROFESOR' ? 'var(--color-success-100)' : 'var(--color-primary)',
            color: user.role === 'PROFESOR' ? 'var(--color-success)' : 'var(--color-primary-content)'
          }}>
            {getInitials(user.first_name, user.last_name)}
          </div>
          <div>
            <h2 className="headline-xl" style={{ color: 'var(--color-base-content)' }}>
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-small" style={{ color: 'var(--color-base-content)' }}>@{user.username}</p>
          </div>
        </div>
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full" style={{
          backgroundColor: user.role === 'PROFESOR' ? 'var(--color-success-100)' : 'var(--color-primary)',
          color: user.role === 'PROFESOR' ? 'var(--color-success)' : 'var(--color-primary-content)'
        }}>
          {getUserRoleDisplayName(user.role)}
        </span>
      </div>

      {/* Información Personal */}
      <div className="mb-6">
        <h3 className="headline-xl mb-4" style={{ color: 'var(--color-base-content)' }}>Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre Completo</label>
                <p className="text-regular" style={{ color: 'var(--color-base-content)' }}>{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <label className="label">Nombre de Usuario</label>
                <p className="text-regular" style={{ color: 'var(--color-base-content)' }}>@{user.username}</p>
              </div>
              <div>
                <label className="label">Correo Electrónico</label>
                <p className="text-regular" style={{ color: 'var(--color-base-content)' }}>{user.email}</p>
              </div>
              <div>
                <label className="label">Rol</label>
                <p className="text-regular" style={{ color: 'var(--color-base-content)' }}>{getUserRoleDisplayName(user.role)}</p>
              </div>
              {user.role === 'PROFESOR' && user.specialty_display && (
                <div>
                  <label className="label">Especialidad</label>
                  <p className="text-regular" style={{ color: 'var(--color-base-content)' }}>{user.specialty_display}</p>
                </div>
              )}
              {user.institution && (
                <div>
                  <label className="label">Institución</label>
                  <p className="text-regular" style={{ color: 'var(--color-base-content)' }}>ID: {user.institution}</p>
                </div>
              )}
              <div>
                <label className="label">ID de Usuario</label>
                <p className="text-regular font-mono text-sm" style={{ color: 'var(--color-base-content)' }}>#{user.id}</p>
              </div>
              <div>
                <label className="label">Fecha de Registro</label>
                <p className="text-regular" style={{ color: 'var(--color-base-content)' }}>{formatDate(user.created_at)}</p>
              </div>
              <div>
                <label className="label">Estado</label>
                <p className="text-regular" style={{ color: 'var(--color-success)' }}>Activo</p>
              </div>
            </div>
          </div>


        {/* Secciones Asignadas para Profesores */}
        {user.role === 'PROFESOR' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="headline-xl" style={{ color: 'var(--color-base-content)' }}>Secciones Asignadas</h3>
              {user.assigned_sections && user.assigned_sections.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-success-100)' }}>
                    <svg className="w-4 h-4" style={{ color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                      {user.assigned_sections.length} {user.assigned_sections.length === 1 ? 'Sección' : 'Secciones'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {user.assigned_sections && user.assigned_sections.length > 0 ? (
              <div className="space-y-3">
                {user.assigned_sections.map((section, index) => (
                  <div key={section.id} className="group relative overflow-hidden rounded-lg border-2 transition-all duration-200 hover:shadow-md" style={{ 
                    backgroundColor: 'var(--color-base-100)', 
                    borderColor: 'var(--color-primary-200)',
                    borderLeftColor: 'var(--color-primary)',
                    borderLeftWidth: '4px'
                  }}>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-primary-100)' }}>
                              <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg" style={{ color: 'var(--color-base-content)' }}>
                                {section.name}
                              </h4>
                              <p className="text-sm" style={{ color: 'var(--color-base-content-70)' }}>
                                Sección #{index + 1}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" style={{ color: 'var(--color-base-content-70)' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium" style={{ color: 'var(--color-base-content)' }}>
                                Grado: {section.grade_level_name || 'Sin grado'}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" style={{ color: 'var(--color-base-content-70)' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium" style={{ color: 'var(--color-base-content)' }}>
                                Período: {section.term_name || 'Sin período'}
                              </span>
                            </div>
                          </div>
                          
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-1 px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-primary-100)' }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
                            <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                              Activa
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-lg" style={{ backgroundColor: 'var(--color-base-200)' }}>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-base-300)' }}>
                    <svg className="w-8 h-8" style={{ color: 'var(--color-base-content-70)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg" style={{ color: 'var(--color-base-content)' }}>
                      Sin secciones asignadas
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--color-base-content-70)' }}>
                      Este profesor no tiene secciones asignadas actualmente
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


      {/* Acciones */}
      {showActions && (
        <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: 'var(--color-base-300)' }}>
          <Button
            onClick={() => onEdit?.(user)}
            variant="outline"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Editar
          </Button>
          <Button
            onClick={() => onDelete?.(user)}
            variant="danger"
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
    </div>
  )
}
