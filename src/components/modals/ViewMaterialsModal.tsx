import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Topic, Material } from '../../api/endpoints'
import { PreviewModal } from '../editor/PreviewModal'
import { Document } from '../../types/block-schema'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

interface ViewMaterialsModalProps {
  isOpen: boolean
  onClose: () => void
  topic: Topic | null
}

export function ViewMaterialsModal({ isOpen, onClose, topic }: ViewMaterialsModalProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'class' | 'personalized'>('all')
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'LINK' | 'SCORM' | 'OTHER'>('all')

  // Obtener materiales del tema
  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['topic-materials', topic?.id],
    queryFn: async () => {
      try {
        const response = await academicApi.getMaterialsByTopic(topic!.id)
        return response.data.results || response.data
      } catch (err) {
        throw err
      }
    },
    enabled: isOpen && !!topic
  })

  const handleMaterialClick = async (material: Material) => {
    setSelectedMaterial(material)
    
    // Si el material tiene content_data (contenido generado por IA), usar PreviewModal
    if (material.content_data) {
      try {
        // Parsear el contenido generado por IA
        const contentData = JSON.parse(material.content_data)
        if (contentData && contentData.blocks) {
          setPreviewDocument(contentData)
          setIsPreviewModalOpen(true)
          return
        }
      } catch (error) {
        console.error('Error parsing content_data:', error)
      }
    }
    
    // Para otros tipos de materiales, mostrar mensaje de que no se puede visualizar
    alert('Este tipo de material no se puede visualizar en este momento.')
  }

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false)
    setPreviewDocument(null)
    setSelectedMaterial(null)
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )
      case 'DOCUMENT':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'AUDIO':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'LINK':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'IMAGE':
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'SCORM':
        return (
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'OTHER':
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        )
    }
  }

  const getMaterialTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'DOCUMENT': 'Documento',
      'VIDEO': 'Video',
      'AUDIO': 'Audio',
      'IMAGE': 'Imagen',
      'LINK': 'Enlace',
      'SCORM': 'SCORM',
      'OTHER': 'Otro'
    }
    return labels[type] || type
  }

  // Filtrar materiales
  const filteredMaterials = useMemo(() => {
    if (!materials) return []
    
    return materials.filter((material) => {
      // Filtro por tipo de asignación
      const assignmentMatch = assignmentFilter === 'all' || 
        (assignmentFilter === 'class' && material.is_shared) ||
        (assignmentFilter === 'personalized' && !material.is_shared)
      
      // Filtro por tipo de contenido
      const contentTypeMatch = contentTypeFilter === 'all' || 
        material.material_type === contentTypeFilter
      
      return assignmentMatch && contentTypeMatch
    })
  }, [materials, assignmentFilter, contentTypeFilter])

  // Obtener estadísticas de filtros
  const filterStats = useMemo(() => {
    if (!materials) return { total: 0, class: 0, personalized: 0, byType: {} }
    
    const stats = {
      total: materials.length,
      class: materials.filter(m => m.is_shared).length,
      personalized: materials.filter(m => !m.is_shared).length,
      byType: materials.reduce((acc, material) => {
        acc[material.material_type] = (acc[material.material_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
    
    return stats
  }, [materials])

  if (!isOpen) return null

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Materiales del Tema"
        size="xl"
      >
        {topic && (
          <div className="mb-4 p-3 bg-base-200 rounded-lg">
            <p className="text-sm text-base-content/70">
              <span className="font-medium text-base-content">Tema:</span> {topic.name} • {topic.course_name}
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 p-4 bg-base-100 rounded-lg border border-base-300">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filtro por tipo de asignación */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-base-content">Asignación:</label>
              <Select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value as 'all' | 'class' | 'personalized')}
                options={[
                  { value: 'all', label: `Todos (${filterStats.total})` },
                  { value: 'class', label: `De Clase (${filterStats.class})` },
                  { value: 'personalized', label: `Personalizados (${filterStats.personalized})` }
                ]}
              />
            </div>

            {/* Filtro por tipo de contenido */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-base-content">Tipo:</label>
              <Select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value as 'all' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'LINK' | 'SCORM' | 'OTHER')}
                options={[
                  { value: 'all', label: 'Todos' },
                  ...Object.entries(filterStats.byType).map(([type, count]) => ({
                    value: type,
                    label: `${getMaterialTypeLabel(type)} (${count})`
                  }))
                ]}
              />
            </div>

            {/* Botón para limpiar filtros */}
            {(assignmentFilter !== 'all' || contentTypeFilter !== 'all') && (
              <Button
                onClick={() => {
                  setAssignmentFilter('all')
                  setContentTypeFilter('all')
                }}
                variant="outline"
                size="sm"
              >
                Limpiar filtros
              </Button>
            )}

            {/* Contador de resultados filtrados */}
            <div className="ml-auto text-sm text-base-content/70">
              Mostrando {filteredMaterials.length} de {filterStats.total} materiales
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-base-content/70">Cargando materiales...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-error mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-base-content mb-2">Error al cargar materiales</h3>
              <p className="text-base-content/70 mb-4">No se pudieron cargar los materiales del tema.</p>
              <div className="text-sm text-base-content/50 bg-base-200 p-3 rounded-lg">
                <p><strong>Error:</strong> {error.message || 'Error desconocido'}</p>
                <p><strong>Tema ID:</strong> {topic?.id}</p>
                <p><strong>Endpoint:</strong> /api/v1/academic/materials/by-topic/{topic?.id}/</p>
              </div>
            </div>
          ) : filteredMaterials && filteredMaterials.length > 0 ? (
            <div className="space-y-6">
              {/* Materiales de Clase */}
              {filteredMaterials.filter(m => m.is_shared).length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-base-content">Materiales de Clase</h3>
                    <span className="ml-2 bg-primary-100 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {filteredMaterials.filter(m => m.is_shared).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredMaterials.filter(m => m.is_shared).map((material) => (
                      <div
                        key={material.id}
                        className="p-4 rounded-lg border border-primary-200 bg-primary-50 hover:border-primary-300 hover:bg-primary-100 cursor-pointer transition-all duration-200"
                        onClick={() => handleMaterialClick(material)}
                      >
                        <div className="flex items-start space-x-4">
                          {getMaterialIcon(material.material_type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-base-content truncate">{material.name}</h4>
                            {material.description && (
                              <p className="text-sm text-base-content/70 mt-1 line-clamp-2">{material.description}</p>
                            )}
                            <div className="flex items-center mt-2 text-xs text-base-content/50 space-x-4">
                              <span className="bg-primary-200 text-primary px-2 py-1 rounded">
                                {getMaterialTypeLabel(material.material_type)}
                              </span>
                              <span className="bg-success-100 text-success px-2 py-1 rounded">
                                Material de clase
                              </span>
                              <span>
                                Creado: {new Date(material.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materiales Personalizados */}
              {filteredMaterials.filter(m => !m.is_shared).length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-base-content">Materiales Personalizados</h3>
                    <span className="ml-2 bg-secondary-100 text-secondary text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {filteredMaterials.filter(m => !m.is_shared).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredMaterials.filter(m => !m.is_shared).map((material) => (
                      <div
                        key={material.id}
                        className="p-4 rounded-lg border border-secondary-200 bg-secondary-50 hover:border-secondary-300 hover:bg-secondary-100 cursor-pointer transition-all duration-200"
                        onClick={() => handleMaterialClick(material)}
                      >
                        <div className="flex items-start space-x-4">
                          {getMaterialIcon(material.material_type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-base-content truncate">{material.name}</h4>
                            {material.description && (
                              <p className="text-sm text-base-content/70 mt-1 line-clamp-2">{material.description}</p>
                            )}
                            <div className="flex items-center mt-2 text-xs text-base-content/50 space-x-4">
                              <span className="bg-secondary-200 text-secondary px-2 py-1 rounded">
                                {getMaterialTypeLabel(material.material_type)}
                              </span>
                              <span className="bg-accent-100 text-accent px-2 py-1 rounded">
                                Material personalizado
                              </span>
                              <span>
                                Creado: {new Date(material.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-base-content/40 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-base-content mb-2">
                {materials && materials.length > 0 ? 'No hay materiales que coincidan' : 'No hay materiales'}
              </h3>
              <p className="text-base-content/70">
                {materials && materials.length > 0 
                  ? 'No se encontraron materiales con los filtros seleccionados.' 
                  : 'Este tema no tiene materiales asignados aún.'
                }
              </p>
              {materials && materials.length > 0 && (
                <Button
                  onClick={() => {
                    setAssignmentFilter('all')
                    setContentTypeFilter('all')
                  }}
                  variant="primary"
                  className="mt-4"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* Preview Modal for AI-generated content */}
      {isPreviewModalOpen && previewDocument && (
        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={handleClosePreviewModal}
          onEdit={() => {
            // No permitir edición desde el modal de materiales
            console.log('Edición no permitida desde modal de materiales')
          }}
          document={previewDocument}
          title={selectedMaterial?.name || 'Material'}
        />
      )}
    </>
  )
}
