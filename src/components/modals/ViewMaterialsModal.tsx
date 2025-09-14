import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicApi, Topic, Material } from '../../api/endpoints'
import { MaterialViewer } from '../student/MaterialViewer'

interface ViewMaterialsModalProps {
  isOpen: boolean
  onClose: () => void
  topic: Topic | null
}

export function ViewMaterialsModal({ isOpen, onClose, topic }: ViewMaterialsModalProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isMaterialViewerOpen, setIsMaterialViewerOpen] = useState(false)

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

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material)
    setIsMaterialViewerOpen(true)
  }

  const handleCloseMaterialViewer = () => {
    setIsMaterialViewerOpen(false)
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

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Materiales del Tema
              </h2>
              {topic && (
                <p className="text-sm text-gray-600 mt-1">
                  {topic.name} • {topic.course_name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando materiales...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar materiales</h3>
                <p className="text-gray-600 mb-4">No se pudieron cargar los materiales del tema.</p>
                <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
                  <p><strong>Error:</strong> {error.message || 'Error desconocido'}</p>
                  <p><strong>Tema ID:</strong> {topic?.id}</p>
                  <p><strong>Endpoint:</strong> /api/v1/academic/materials/by-topic/{topic?.id}/</p>
                </div>
              </div>
            ) : materials && materials.length > 0 ? (
              <div className="space-y-4">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                    onClick={() => handleMaterialClick(material)}
                  >
                    <div className="flex items-start space-x-4">
                      {getMaterialIcon(material.material_type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{material.name}</h3>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {material.material_type}
                          </span>
                          <span>
                            {material.is_shared ? 'Material de clase' : 'Material personalizado'}
                          </span>
                          <span>
                            Creado: {new Date(material.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materiales</h3>
                <p className="text-gray-600">Este tema no tiene materiales asignados aún.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Material Viewer Modal */}
      {isMaterialViewerOpen && selectedMaterial && (
        <MaterialViewer
          material={selectedMaterial}
          isOpen={isMaterialViewerOpen}
          onClose={handleCloseMaterialViewer}
        />
      )}
    </>
  )
}
