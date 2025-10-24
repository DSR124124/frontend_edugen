import { StudentClassroom } from '../../components/modals/StudentClassroom'
import { Users, Sparkles } from 'lucide-react'

export function MySection() {
  return (
    <div className="space-y-3 sm:space-y-4 min-h-0" data-tour="my-section-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6" data-tour="my-section-header">
        <div className="flex items-center p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Mi Sección</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Visualiza tu sección asignada y conoce a tus compañeros de clase
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Componente del Salón del Estudiante */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm" data-tour="my-section-content">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Aula Virtual</h2>
              <p className="text-xs sm:text-sm text-gray-600">Interactúa con tu sección y compañeros</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <StudentClassroom />
        </div>
      </div>
    </div>
  )
}
