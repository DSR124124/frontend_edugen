import React from 'react'
import { Users, Clock, Award, Eye, User } from 'lucide-react'
import { ClassmatesModal } from './ClassmatesModal'
import { useClassmates, ClassmatesResponse, Classmate } from '../../hooks/useClassmates'
import { useAuthStore } from '../../store/auth'

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
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes un salón asignado</h2>
          <p className="text-gray-600">
            Contacta a tu administrador para que te asigne a un salón.
          </p>
        </div>
      </div>
    )
  }

  const section = user.section
  const totalClassmates = (classmatesData as ClassmatesResponse)?.total_students || 0
  const activeClassmates = (classmatesData as ClassmatesResponse)?.students?.filter((c: Classmate) => c.is_active).length || 0

  return (
    <>
      <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
        {/* Header con botón */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-100)' }}>
              <Users className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold text-base" style={{ color: 'var(--color-base-content)' }}>
                {section.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-base-content)' }}>
                {section.grade_level_name} • {section.term_name}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsClassmatesModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-colors text-sm"
            style={{
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-100)',
              border: '1px solid var(--color-primary-200)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-200)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-100)'
            }}
          >
            <Eye className="w-4 h-4" />
            <span>Ver Compañeros</span>
          </button>
        </div>

        {/* Estadísticas compactas */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Total de Estudiantes */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary-50)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--color-primary-100)' }}>
              <Users className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>
              {totalClassmates}
            </h4>
            <p className="text-xs font-medium" style={{ color: 'var(--color-primary-700)' }}>
              Total
            </p>
          </div>
          
          {/* Estudiantes Activos */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-success-50)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--color-success-100)' }}>
              <User className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
            </div>
            <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--color-success)' }}>
              {activeClassmates}
            </h4>
            <p className="text-xs font-medium" style={{ color: 'var(--color-success-700)' }}>
              Activos
            </p>
          </div>
          
          {/* Estado del Salón */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-warning-50)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--color-warning-100)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
            </div>
            <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--color-warning)' }}>
              ✓
            </h4>
            <p className="text-xs font-medium" style={{ color: 'var(--color-warning-700)' }}>
              Activo
            </p>
          </div>
        </div>

        {/* Información compacta */}
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-base-100)' }}>
          <div className="flex items-center space-x-2 mb-1">
            <Award className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-base-content)' }}>
              Información
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-base-content)' }}>
            Accede a materiales, actividades e interactúa con tus compañeros.
          </p>
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
