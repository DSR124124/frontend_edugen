import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useNavigate } from 'react-router-dom'
import { 
  FiUsers, 
  FiBook, 
  FiCalendar, 
  FiAward, 
  FiEye,
  FiUser,
  FiInfo,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'

interface Section {
  id: number
  name: string
  capacity: number
  course?: { name: string; code: string }
  grade_level?: { name: string }
  term?: { name: string; is_active: boolean }
}

export function MySections() {
  const { sections, loading, error, loadSections } = useProfessorSections()
  const navigate = useNavigate()

  const handleViewStudents = (sectionId: number) => {
    navigate(`/professor/students?section=${sectionId}`)
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-small text-base-content/70">Cargando secciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="p-3 bg-error-100 rounded-full mb-4">
          <FiAlertCircle className="w-6 h-6 text-error" />
        </div>
        <h3 className="headline-xl text-base-content mb-2">Error al cargar</h3>
        <p className="text-small text-base-content/70 mb-4">{error}</p>
        <button
          onClick={loadSections}
          className="btn-primary flex items-center space-x-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Reintentar</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <FiUsers className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="headline-2xl text-base-content">
            Mis Secciones
          </h1>
          <p className="text-small text-base-content/70">
            Gestiona las secciones que tienes asignadas
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="card p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FiCheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-small font-medium text-base-content/70">Total Secciones</p>
            <p className="headline-xl text-base-content">{sections?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections && sections.length > 0 ? sections.map((section: Section) => (
          <div key={section.id} className="card hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiUsers className="w-4 h-4 text-primary" />
                </div>
                <h3 className="headline-xl text-base-content">
                  {section.name}
                </h3>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-extra-small font-medium bg-success-100 text-success">
                <FiCheckCircle className="w-3 h-3 mr-1" />
                Activa
              </span>
            </div>
            
            <div className="space-y-2">
              {section.course && (
                <div className="flex items-center space-x-2 text-small text-base-content/70">
                  <FiBook className="w-3 h-3 text-primary" />
                  <div>
                    <span><strong>Curso:</strong> {section.course.name}</span>
                    <p className="text-extra-small text-base-content/50">Código: {section.course.code}</p>
                  </div>
                </div>
              )}
              
              {section.grade_level && (
                <div className="flex items-center space-x-2 text-small text-base-content/70">
                  <FiAward className="w-3 h-3 text-primary" />
                  <span><strong>Grado:</strong> {section.grade_level.name}</span>
                </div>
              )}
              
              {section.term && (
                <div className="flex items-center space-x-2 text-small text-base-content/70">
                  <FiCalendar className="w-3 h-3 text-primary" />
                  <div>
                    <span><strong>Período:</strong> {section.term.name}</span>
                    <p className="text-extra-small text-base-content/50">
                      {section.term.is_active ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-small text-base-content/70">
                <FiUser className="w-3 h-3 text-primary" />
                <span><strong>Capacidad:</strong> {section.capacity} estudiantes</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-base-300">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewStudents(section.id)}
                  className="flex-1 btn-primary text-small px-3 py-2 flex items-center justify-center space-x-1"
                >
                  <FiUsers className="w-3 h-3" />
                  <span>Ver Estudiantes</span>
                </button>
                <button className="flex-1 btn-secondary text-small px-3 py-2 flex items-center justify-center space-x-1">
                  <FiEye className="w-3 h-3" />
                  <span>Ver Detalles</span>
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full">
            <div className="card text-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-base-200 rounded-full">
                  <FiInfo className="w-6 h-6 text-base-content/40" />
                </div>
                <div>
                  <h3 className="headline-xl text-base-content mb-1">
                    No tienes secciones asignadas
                  </h3>
                  <p className="text-small text-base-content/70">
                    Contacta al director para que te asigne secciones
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
