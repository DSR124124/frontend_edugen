import { useState, useEffect } from 'react'
import { usePortfolios } from '../../hooks/usePortfolios'
import { Portfolio } from '../../api/endpoints'
import { 
  FiUser, 
  FiMail, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiX,
  FiFolder,
  FiEye
} from 'react-icons/fi'

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  username: string
  is_active: boolean
  enrolled_at: string
}

interface StudentProfileModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
  sectionId: number
}

export function StudentProfileModal({ isOpen, onClose, student, sectionId }: StudentProfileModalProps) {
  const { portfolios, loading: portfoliosLoading, error: portfoliosError, loadPortfoliosBySection } = usePortfolios()
  const [studentPortfolios, setStudentPortfolios] = useState<Portfolio[]>([])

  // Cargar portafolios cuando se abre el modal
  useEffect(() => {
    if (isOpen && sectionId) {
      loadPortfoliosBySection(sectionId)
    }
  }, [isOpen, sectionId, loadPortfoliosBySection])

  // Filtrar portafolios del estudiante específico
  useEffect(() => {
    if (student && portfolios) {
      const studentPorts = portfolios.filter(portfolio => portfolio.student === student.id)
      setStudentPortfolios(studentPorts)
    }
  }, [student, portfolios])

  if (!isOpen || !student) return null

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto" 
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        minHeight: '100vh', 
        minWidth: '100vw',
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Overlay */}
      <div
        className="fixed bg-black/60 backdrop-blur-md transition-opacity"
        style={{ 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100vw', 
          height: '100vh',
          minHeight: '100vh',
          minWidth: '100vw'
        }}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-base-100 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-base-300 relative z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiUser className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="headline-xl text-base-content">
                Perfil del Estudiante
              </h2>
              <p className="text-small text-base-content/70">
                {student.first_name} {student.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)] bg-base-100 rounded-b-xl">
          {/* Student Information */}
          <div className="mb-6">
            <h3 className="headline-lg text-base-content mb-4">Información Personal</h3>
            <div className="card p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiUser className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <label className="text-small font-medium text-base-content/70">Nombre Completo</label>
                    <p className="text-small text-base-content">{student.first_name} {student.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiUser className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <label className="text-small font-medium text-base-content/70">Usuario</label>
                    <p className="text-small text-base-content">@{student.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiMail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <label className="text-small font-medium text-base-content/70">Email</label>
                    <p className="text-small text-base-content">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    {student.is_active ? (
                      <FiCheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <FiXCircle className="w-4 h-4 text-error" />
                    )}
                  </div>
                  <div>
                    <label className="text-small font-medium text-base-content/70">Estado</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-extra-small font-medium ${
                      student.is_active 
                        ? 'bg-success-100 text-success' 
                        : 'bg-error-100 text-error'
                    }`}>
                      {student.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiClock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <label className="text-small font-medium text-base-content/70">Fecha de Matrícula</label>
                    <p className="text-small text-base-content">
                      {new Date(student.enrolled_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolios Section */}
          <div>
            <h3 className="headline-lg text-base-content mb-4">Portafolios</h3>
            
            {portfoliosLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-small text-base-content/70">Cargando portafolios...</p>
              </div>
            ) : portfoliosError ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="p-3 bg-error-100 rounded-full mb-4">
                  <FiXCircle className="w-6 h-6 text-error" />
                </div>
                <p className="text-small text-error">Error al cargar portafolios: {portfoliosError}</p>
              </div>
            ) : studentPortfolios.length > 0 ? (
              <div className="space-y-3">
                {studentPortfolios.map((portfolio) => (
                  <div key={portfolio.id} className="card p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-1.5 bg-primary-100 rounded-lg">
                            <FiFolder className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="headline-small text-base-content">
                            {portfolio.title}
                          </h4>
                        </div>
                        {portfolio.description && (
                          <p className="text-small text-base-content/70 mb-3">
                            {portfolio.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-small text-base-content/70 mb-2">
                          <span>Curso: {portfolio.courses?.[0]?.course_name || 'Sin curso'}</span>
                          <span>Sección: {portfolio.section_name}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-extra-small font-medium ${
                            portfolio.is_public 
                              ? 'bg-success-100 text-success' 
                              : 'bg-base-200 text-base-content/70'
                          }`}>
                            {portfolio.is_public ? 'Público' : 'Privado'}
                          </span>
                        </div>
                        <div className="text-extra-small text-base-content/50">
                          Creado: {new Date(portfolio.created_at).toLocaleDateString('es-ES')}
                          {portfolio.updated_at !== portfolio.created_at && (
                            <span> • Actualizado: {new Date(portfolio.updated_at).toLocaleDateString('es-ES')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="btn-secondary text-extra-small px-3 py-1 flex items-center space-x-1">
                          <FiEye className="w-3 h-3" />
                          <span>Ver Detalles</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-base-200 rounded-full">
                    <FiFolder className="w-6 h-6 text-base-content/40" />
                  </div>
                  <div>
                    <h3 className="headline-lg text-base-content mb-1">No hay portafolios creados</h3>
                    <p className="text-small text-base-content/70">
                      Este estudiante aún no ha creado ningún portafolio para esta sección
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-base-300 flex justify-end bg-base-100">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2"
          >
            Cerrar
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
