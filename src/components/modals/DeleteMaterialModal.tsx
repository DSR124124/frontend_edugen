import { DeleteModal } from './DeleteModal'

interface Material {
  id: number
  title: string
  description?: string
  material_type: string
  file_path?: string
  created_at: string
  updated_at: string
}

interface DeleteMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  material: Material | null
}

export function DeleteMaterialModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  material
}: DeleteMaterialModalProps) {
  if (!material) return null

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="¿Eliminar este material?"
      itemName={material.title}
      itemDescription={`${material.material_type} - ${material.description || 'Sin descripción'}`}
      itemType="Material"
      warningMessage="Esta acción no se puede deshacer. Se eliminará permanentemente el material y todos sus archivos asociados."
      details={[
        'El material y toda su información',
        'Los archivos asociados (PDF, SCORM, etc.)',
        'Las referencias en portafolios de estudiantes',
        'El historial de visualizaciones y descargas'
      ]}
      confirmText="Eliminar Material"
    />
  )
}
