import { useState, useEffect } from 'react'
import { Portfolio, PortfolioCourse, Material, academicApi } from '../../api/endpoints'
import { formatDate } from '../../utils/helpers'
import { Modal } from '../ui/Modal'
import { PreviewModal } from '../editor/PreviewModal'
import { Document } from '../../types/block-schema'
import { 
  CheckCircle,
  XCircle,
  ArrowLeft,
  FileText,
  Book,
  Calendar,
  Folder,
  Eye,
  Clock,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  Video,
  Music,
  Link
} from 'lucide-react'

interface PortfolioDetailModalProps {
  isOpen: boolean
  onClose: () => void
  portfolio: Portfolio | null
}

export function PortfolioDetailModal({ isOpen, onClose, portfolio }: PortfolioDetailModalProps) {
  const [selectedCourse, setSelectedCourse] = useState<PortfolioCourse | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<{id: number, name: string, order: number, description?: string} | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)

  // Limpiar estado cuando cambie el portafolio
  useEffect(() => {
    if (portfolio) {
      // Reset navigation state when portfolio changes
      setSelectedCourse(null)
      setSelectedTopic(null)
      setSelectedMaterials([])
      setSelectedMaterial(null)
      setIsPreviewModalOpen(false)
      setPreviewDocument(null)
    }
  }, [portfolio])

  // Limpiar estado cuando se cierre el modal principal
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal is closed
      setSelectedCourse(null)
      setSelectedTopic(null)
      setSelectedMaterials([])
      setSelectedMaterial(null)
      setIsPreviewModalOpen(false)
      setPreviewDocument(null)
      setLoadingMaterials(false)
    }
  }, [isOpen])

  // Funciones de navegación
  const handleCourseClick = (course: PortfolioCourse) => {
    setSelectedCourse(course)
    setSelectedTopic(null)
    setSelectedMaterials([])
  }

  const handleTopicClick = async (topic: {id: number, name: string, order: number, description?: string}) => {
    setSelectedTopic(topic)
    setLoadingMaterials(true)
    
    try {
      // Cargar materiales reales del tema desde la API
      const response = await academicApi.getMaterialsByTopic(topic.id)
      const allMaterials = Array.isArray(response.data) ? response.data : []
      
      // Filtrar materiales según asignaciones del estudiante
      const studentId = portfolio?.student
      const filteredMaterials = allMaterials.filter((material: Material) => {
        // Materiales compartidos (de clase) siempre se muestran
        if (material.is_shared) {
          return true
        }
        
        // Materiales personalizados solo si están asignados al estudiante
        if (material.assigned_students && studentId) {
          return material.assigned_students.includes(studentId)
        }
        
        // Si no hay assigned_students definido, no mostrar materiales personalizados
        return false
      })
      
      setSelectedMaterials(filteredMaterials)
    } catch (error: unknown) {
      console.error('Error loading materials:', error)
      setSelectedMaterials([])
    } finally {
      setLoadingMaterials(false)
    }
  }

  const handleBackToCourses = () => {
    setSelectedCourse(null)
    setSelectedTopic(null)
    setSelectedMaterials([])
  }

  const handleBackToTopics = () => {
    setSelectedTopic(null)
    setSelectedMaterials([])
  }

  const handleClose = () => {
    setSelectedCourse(null)
    setSelectedTopic(null)
    setSelectedMaterials([])
    setIsPreviewModalOpen(false)
    setPreviewDocument(null)
    setSelectedMaterial(null)
    onClose()
  }

  const handleMaterialClick = async (material: Material) => {
    setSelectedMaterial(material)
    
    // Si el material tiene content_data (contenido generado por IA), usar PreviewModal
    if (material.content_data) {
      try {
        // Parsear el contenido generado por IA
        const contentData = JSON.parse(material.content_data)
        if (contentData && (contentData.blocks || contentData.gamma_blocks)) {
          // Soporte para diferentes formatos de contenido IA
          const previewDoc = {
            title: material.name,
            blocks: contentData.blocks || contentData.gamma_blocks || [],
            ...contentData
          }
          setPreviewDocument(previewDoc)
          setIsPreviewModalOpen(true)
          return
        }
      } catch (error) {
        console.error('Error parsing content_data:', error)
      }
    }
    
    // Para materiales con archivos o URLs, manejar la descarga/visualización
    if (material.file) {
      // Abrir archivo en nueva ventana
      window.open(material.file, '_blank')
      return
    }
    
    if (material.url) {
      // Abrir URL en nueva ventana
      window.open(material.url, '_blank')
      return
    }
    
    // Si no hay contenido disponible, mostrar mensaje informativo
    alert(`El material "${material.name}" no tiene contenido disponible para visualizar en este momento.`)
  }

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false)
    setPreviewDocument(null)
    setSelectedMaterial(null)
  }

  if (!portfolio) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={portfolio.title}
      size="xl"
    >
      <div className="space-y-4">
        {/* Portfolio Info */}
        <div className="card p-3">
          <h4 className="headline-lg text-base-content mb-2">Información del Portafolio</h4>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              {portfolio.is_public ? (
                <CheckCircle className="w-3 h-3 text-success" />
              ) : (
                <XCircle className="w-3 h-3 text-error" />
              )}
            </div>
            <div>
              <label className="text-small font-medium text-base-content/70">Estado</label>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-extra-small font-medium ${
                portfolio.is_public 
                  ? 'bg-success-100 text-success' 
                  : 'bg-error-100 text-error'
              }`}>
                {portfolio.is_public ? 'Público' : 'Privado'}
              </span>
            </div>
          </div>
          {portfolio.description && (
            <div className="mt-3">
              <label className="text-small font-medium text-base-content/70">Descripción</label>
              <p className="text-small text-base-content mt-1">{portfolio.description}</p>
            </div>
          )}
        </div>

        {/* Courses Section */}
        {portfolio.courses && portfolio.courses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="headline-lg text-base-content">Cursos en este Portafolio</h4>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-primary-100 rounded-lg">
                  <Book className="w-4 h-4 text-primary" />
                </div>
                <span className="text-small text-base-content/70">
                  {portfolio.courses.length} curso{portfolio.courses.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {portfolio.courses
                .filter((course, index, self) => 
                  // Eliminar cursos duplicados basado en el ID
                  index === self.findIndex(c => c.id === course.id)
                )
                .map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-lg ${
                    selectedCourse?.id === course.id
                      ? 'border-primary bg-primary-50 shadow-md'
                      : 'border-base-300 hover:border-primary/50 hover:bg-base-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${
                        selectedCourse?.id === course.id ? 'bg-primary-100' : 'bg-base-200'
                      }`}>
                        <Book className={`w-4 h-4 ${
                          selectedCourse?.id === course.id ? 'text-primary' : 'text-base-content/70'
                        }`} />
                      </div>
                      <div>
                        <h5 className="headline-small text-base-content">
                          {course.course_name}
                        </h5>
                        <p className="text-extra-small text-base-content/70">
                          {course.course_code}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      selectedCourse?.id === course.id ? 'rotate-90 text-primary' : 'text-base-content/40'
                    }`} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-small text-base-content/70">
                      <Calendar className="w-3 h-3" />
                      <span>Agregado: {formatDate(course.added_at)}</span>
                    </div>
                    {course.topics && course.topics.length > 0 && (
                      <div className="flex items-center space-x-1 text-small text-base-content/70">
                        <Folder className="w-3 h-3" />
                        <span>{course.topics.length} tema{course.topics.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Course Content */}
            {selectedCourse && !selectedTopic && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Book className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h5 className="headline-lg text-base-content">
                        {selectedCourse.course_name}
                      </h5>
                      <p className="text-small text-base-content/70">
                        {selectedCourse.course_code} • Agregado: {formatDate(selectedCourse.added_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToCourses}
                    className="btn-secondary text-small px-3 py-2 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a Cursos</span>
                  </button>
                </div>
                
                {/* Topics Section */}
                {selectedCourse.topics && selectedCourse.topics.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h6 className="headline-lg text-base-content">
                        Temas del Curso
                      </h6>
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-success-100 rounded-lg">
                          <Folder className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-small text-base-content/70">
                          {selectedCourse.topics.length} tema{selectedCourse.topics.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedCourse.topics
                        .filter((topic, index, self) => 
                          // Eliminar temas duplicados basado en el ID
                          index === self.findIndex(t => t.id === topic.id)
                        )
                        .sort((a, b) => a.order - b.order)
                        .map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicClick(topic)}
                          className="bg-base-100 p-4 rounded-lg border border-base-300 hover:border-success hover:bg-success-50 text-left transition-all duration-200 hover:shadow-md group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-success-100 rounded-lg group-hover:bg-success-200 transition-colors">
                                <Folder className="w-4 h-4 text-success" />
                              </div>
                              <div>
                                <h6 className="font-medium text-base-content text-small">
                                  {topic.name}
                                </h6>
                                <p className="text-extra-small text-base-content/70">
                                  Orden: {topic.order}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-success transition-colors" />
                          </div>
                          {topic.description && (
                            <p className="text-extra-small text-base-content/70 mt-2 line-clamp-2">
                              {topic.description}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-3 bg-base-200 rounded-full w-fit mx-auto mb-3">
                      <Folder className="w-6 h-6 text-base-content/40" />
                    </div>
                    <h6 className="headline-lg text-base-content mb-1">Sin temas asignados</h6>
                    <p className="text-small text-base-content/70">
                      Este curso no tiene temas asignados aún.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Topic Content */}
            {selectedTopic && (
              <div className="mt-6 p-4 bg-gradient-to-r from-success-50 to-info-50 rounded-xl border border-success-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-success-100 rounded-lg">
                      <Folder className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h5 className="headline-lg text-base-content">
                        {selectedTopic.name}
                      </h5>
                      <p className="text-small text-base-content/70">
                        Orden: {selectedTopic.order}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToTopics}
                    className="btn-secondary text-small px-3 py-2 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a Temas</span>
                  </button>
                </div>
                
                {selectedTopic.description && (
                  <div className="mb-4 p-3 bg-base-100 rounded-lg border border-base-300">
                    <p className="text-small text-base-content/70">
                      {selectedTopic.description}
                    </p>
                  </div>
                )}
                
                {/* Materials Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="headline-lg text-base-content">
                      Materiales del Tema
                    </h6>
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-info-100 rounded-lg">
                        <FileText className="w-4 h-4 text-info" />
                      </div>
                      <span className="text-small text-base-content/70">
                        {selectedMaterials.length} material{selectedMaterials.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                  
                  {loadingMaterials ? (
                    <div className="text-center py-8">
                      <div className="p-3 bg-primary-100 rounded-full w-fit mx-auto mb-3">
                        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                      </div>
                      <h6 className="headline-lg text-base-content mb-1">Cargando materiales...</h6>
                      <p className="text-small text-base-content/70">
                        Obteniendo los materiales del tema
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Vista desktop - Tabla */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Material</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Asignación</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha</th>
                              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMaterials.map((material) => (
                              <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    material.material_type === 'DOCUMENT' ? 'bg-red-100' :
                                    material.material_type === 'VIDEO' ? 'bg-blue-100' :
                                    material.material_type === 'AUDIO' ? 'bg-yellow-100' :
                                    material.material_type === 'IMAGE' ? 'bg-green-100' :
                                    material.material_type === 'LINK' ? 'bg-cyan-100' :
                                    material.material_type === 'SCORM' ? 'bg-purple-100' :
                                    'bg-gray-100'
                                  }`}>
                                    {material.material_type === 'DOCUMENT' && <FileText className="w-4 h-4 text-red-600" />}
                                    {material.material_type === 'VIDEO' && <Video className="w-4 h-4 text-blue-600" />}
                                    {material.material_type === 'AUDIO' && <Music className="w-4 h-4 text-yellow-600" />}
                                    {material.material_type === 'IMAGE' && <ImageIcon className="w-4 h-4 text-green-600" />}
                                    {material.material_type === 'LINK' && <Link className="w-4 h-4 text-cyan-600" />}
                                    {material.material_type === 'SCORM' && <Book className="w-4 h-4 text-purple-600" />}
                                    {!['DOCUMENT', 'VIDEO', 'AUDIO', 'IMAGE', 'LINK', 'SCORM'].includes(material.material_type) && <FileText className="w-4 h-4 text-gray-500" />}
                                  </div>
                                  <div>
                                    <h6 className="font-medium text-gray-900 text-sm">
                                      {material.name}
                                    </h6>
                                    {material.description && (
                                      <p className="text-xs text-gray-500 line-clamp-1">
                                        {material.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-700">
                                  {material.material_type || 'Archivo'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col space-y-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                    material.is_shared 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {material.is_shared ? 'Clase' : 'Personalizado'}
                                  </span>
                                  {!material.is_shared && material.professor_name && (
                                    <span className="text-xs text-gray-500">
                                      Por: {material.professor_name}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(material.created_at)}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center">
                                  <button 
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center space-x-1 text-xs font-medium"
                                    onClick={() => handleMaterialClick(material)}
                                    title={`Ver contenido: ${material.name}`}
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Ver Contenido</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Vista móvil - Cards */}
                      <div className="lg:hidden space-y-3">
                        {selectedMaterials.map((material) => (
                          <div key={material.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3 mb-3">
                              <div className={`p-2 rounded-lg ${
                                material.material_type === 'DOCUMENT' ? 'bg-red-100' :
                                material.material_type === 'VIDEO' ? 'bg-blue-100' :
                                material.material_type === 'AUDIO' ? 'bg-yellow-100' :
                                material.material_type === 'IMAGE' ? 'bg-green-100' :
                                material.material_type === 'LINK' ? 'bg-cyan-100' :
                                material.material_type === 'SCORM' ? 'bg-purple-100' :
                                'bg-gray-100'
                              }`}>
                                {material.material_type === 'DOCUMENT' && <FileText className="w-4 h-4 text-red-600" />}
                                {material.material_type === 'VIDEO' && <Video className="w-4 h-4 text-blue-600" />}
                                {material.material_type === 'AUDIO' && <Music className="w-4 h-4 text-yellow-600" />}
                                {material.material_type === 'IMAGE' && <ImageIcon className="w-4 h-4 text-green-600" />}
                                {material.material_type === 'LINK' && <Link className="w-4 h-4 text-cyan-600" />}
                                {material.material_type === 'SCORM' && <Book className="w-4 h-4 text-purple-600" />}
                                {!['DOCUMENT', 'VIDEO', 'AUDIO', 'IMAGE', 'LINK', 'SCORM'].includes(material.material_type) && <FileText className="w-4 h-4 text-gray-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h6 className="font-medium text-gray-900 text-sm mb-1">
                                  {material.name}
                                </h6>
                                {material.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                    {material.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    {material.material_type || 'Archivo'}
                                  </span>
                                  <span className={`px-2 py-1 rounded ${
                                    material.is_shared 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {material.is_shared ? 'Clase' : 'Personalizado'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(material.created_at)}</span>
                              </div>
                              <div className="flex items-center">
                                <button 
                                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center space-x-1 text-xs font-medium"
                                  onClick={() => handleMaterialClick(material)}
                                  title={`Ver contenido: ${material.name}`}
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Ver Contenido</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {!loadingMaterials && selectedMaterials.length === 0 && (
                    <div className="text-center py-8">
                      <div className="p-3 bg-base-200 rounded-full w-fit mx-auto mb-3">
                        <FileText className="w-6 h-6 text-base-content/40" />
                      </div>
                      <h6 className="headline-lg text-base-content mb-1">Sin materiales asignados</h6>
                      <p className="text-small text-base-content/70">
                        Este tema no tiene materiales asignados a este estudiante.
                      </p>
                      <div className="mt-3 p-3 bg-base-100 rounded-lg border border-base-300">
                        <p className="text-extra-small text-base-content/70">
                          Los materiales pueden ser de <span className="font-medium text-primary">clase</span> (compartidos) 
                          o <span className="font-medium text-warning">personalizados</span> (asignados específicamente).
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Preview Modal for AI-generated content */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
        document={previewDocument}
        title={selectedMaterial?.name || 'Material'}
      />
    </Modal>
  )
}
