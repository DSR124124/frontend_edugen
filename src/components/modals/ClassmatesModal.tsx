import { X, Users, Mail, Calendar } from 'lucide-react'
import { Classmate } from '../../hooks/useClassmates'

interface ClassmatesModalProps {
  isOpen: boolean
  onClose: () => void
  classmates: Classmate[]
  sectionName: string
  courseName?: string
  gradeLevel?: string
  termName?: string
  loading?: boolean
}

export function ClassmatesModal({
  isOpen,
  onClose,
  classmates,
  sectionName,
  courseName,
  gradeLevel,
  termName,
  loading = false
}: ClassmatesModalProps) {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-base-300)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-100)' }}>
                <Users className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-base-content)' }}>
                  Compañeros de Salón
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
                  {sectionName}
                  {courseName && ` • ${courseName}`}
                  {gradeLevel && ` • ${gradeLevel}`}
                  {termName && ` • ${termName}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md transition-colors"
              style={{
                color: 'var(--color-base-content)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-base-200)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
                <span className="ml-3" style={{ color: 'var(--color-base-content)' }}>Cargando compañeros...</span>
              </div>
            ) : classmates.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-base-300)' }} />
                <p style={{ color: 'var(--color-base-content)' }}>No hay compañeros registrados en esta sección</p>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-primary-50)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-primary-700)' }}>
                        Total de estudiantes
                      </p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                        {classmates.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ color: 'var(--color-primary-600)' }}>
                        Estudiantes activos
                      </p>
                      <p className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {classmates.filter(c => c.is_active).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Classmates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classmates.map((classmate) => (
                    <div
                      key={classmate.id}
                      className="p-4 rounded-lg border transition-all hover:shadow-md"
                      style={{
                        borderColor: 'var(--color-base-300)',
                        backgroundColor: 'var(--color-base-100)'
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Avatar */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          {getInitials(classmate.first_name, classmate.last_name)}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate" style={{ color: 'var(--color-base-content)' }}>
                            {classmate.first_name} {classmate.last_name}
                          </h3>
                          <p className="text-sm truncate" style={{ color: 'var(--color-base-content)' }}>
                            @{classmate.username}
                          </p>
                          
                          {/* Email */}
                          <div className="flex items-center mt-2 space-x-2">
                            <Mail className="w-3 h-3" style={{ color: 'var(--color-base-content)' }} />
                            <span className="text-xs truncate" style={{ color: 'var(--color-base-content)' }}>
                              {classmate.email}
                            </span>
                          </div>
                          
                          {/* Enrollment Date */}
                          <div className="flex items-center mt-1 space-x-2">
                            <Calendar className="w-3 h-3" style={{ color: 'var(--color-base-content)' }} />
                            <span className="text-xs" style={{ color: 'var(--color-base-content)' }}>
                              {formatDate(classmate.enrolled_at)}
                            </span>
                          </div>
                          
                          {/* Status */}
                          <div className="mt-2">
                            <span 
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                classmate.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {classmate.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t" style={{ borderColor: 'var(--color-base-300)' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium transition-colors"
              style={{
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-100)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-200)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-100)'}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
