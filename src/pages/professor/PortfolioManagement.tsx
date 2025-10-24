import { useState, useEffect } from 'react'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { usePortfolios } from '../../hooks/usePortfolios'
import { Portfolio, academicApi, Material } from '../../api/endpoints'
import { PortfolioDetailModal } from '../../components/modals/PortfolioDetailModal'
import { 
  Users, 
  Book, 
  Award, 
  Calendar, 
  Folder,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Filter,
  FileText,
  Sparkles
} from 'lucide-react'
import { LoadingState, ErrorState, EmptyState } from '../../components/common'

export function PortfolioManagement() {
  const { sections: professorSections, loading: sectionsLoading } = useProfessorSections()
  const { portfolios, loading: portfoliosLoading, error: portfoliosError, loadPortfoliosBySection } = usePortfolios()
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'private'>('all')
  const [materialCounts, setMaterialCounts] = useState<Record<number, number>>({})
  const [loadingCounts, setLoadingCounts] = useState(false)

  // Cargar portafolios cuando se selecciona una sección
  useEffect(() => {
    if (selectedSectionId) {
      loadPortfoliosBySection(selectedSectionId)
    }
  }, [selectedSectionId, loadPortfoliosBySection])

  // Cargar contadores de materiales cuando se cargan los portafolios
  useEffect(() => {
    if (portfolios && portfolios.length > 0) {
      const loadMaterialCounts = async () => {
        setLoadingCounts(true)
        const counts: Record<number, number> = {}
        
        for (const portfolio of portfolios) {
          try {
            let totalMaterials = 0
            
            // Verificar que el portafolio tenga cursos
            if (portfolio.courses && Array.isArray(portfolio.courses)) {
              // Obtener materiales de todos los cursos del portafolio
              for (const course of portfolio.courses) {
                // Verificar que el curso tenga temas
                if (course.topics && Array.isArray(course.topics)) {
                  for (const topic of course.topics) {
                    try {
                      const response = await academicApi.getMaterialsByTopic(topic.id)
                      // Asegurar que obtenemos el array correcto de materiales
                      let materials: Material[] = []
                      if (response.data) {
                        materials = Array.isArray(response.data) ? response.data : response.data?.results || []
                      }
                      
                      // Filtrar materiales accesibles para este estudiante:
                      // 1. Materiales compartidos (is_shared = true)
                      // 2. Materiales personalizados asignados a este estudiante específico
                      const accessibleMaterials = materials.filter(material => {
                        return material.is_shared || 
                               (material.assigned_students && material.assigned_students.includes(portfolio.student))
                      })
                      
                      totalMaterials += accessibleMaterials.length
                    } catch (error) {
                      console.error(`Error loading materials for topic ${topic.id}:`, error)
                      // No incrementar el contador si hay error
                    }
                  }
                }
              }
            }
            
            counts[portfolio.id] = totalMaterials
          } catch (error) {
            console.error(`Error loading material count for portfolio ${portfolio.id}:`, error)
            counts[portfolio.id] = 0
          }
        }
        
        setMaterialCounts(counts)
        setLoadingCounts(false)
      }
      
      loadMaterialCounts()
    } else {
      // Si no hay portafolios, limpiar los contadores
      setMaterialCounts({})
      setLoadingCounts(false)
    }
  }, [portfolios])

  // Seleccionar primera sección por defecto
  useEffect(() => {
    if (professorSections && professorSections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(professorSections[0].id)
    }
  }, [professorSections, selectedSectionId])

  // Filtrar portafolios
  const filteredPortfolios = portfolios?.filter((portfolio) => {
    const matchesSearch = portfolio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.section_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'public' && portfolio.is_public) ||
                         (filterStatus === 'private' && !portfolio.is_public)
    
    return matchesSearch && matchesStatus
  }) || []


  if (sectionsLoading) {
    return <LoadingState message="Cargando secciones..." />
  }

  if (!professorSections || professorSections.length === 0) {
    return (
      <EmptyState 
        title="No tienes secciones asignadas"
        description="Contacta al director para que te asigne secciones."
        icon={<Users className="w-full h-full text-base-content/40" />}
      />
    )
  }

  return (
    <div className="space-y-3" data-tour="portfolios-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6" data-tour="portfolios-header">
        <div className="flex items-center p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Gestión de Portafolios</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Revisa y gestiona los portafolios de tus estudiantes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Selector */}
      <div className="card p-3 mb-3">
        <h2 className="headline-lg text-base-content mb-2">Seleccionar Sección</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {professorSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSectionId(section.id)}
              className={`p-2 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-sm ${
                selectedSectionId === section.id
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-base-300 hover:border-primary/50 hover:bg-base-50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4" />
                <h3 className="headline-small font-medium">Salón {section.name}</h3>
              </div>
              <div className="space-y-1">
                {section.grade_level && (
                  <div className="flex items-center space-x-1 text-small text-base-content/70">
                    <Award className="w-3 h-3" />
                    <span>{section.grade_level.name}</span>
                  </div>
                )}
                {section.term && (
                  <div className="flex items-center space-x-1 text-small text-base-content/70">
                    <Calendar className="w-3 h-3" />
                    <span>{section.term.name}</span>
                  </div>
                )}
                {section.course && (
                  <div className="flex items-center space-x-1 text-small text-primary">
                    <Book className="w-3 h-3" />
                    <span className="font-medium">{section.course.name}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter Controls */}
      {selectedSectionId && (
        <div className="card p-3 mb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Buscar portafolios por título, estudiante o sección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-base-300 rounded-lg text-small focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-base-content/40" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'public' | 'private')}
                className="px-3 py-2 border border-base-300 rounded-lg text-small focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="public">Públicos</option>
                <option value="private">Privados</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Portfolios List */}
      {selectedSectionId && (
        <div className="card">
          <div className="p-3 border-b border-base-300">
            <div className="flex items-center justify-between">
              <h2 className="headline-lg text-base-content">
                Portafolios de la Sección
              </h2>
              <div className="text-small text-base-content/70">
                {filteredPortfolios.length} de {portfolios.length} portafolio{portfolios.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="p-3" data-tour="portfolios-content">
            {portfoliosLoading ? (
              <LoadingState message="Cargando portafolios..." />
            ) : portfoliosError ? (
              <ErrorState 
                error={portfoliosError}
                onRetry={() => selectedSectionId && loadPortfoliosBySection(selectedSectionId)}
                retryLabel="Reintentar"
              />
            ) : portfolios.length === 0 ? (
              <EmptyState 
                title="No hay portafolios"
                description="Los portafolios se crearán automáticamente cuando asignes actividades a los estudiantes."
                icon={<Folder className="w-full h-full text-base-content/40" />}
              />
            ) : filteredPortfolios.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-base-200 rounded-full">
                    <Search className="w-5 h-5 text-base-content/40" />
                  </div>
                  <div>
                    <h3 className="headline-lg text-base-content mb-1">No se encontraron portafolios</h3>
                    <p className="text-small text-base-content/70">
                      Intenta ajustar los filtros de búsqueda.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPortfolios
                  .filter((portfolio, index, self) => 
                    // Eliminar portafolios duplicados basado en el ID
                    index === self.findIndex(p => p.id === portfolio.id)
                  )
                  .map((portfolio) => (
                  <div key={portfolio.id} className="card p-3 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-1 bg-primary-100 rounded-lg">
                            <Folder className="w-3 h-3 text-primary" />
                          </div>
                          <h3 className="headline-small text-base-content">
                            {portfolio.title}
                          </h3>
                          {portfolio.is_public && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-extra-small font-medium bg-success-100 text-success">
                              <CheckCircle className="w-2 h-2 mr-1" />
                              Público
                            </span>
                          )}
                        </div>
                        {portfolio.courses && portfolio.courses.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {portfolio.courses
                                .filter((course, index, self) => 
                                  index === self.findIndex(c => c.id === course.id)
                                )
                                .map((course) => (
                                <span
                                  key={course.id}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-extra-small font-medium bg-primary-100 text-primary"
                                >
                                  <Book className="w-2 h-2 mr-1" />
                                  {course.course_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {portfolio.description && (
                          <p className="text-small text-base-content/70 mb-2">
                            {portfolio.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 text-small text-base-content/70 mb-2">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-blue-600" />
                            {loadingCounts ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                                <span className="text-blue-600">Cargando...</span>
                              </div>
                            ) : (
                              <span className="font-medium text-blue-700">
                                {materialCounts[portfolio.id] !== undefined ? materialCounts[portfolio.id] : 0} materiales
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(portfolio.created_at).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={() => setSelectedPortfolio(portfolio)}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center space-x-1 text-sm font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Detalles</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Detail Modal */}
      <PortfolioDetailModal
        isOpen={!!selectedPortfolio}
        onClose={() => setSelectedPortfolio(null)}
        portfolio={selectedPortfolio}
      />
    </div>
  )
}
