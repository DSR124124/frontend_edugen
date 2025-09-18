import { DeleteModal } from './DeleteModal'
import { Section } from '../../api/endpoints'

interface DeleteSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  section: Section | null
}

export function DeleteSectionModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  section
}: DeleteSectionModalProps) {
  if (!section) return null

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="¿Eliminar esta sección?"
      itemName={section.name}
      itemDescription={`${section.course?.name || 'Sin curso'} - Capacidad: ${section.capacity || 'N/A'}`}
      itemType="Sección"
      warningMessage="Esta acción no se puede deshacer. Se eliminarán también todos los estudiantes y materiales asociados a esta sección."
      details={[
        'La sección y toda su información',
        'Todos los estudiantes asignados a la sección',
        'Los materiales y actividades de la sección',
        'El historial de calificaciones y progreso'
      ]}
      confirmText="Eliminar Sección"
    />
  )
}
