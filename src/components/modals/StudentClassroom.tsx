import React from 'react'
import { 
  FiUsers,
  FiClock,
  FiAward,
  FiEye,
  FiUser,
  FiBook,
  FiCalendar
} from 'react-icons/fi'
import { ClassmatesModal } from './ClassmatesModal'
import { useClassmates, ClassmatesResponse, Classmate } from '../../hooks/useClassmates'
import { useAuthStore } from '../../store/auth'
import { EmptyState } from '../common'

interface StudentClassroomProps {
  className?: string
}

export function StudentClassroom({ className = '' }: StudentClassroomProps) {
  const { user } = useAuthStore()
  const [isClassmatesModalOpen, setIsClassmatesModalOpen] = React.useState(false)
  
  // Obtener compañeros de la sección
  const { data: classmatesData, isLoading: loadingClassmates } = useClassmates(user?.section?.id)

  if (!user?.section) {
    return (
      <div className={`card p-3 sm:p-4 ${className}`}>
        <EmptyState 
          title="No tienes un salón asignado"
          description="Contacta a tu administrador para que te asigne a un salón."
          icon={<FiUsers className="w-full h-full text-base-content/40" />}
        />
      </div>
    )
  }

  const section = user.section
  const totalClassmates = (classmatesData as ClassmatesResponse)?.total_students || 0
  const activeClassmates = (classmatesData as ClassmatesResponse)?.students?.filter((c: Classmate) => c.is_active).length || 0

  return (
    <>
      <div className={`card p-3 sm:p-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-base-content">Compañeros de Salón</h2>
        </div>

        {/* Información de la Sección */}
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200 mb-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-base sm:text-lg text-base-content truncate flex-1 min-w-0 mr-2">
              {section.name}
            </h3>
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success flex-shrink-0">
              <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
              Activo
            </span>
          </div>
          <div className="space-y-2">
            {section.course_name && (
              <div className="flex items-start space-x-2">
                <FiBook className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-base-content/70 truncate">
                  <span className="font-medium">Curso:</span> {section.course_name}
                </span>
              </div>
            )}
            {section.grade_level_name && (
              <div className="flex items-start space-x-2">
                <FiAward className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-base-content/70 truncate">
                  <span className="font-medium">Grado:</span> {section.grade_level_name}
                </span>
              </div>
            )}
            {section.term_name && (
              <div className="flex items-start space-x-2">
                <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/70 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-base-content/70 truncate">
                  <span className="font-medium">Período:</span> {section.term_name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-primary-100 rounded-lg flex-shrink-0">
                <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Total Estudiantes</p>
                <p className="text-xl sm:text-2xl font-semibold text-base-content">{totalClassmates}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-success-100 rounded-lg flex-shrink-0">
                <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Estudiantes Activos</p>
                <p className="text-xl sm:text-2xl font-semibold text-base-content">{activeClassmates}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-warning-100 rounded-lg flex-shrink-0">
                <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Estado</p>
                <p className="text-xl sm:text-2xl font-semibold text-base-content">Activo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para ver compañeros */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsClassmatesModalOpen(true)}
            className="btn btn-primary btn-sm flex items-center space-x-2"
          >
            <FiEye className="w-4 h-4" />
            <span>Ver Compañeros</span>
          </button>
        </div>
      </div>

      {/* Modal de Compañeros */}
      <ClassmatesModal
        isOpen={isClassmatesModalOpen}
        onClose={() => setIsClassmatesModalOpen(false)}
        classmates={(classmatesData as ClassmatesResponse)?.students || []}
        sectionName={(classmatesData as ClassmatesResponse)?.section?.name || user?.section?.name || ''}
        courseName={(classmatesData as ClassmatesResponse)?.section?.course_name || user?.section?.course_name}
        gradeLevel={(classmatesData as ClassmatesResponse)?.section?.grade_level_name || user?.section?.grade_level_name}
        termName={(classmatesData as ClassmatesResponse)?.section?.term_name || user?.section?.term_name}
        loading={loadingClassmates}
      />
    </>
  )
}
