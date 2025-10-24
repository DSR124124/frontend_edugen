import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useStudentsBySection } from '../../hooks/useStudentsBySection'
import { StudentProfileModal } from '../../components/modals/StudentProfileModal'
import { 
  FiUsers, 
  FiBook, 
  FiAward, 
  FiCalendar, 
  FiMail,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye
} from 'react-icons/fi'
import { LoadingState, ErrorState, EmptyState } from '../../components/common'

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  username: string
  is_active: boolean
  enrolled_at: string
}

export function MyStudents() {
  const [searchParams] = useSearchParams()
  const { sections: professorSections, loading: sectionsLoading } = useProfessorSections()
  const { data: studentsData, loading: studentsLoading, error: studentsError, getStudentsBySection } = useStudentsBySection()
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // Cargar estudiantes cuando se selecciona una sección
  useEffect(() => {
    if (selectedSectionId) {
      getStudentsBySection(selectedSectionId)
    }
  }, [selectedSectionId, getStudentsBySection])

  // Seleccionar sección desde URL o primera sección por defecto
  useEffect(() => {
    if (professorSections && professorSections.length > 0 && !selectedSectionId) {
      const sectionFromUrl = searchParams.get('section')
      if (sectionFromUrl) {
        const sectionId = parseInt(sectionFromUrl, 10)
        // Verificar que la sección existe en las secciones del profesor
        const sectionExists = professorSections.some(section => section.id === sectionId)
        if (sectionExists) {
          setSelectedSectionId(sectionId)
        } else {
          // Si la sección no existe, seleccionar la primera disponible
          setSelectedSectionId(professorSections[0].id)
        }
      } else {
        // Si no hay parámetro en URL, seleccionar la primera sección
        setSelectedSectionId(professorSections[0].id)
      }
    }
  }, [professorSections, selectedSectionId, searchParams])

  // Función para abrir el perfil del estudiante
  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student)
    setIsProfileModalOpen(true)
  }

  // Función para cerrar el modal
  const handleCloseProfile = () => {
    setIsProfileModalOpen(false)
    setSelectedStudent(null)
  }

  if (sectionsLoading) {
    return <LoadingState message="Cargando secciones..." />
  }

  if (studentsError) {
    return (
      <ErrorState 
        error={studentsError}
        onRetry={() => selectedSectionId && getStudentsBySection(selectedSectionId)}
        retryLabel="Reintentar"
      />
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4" data-tour="students-page">
      {/* Header */}
      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4" data-tour="students-header">
        <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
          <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
            Mis Estudiantes
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Gestiona los estudiantes de tus secciones
          </p>
        </div>
      </div>

      {/* Section Selector */}
      {professorSections && professorSections.length > 0 && (
        <div className="card p-3 sm:p-4 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-base-content mb-3">Seleccionar Sección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {professorSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`p-3 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-sm active:scale-95 ${
                  selectedSectionId === section.id
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-base-300 hover:border-primary/50 hover:bg-base-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <FiUsers className="w-4 h-4 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base truncate">{section.name}</h3>
                </div>
                {section.course && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-base-content/70">
                    <FiBook className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{section.course.name}</span>
                  </div>
                )}
                {section.grade_level && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-base-content/70">
                    <FiAward className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{section.grade_level.name}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Section Info and Stats */}
      {studentsData && (
        <div className="card p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-base-content mb-2 truncate">
                {studentsData.section.name}
              </h2>
              <div className="space-y-2">
                {studentsData.section.course_name && (
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-base-content/70">
                    <FiBook className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="truncate"><strong>Curso:</strong> {studentsData.section.course_name}</span>
                  </div>
                )}
                {studentsData.section.grade_level_name && (
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-base-content/70">
                    <FiAward className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="truncate"><strong>Grado:</strong> {studentsData.section.grade_level_name}</span>
                  </div>
                )}
                {studentsData.section.term_name && (
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-base-content/70">
                    <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="truncate"><strong>Período:</strong> {studentsData.section.term_name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="p-2 bg-success-100 rounded-lg">
                <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-base-content/70">Total Estudiantes</p>
                <p className="text-xl sm:text-2xl font-bold text-base-content">{studentsData.total_students}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="card" data-tour="students-content">
        <div className="p-3 sm:p-4 border-b border-base-300">
          <h2 className="text-lg sm:text-xl font-bold text-base-content">Lista de Estudiantes</h2>
        </div>

        <div className="p-3 sm:p-4">
          {studentsLoading ? (
            <LoadingState message="Cargando estudiantes..." />
          ) : studentsData && studentsData.students.length > 0 ? (
            <>
              {/* Mobile Cards View */}
              <div className="block sm:hidden space-y-3">
                {studentsData.students.map((student) => (
                  <div key={student.id} className="p-3 border border-base-300 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base text-base-content truncate">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-xs text-base-content/70 truncate">@{student.username}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        student.is_active 
                          ? 'bg-success-100 text-success' 
                          : 'bg-error-100 text-error'
                      }`}>
                        {student.is_active ? (
                          <>
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <FiXCircle className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2 text-xs text-base-content/70">
                        <FiMail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-base-content/70">
                        <FiClock className="w-3 h-3 flex-shrink-0" />
                        <span>Matriculado: {new Date(student.enrolled_at).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleViewProfile(student)}
                      className="btn-primary btn-sm w-full flex items-center justify-center space-x-2"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Ver Perfil</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-base-300">
                  <thead className="bg-base-100">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-base-content/70 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-base-content/70 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-base-content/70 uppercase tracking-wider">
                        Fecha de Matrícula
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-base-content/70 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-base-content/70 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-base-content/5 divide-y divide-base-300">
                    {studentsData.students.map((student) => (
                      <tr key={student.id} className="hover:bg-base-content/10 transition-colors">
                        <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-medium text-primary">
                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-medium text-base-content">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-xs text-base-content/70">
                                @{student.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-base-content/70">
                            <FiMail className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-base-content/70">
                            <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{new Date(student.enrolled_at).toLocaleDateString('es-ES')}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            student.is_active 
                              ? 'bg-success-100 text-success' 
                              : 'bg-error-100 text-error'
                          }`}>
                            {student.is_active ? (
                              <>
                                <FiCheckCircle className="w-3 h-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <FiXCircle className="w-3 h-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewProfile(student)}
                            className="btn-primary btn-sm flex items-center space-x-1"
                          >
                            <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Ver Perfil</span>
                            <span className="sm:hidden">Ver</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState 
              title={!selectedSectionId 
                ? 'Selecciona una sección para ver los estudiantes'
                : 'No hay estudiantes matriculados en esta sección'
              }
              description={!selectedSectionId 
                ? 'Elige una sección de la lista superior'
                : 'Los estudiantes aparecerán aquí cuando se matriculen'
              }
            />
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
        student={selectedStudent}
        sectionId={selectedSectionId || 0}
      />
    </div>
  )
}
