import { DeleteModal } from './DeleteModal'
import { GeneratedContent } from '../../api/endpoints'

interface DeleteContentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  content: GeneratedContent | null
}

export function DeleteContentModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  content
}: DeleteContentModalProps) {
  if (!content) return null

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="¿Eliminar este contenido?"
      itemName={content.title || 'Contenido sin título'}
      itemDescription={`${content.content_type} - ${content.description || 'Sin descripción'}`}
      itemType="Contenido"
      warningMessage="Esta acción no se puede deshacer. Se eliminará permanentemente el contenido generado con IA."
      details={[
        'El contenido generado y toda su información',
        'Los archivos HTML, CSS y JavaScript asociados',
        'Las referencias en portafolios de estudiantes',
        'El historial de ediciones y versiones'
      ]}
      confirmText="Eliminar Contenido"
    />
  )
}
