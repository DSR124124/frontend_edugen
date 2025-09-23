import { StudentClassroom } from '../../components/modals/StudentClassroom'
import { FiUsers } from 'react-icons/fi'

export function MySection() {

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
        <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
          <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
            Mi Sección
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Visualiza tu sección asignada y conoce a tus compañeros de clase
          </p>
        </div>
      </div>

      {/* Componente del Salón del Estudiante */}
      <StudentClassroom />
    </div>
  )
}
