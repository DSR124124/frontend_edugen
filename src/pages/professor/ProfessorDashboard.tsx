import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useProfessor } from '../../hooks/useProfessor'
import { useProfessorMaterials } from '../../hooks/useProfessorMaterials'
import { useActiveStudents } from '../../hooks/useActiveStudents'
import { KPICard } from '../../components/kpi/KPICard'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'

// Professor Dashboard Component

export function ProfessorDashboard() {
  const { loading: professorLoading, error: professorError } = useProfessor()
  const { sections: professorSections, loading: sectionsLoading, error: sectionsError } = useProfessorSections()
  const { data: materials, isLoading: materialsLoading, error: materialsError } = useProfessorMaterials()
  const { data: activeStudents, isLoading: studentsLoading, error: studentsError } = useActiveStudents()


  if (professorLoading || sectionsLoading || materialsLoading || studentsLoading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-base-content">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (professorError || sectionsError || materialsError || studentsError) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-error">Error: {professorError || sectionsError || materialsError?.message || studentsError?.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-base-200)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="headline-2xl text-base-content">Dashboard del Profesor</h1>
          <p className="text-base-content/70 mt-2">Gestiona tus secciones y estudiantes</p>
        </div>


        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Mis Secciones"
            value={professorSections?.length || 0}
            icon="📚"
            color="blue"
          />
          <KPICard
            title="Estudiantes Activos"
            value={activeStudents || 0}
            icon="👥"
            color="green"
          />
          <KPICard
            title="Materiales"
            value={materials?.length || 0}
            icon="📚"
            color="purple"
          />
        </div>

        {/* Secciones Asignadas */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base-content">Mis Secciones Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            {professorSections && professorSections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professorSections.map((section) => (
                  <div key={section.id} className="rounded-lg border-2 transition-all duration-200 hover:shadow-md p-4" style={{ borderColor: 'var(--color-base-300)' }}>
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
                          <svg className="w-4 h-4 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-sm text-base-content/70">
                            <span className="font-medium">Curso:</span> {section.course.name}
                          </span>
                        </div>
                      )}
                      {section.grade_level && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-base-content/70">
                            <span className="font-medium">Grado:</span> {section.grade_level.name}
                          </span>
                        </div>
                      )}
                      {section.term && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-base-content/70">
                            <span className="font-medium">Período:</span> {section.term.name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm text-base-content/70">
                          <span className="font-medium">Capacidad:</span> {section.capacity} estudiantes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-base-300 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-base-content text-lg font-medium mb-2">No tienes secciones asignadas</p>
                <p className="text-base-content/70">Contacta al director para que te asigne secciones</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
