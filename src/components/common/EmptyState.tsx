import { FiInbox, FiPlus, FiSearch, FiBook, FiUsers, FiFileText, FiAward, FiCalendar } from 'react-icons/fi'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({ 
  icon,
  title,
  description,
  action,
  className = "",
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const defaultIcon = <FiInbox className={`w-full h-full text-base-content/40`} />

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className={`p-3 bg-base-200 rounded-full mb-4 ${sizeClasses[size]}`}>
        {icon || defaultIcon}
      </div>
      
      <h3 className={`headline-xl text-base-content mb-2 ${textSizeClasses[size]}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`text-base-content/70 mb-6 max-w-md ${textSizeClasses[size]}`}>
          {description}
        </p>
      )}

      {action && (
        <button 
          onClick={action.onClick}
          className={`btn btn-${action.variant || 'primary'} flex items-center space-x-2`}
        >
          <FiPlus className="w-4 h-4" />
          <span>{action.label}</span>
        </button>
      )}
    </div>
  )
}

// Variantes específicas para casos comunes
export function EmptyDataState({ 
  title = "No hay datos disponibles",
  description = "No se encontraron elementos para mostrar",
  action
}: {
  title?: string
  description?: string
  action?: EmptyStateProps['action']
}) {
  return (
    <EmptyState 
      title={title}
      description={description}
      action={action}
      icon={<FiInbox className="w-full h-full text-base-content/40" />}
    />
  )
}

export function EmptySearchState({ 
  searchTerm,
  onClearSearch
}: {
  searchTerm?: string
  onClearSearch?: () => void
}) {
  return (
    <EmptyState 
      title="No se encontraron resultados"
      description={searchTerm ? `No hay resultados para "${searchTerm}"` : "Intenta con otros términos de búsqueda"}
      action={onClearSearch ? {
        label: "Limpiar búsqueda",
        onClick: onClearSearch,
        variant: "outline"
      } : undefined}
      icon={<FiSearch className="w-full h-full text-base-content/40" />}
    />
  )
}

export function EmptyStudentsState({ 
  onAddStudent
}: {
  onAddStudent?: () => void
}) {
  return (
    <EmptyState 
      title="No hay estudiantes"
      description="Aún no se han registrado estudiantes en esta sección"
      action={onAddStudent ? {
        label: "Agregar estudiante",
        onClick: onAddStudent,
        variant: "primary"
      } : undefined}
      icon={<FiUsers className="w-full h-full text-base-content/40" />}
    />
  )
}

export function EmptyMaterialsState({ 
  onAddMaterial
}: {
  onAddMaterial?: () => void
}) {
  return (
    <EmptyState 
      title="No hay materiales"
      description="Aún no se han agregado materiales para este tema"
      action={onAddMaterial ? {
        label: "Agregar material",
        onClick: onAddMaterial,
        variant: "primary"
      } : undefined}
      icon={<FiFileText className="w-full h-full text-base-content/40" />}
    />
  )
}

export function EmptyCoursesState({ 
  onAddCourse
}: {
  onAddCourse?: () => void
}) {
  return (
    <EmptyState 
      title="No hay cursos"
      description="Aún no se han creado cursos"
      action={onAddCourse ? {
        label: "Crear curso",
        onClick: onAddCourse,
        variant: "primary"
      } : undefined}
      icon={<FiBook className="w-full h-full text-base-content/40" />}
    />
  )
}

export function EmptyProfessorsState({ 
  onAddProfessor
}: {
  onAddProfessor?: () => void
}) {
  return (
    <EmptyState 
      title="No hay profesores"
      description="Aún no se han registrado profesores en la institución"
      action={onAddProfessor ? {
        label: "Agregar profesor",
        onClick: onAddProfessor,
        variant: "primary"
      } : undefined}
      icon={<FiUsers className="w-full h-full text-base-content/40" />}
    />
  )
}

export function EmptySectionsState({ 
  onAddSection
}: {
  onAddSection?: () => void
}) {
  return (
    <EmptyState 
      title="No hay secciones"
      description="Aún no se han creado secciones"
      action={onAddSection ? {
        label: "Crear sección",
        onClick: onAddSection,
        variant: "primary"
      } : undefined}
      icon={<FiUsers className="w-full h-full text-base-content/40" />}
    />
  )
}

export function EmptyGradeLevelsState({ 
  onAddGradeLevel
}: {
  onAddGradeLevel?: () => void
}) {
  return (
    <EmptyState 
      title="No hay grados"
      description="Aún no se han creado grados"
      action={onAddGradeLevel ? {
        label: "Crear grado",
        onClick: onAddGradeLevel,
        variant: "primary"
      } : undefined}
      icon={<FiAward className="w-full h-full text-base-content/40" />}
    />
  )
}

export function EmptyTermsState({ 
  onAddTerm
}: {
  onAddTerm?: () => void
}) {
  return (
    <EmptyState 
      title="No hay períodos académicos"
      description="Aún no se han creado períodos académicos"
      action={onAddTerm ? {
        label: "Crear período",
        onClick: onAddTerm,
        variant: "primary"
      } : undefined}
      icon={<FiCalendar className="w-full h-full text-base-content/40" />}
    />
  )
}
