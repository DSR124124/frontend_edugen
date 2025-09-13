import { useState, useEffect } from 'react'
import { usePortfolios } from '../../hooks/usePortfolios'
import { Portfolio } from '../../api/endpoints'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Perfil del Estudiante
            </h2>
            <p className="text-sm text-gray-600">
              {student.first_name} {student.last_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Student Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p className="text-sm text-gray-900">{student.first_name} {student.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Usuario</label>
                  <p className="text-sm text-gray-900">@{student.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{student.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Matrícula</label>
                  <p className="text-sm text-gray-900">
                    {new Date(student.enrolled_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolios Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Portafolios</h3>
            
            {portfoliosLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando portafolios...</p>
              </div>
            ) : portfoliosError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error al cargar portafolios: {portfoliosError}</p>
              </div>
            ) : studentPortfolios.length > 0 ? (
              <div className="space-y-4">
                {studentPortfolios.map((portfolio) => (
                  <div key={portfolio.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {portfolio.title}
                        </h4>
                        {portfolio.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {portfolio.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Curso: {portfolio.courses?.[0]?.course_name || 'Sin curso'}</span>
                          <span>Sección: {portfolio.section_name}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            portfolio.is_public 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {portfolio.is_public ? 'Público' : 'Privado'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Creado: {new Date(portfolio.created_at).toLocaleDateString('es-ES')}
                          {portfolio.updated_at !== portfolio.created_at && (
                            <span> • Actualizado: {new Date(portfolio.updated_at).toLocaleDateString('es-ES')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Ver Detalles
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          Evaluar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-gray-400 text-4xl mb-4">📁</div>
                <p className="text-gray-500 text-lg">No hay portafolios creados</p>
                <p className="text-gray-400 text-sm">
                  Este estudiante aún no ha creado ningún portafolio para esta sección
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Crear Actividad
          </button>
        </div>
      </div>
    </div>
  )
}
