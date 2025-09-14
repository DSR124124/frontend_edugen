import { StudentClassroom } from '../../components/modals/StudentClassroom'
import { Users } from 'lucide-react'

export function MySection() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-50)' }}>
            <Users className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-base-content)' }}>
              Mi Sección
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-base-content)' }}>
              Visualiza tu sección asignada y conoce a tus compañeros de clase
            </p>
          </div>
        </div>
      </div>

      {/* Componente del Salón del Estudiante */}
      <StudentClassroom />
    </div>
  )
}
