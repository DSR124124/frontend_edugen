import { DeleteModal } from './DeleteModal'
import { Topic } from '../../api/endpoints'

interface DeleteTopicModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  topic: Topic | null
}

export function DeleteTopicModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  topic
}: DeleteTopicModalProps) {
  if (!topic) return null

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="¿Eliminar este tema?"
      itemName={topic.name}
      itemDescription={topic.description || 'Sin descripción'}
      itemType="Tema"
      warningMessage="Esta acción no se puede deshacer. Se eliminarán también todos los materiales asociados a este tema."
      details={[
        'El tema y toda su información',
        'Todos los materiales asociados al tema',
        'Las referencias en portafolios de estudiantes',
        'El historial de actividades relacionadas'
      ]}
      confirmText="Eliminar Tema"
    />
  )
}