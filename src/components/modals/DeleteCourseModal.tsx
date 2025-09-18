import { DeleteModal } from './DeleteModal'

interface Course {
  id: number
  name: string
  code: string
  description: string
  credits: number
  institution: number
  created_at: string
  updated_at: string
}

interface DeleteCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  course: Course | null
}

export function DeleteCourseModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  course
}: DeleteCourseModalProps) {
  if (!course) return null

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="¿Eliminar este curso?"
      itemName={course.name}
      itemDescription={`${course.code} - ${course.description || 'Sin descripción'}`}
      itemType="Curso"
      warningMessage="Esta acción no se puede deshacer. Se eliminarán también todas las secciones y materiales asociados a este curso."
      details={[
        'El curso y toda su información',
        'Todas las secciones asignadas a este curso',
        'Los datos de estudiantes asociados',
        'El historial de calificaciones'
      ]}
      confirmText="Eliminar Curso"
    />
  )
}