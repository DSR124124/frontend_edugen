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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <FiBook className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="headline-2xl text-base-content">
            Dashboard del Profesor
          </h1>
          <p className="text-small text-base-content/70">
            Gestiona tus secciones y estudiantes
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FiBook className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-small font-medium text-base-content/70">Mis Secciones</p>
              <p className="text-2xl font-semibold text-base-content">{professorSections?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-small font-medium text-base-content/70">Estudiantes Activos</p>
              <p className="text-2xl font-semibold text-base-content">{activeStudents || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-secondary" />
            </div>
            <div className="ml-4">
              <p className="text-small font-medium text-base-content/70">Materiales</p>
              <p className="text-2xl font-semibold text-base-content">{materials?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones Asignadas */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-4">
          <FiBook className="w-5 h-5 text-primary" />
          <h2 className="headline-lg text-base-content">Mis Secciones Asignadas</h2>
        </div>
        
        {professorSections && professorSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professorSections.map((section) => (
              <div key={section.id} className="card p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-base-content">{section.name}</h3>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success">
                    <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                    Activa
                  </span>
                </div>
                <div className="space-y-2">
                  {section.course && (
                    <div className="flex items-center space-x-2">
                      <FiBook className="w-4 h-4 text-base-content/70" />
                      <span className="text-sm text-base-content/70">
                        <span className="font-medium">Curso:</span> {section.course.name}
                      </span>
                    </div>
                  )}
                  {section.grade_level && (
                    <div className="flex items-center space-x-2">
                      <FiAward className="w-4 h-4 text-base-content/70" />
                      <span className="text-sm text-base-content/70">
                        <span className="font-medium">Grado:</span> {section.grade_level.name}
                      </span>
                    </div>
                  )}
                  {section.term && (
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-base-content/70" />
                      <span className="text-sm text-base-content/70">
                        <span className="font-medium">Período:</span> {section.term.name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-4 h-4 text-base-content/70" />
                    <span className="text-sm text-base-content/70">
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
