import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useProfessor } from '../../hooks/useProfessor'
import { useProfessorMaterials } from '../../hooks/useProfessorMaterials'
import { useActiveStudents } from '../../hooks/useActiveStudents'
import { 
  FiBook,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiAward
} from 'react-icons/fi'
import { PageLoadingState, PageErrorState, EmptyState } from '../../components/common'

// Professor Dashboard Component

export function ProfessorDashboard() {
  const { loading: professorLoading, error: professorError } = useProfessor()
  const { sections: professorSections, loading: sectionsLoading, error: sectionsError } = useProfessorSections()
  const { data: materials, isLoading: materialsLoading, error: materialsError } = useProfessorMaterials()
  const { data: activeStudents, isLoading: studentsLoading, error: studentsError } = useActiveStudents()


  if (professorLoading || sectionsLoading || materialsLoading || studentsLoading) {
    return <PageLoadingState message="Cargando dashboard del profesor..." />
  }

  if (professorError || sectionsError || materialsError || studentsError) {
    return (
      <PageErrorState 
        error={professorError || sectionsError || materialsError?.message || studentsError?.message || 'Error desconocido'}
        onRetry={() => window.location.reload()}
        onHome={() => window.location.href = '/dashboard'}
      />
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4" data-tour="professor-dashboard">
      {/* Header */}
      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
        <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
          <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
            Dashboard del Profesor
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Gestiona tus secciones y estudiantes
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-primary-100 rounded-lg flex-shrink-0">
              <FiBook className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Mis Secciones</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{professorSections?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-success-100 rounded-lg flex-shrink-0">
              <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Estudiantes Activos</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{activeStudents || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-secondary-100 rounded-lg flex-shrink-0">
              <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Materiales</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{materials?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones Asignadas */}
      <div className="card p-3 sm:p-4">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-base-content">Mis Secciones Asignadas</h2>
        </div>
        
        {professorSections && professorSections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {professorSections.map((section) => (
              <div key={section.id} className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200 active:scale-95">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-base sm:text-lg text-base-content truncate flex-1 min-w-0 mr-2">{section.name}</h3>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success flex-shrink-0">
                    <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                    Activa
                  </span>
                </div>
                <div className="space-y-2">
                  {section.course && (
                    <div className="flex items-start space-x-2">
                      <FiBook className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-base-content/70 truncate">
                        <span className="font-medium">Curso:</span> {section.course.name}
                      </span>
                    </div>
                  )}
                  {section.grade_level && (
                    <div className="flex items-start space-x-2">
                      <FiAward className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-base-content/70 truncate">
                        <span className="font-medium">Grado:</span> {section.grade_level.name}
                      </span>
                    </div>
                  )}
                  {section.term && (
                    <div className="flex items-start space-x-2">
                      <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-base-content/70 truncate">
                        <span className="font-medium">Período:</span> {section.term.name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-base-content/70">
                      <span className="font-medium">Capacidad:</span> {section.capacity} estudiantes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No tienes secciones asignadas"
            description="Contacta al director para que te asigne secciones. Una vez asignado, podrás gestionar tus estudiantes y materiales."
            icon={<FiBook className="w-full h-full text-base-content/40" />}
          />
        )}
      </div>
    </div>
  )
}
