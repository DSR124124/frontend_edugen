import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiContentApi, academicApi, GeneratedContent } from '../../api/endpoints'
import { http } from '../../api/http'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { GammaEditor } from '../../components/editor/GammaEditor'
import { PreviewModal } from '../../components/editor/PreviewModal'
import { Document } from '../../types/block-schema'
import { useAuthStore } from '../../store/auth'
import { 
  FiFileText, 
  FiEdit3, 
  FiTrash2, 
  FiEye,
  FiCalendar,
  FiCheckCircle,
  FiPlus,
  FiDownload,
  FiX,
  FiUserCheck
} from 'react-icons/fi'
import { PageLoadingState, PageErrorState } from '../../components/common'
import { Button } from '../../components/ui/Button'
import { AssignMaterialModal } from '../../components/modals/AssignMaterialModal'
import { ExportSCORMModal, SCORMExportParams } from '../../components/modals/ExportSCORMModal'

export function GeneratedContentPage() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotificationContext()
  const { sections: professorSections } = useProfessorSections()
  const { user } = useAuthStore()
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingContent, setDeletingContent] = useState<GeneratedContent | null>(null)
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assigningContent, setAssigningContent] = useState<GeneratedContent | null>(null)
  const [isExportSCORMModalOpen, setIsExportSCORMModalOpen] = useState(false)
  const [exportingContent, setExportingContent] = useState<GeneratedContent | null>(null)
  const [isAssigningMaterial, setIsAssigningMaterial] = useState(false)

  // Obtener contenidos generados
  const { data: generatedContents, isLoading, error } = useQuery({
    queryKey: ['generated-content'],
    queryFn: () => aiContentApi.getGeneratedContent()
  })

  // Eliminar contenido generado
  const deleteContentMutation = useMutation({
    mutationFn: (id: number) => aiContentApi.deleteGeneratedContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-content'] })
      showSuccess('Contenido eliminado exitosamente', 'El contenido se ha eliminado correctamente')
      setIsDeleteModalOpen(false)
      setDeletingContent(null)
    },
    onError: (error: Error) => {
      showError('Error al eliminar contenido', error.message || 'Error desconocido')
    }
  })

  // Actualizar contenido generado
  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => aiContentApi.updateGeneratedContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-content'] })
      showSuccess('Contenido guardado exitosamente', 'Los cambios se han guardado correctamente')
      setIsEditorModalOpen(false)
      setSelectedContent(null)
      setCurrentDocument(null)
    },
    onError: (error: Error) => {
      showError('❌ Error al guardar contenido', error.message || 'No se pudieron guardar los cambios. Inténtalo de nuevo.')
    }
  })

  const contents = generatedContents?.data || []

  if (isLoading) {
    return <PageLoadingState message="Cargando contenidos generados..." />
  }

  if (error) {
    return <PageErrorState error={error} />
  }

  const handleViewContent = (content: GeneratedContent) => {
    try {
      const document = content.gamma_document as unknown as Document
      setCurrentDocument(document)
      setSelectedContent(content)
      setIsPreviewModalOpen(true)
    } catch {
      showError('Error al cargar el contenido', 'El contenido no se puede visualizar')
    }
  }

  const normalizeDocument = (doc: Document): Document => {
    // Normalizar bloques para asegurar que todas las propiedades requeridas estén presentes
    const normalizedBlocks = doc.blocks.map(block => {
      // Normalizar bloques de tipo 'list'
      if (block.type === 'list') {
        return {
          ...block,
          items: Array.isArray(block.items) ? block.items : []
        }
      }
      // Normalizar bloques de tipo 'table'
      if (block.type === 'table') {
        return {
          ...block,
          tableData: {
            headers: Array.isArray(block.tableData?.headers) ? block.tableData.headers : ['Columna 1'],
            rows: Array.isArray(block.tableData?.rows) ? block.tableData.rows : [['']]
          }
        }
      }
      // Normalizar bloques de tipo 'quiz'
      if (block.type === 'quiz') {
        return {
          ...block,
          options: Array.isArray(block.options) ? block.options : ['Opción 1', 'Opción 2'],
          correctAnswer: typeof block.correctAnswer === 'number' ? block.correctAnswer : 0
        }
      }
      // Normalizar bloques de tipo 'form'
      if (block.type === 'form') {
        return {
          ...block,
          fields: Array.isArray(block.fields) ? block.fields : []
        }
      }
      return block
    })
    
    return {
      ...doc,
      blocks: normalizedBlocks
    }
  }

  const handleEditContent = (content: GeneratedContent) => {
    try {
      const document = content.gamma_document as unknown as Document
      const normalizedDocument = normalizeDocument(document)
      setCurrentDocument(normalizedDocument)
      setSelectedContent(content)
      setIsEditorModalOpen(true)
    } catch {
      showError('Error al cargar el contenido', 'El contenido no se puede editar')
    }
  }

  const handleDeleteContent = (content: GeneratedContent) => {
    setDeletingContent(content)
    setIsDeleteModalOpen(true)
  }

  const handleAssignContent = (content: GeneratedContent) => {
    setAssigningContent(content)
    setIsAssignModalOpen(true)
  }

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false)
    setAssigningContent(null)
  }

  const handleAssignMaterial = async (data: {
    sectionId: number
    title: string
    description?: string
    assignmentType: 'general' | 'personalized'
    selectedStudents?: number[]
  }) => {
    // Prevenir doble clic
    if (isAssigningMaterial) {
      return
    }

    try {
      setIsAssigningMaterial(true)
      
      if (!assigningContent) {
        showError('Error', 'No hay contenido seleccionado para asignar')
        setIsAssigningMaterial(false)
        return
      }

      // Verificar si ya existe un material con el mismo nombre en la misma sección
      try {
        const { data: existingMaterials } = await academicApi.getMaterials()
        const materials = Array.isArray(existingMaterials) ? existingMaterials : []
        
        const duplicateMaterial = materials.find((material: any) => 
          material.name === data.title && 
          material.topic &&
          material.professor === user?.id
        )

        if (duplicateMaterial) {
          // Verificar si el material ya está asignado a los estudiantes de la sección
          const { data: sectionStudents } = await academicApi.getStudentsBySection(data.sectionId)
          const students = sectionStudents?.students || []
          const studentIds = students.map((s: any) => s.id)
          
          const existingAssignedStudents = duplicateMaterial.assigned_students || []
          const allStudentsAssigned = studentIds.every((id: number) => 
            existingAssignedStudents.includes(id)
          )

          if (allStudentsAssigned && studentIds.length > 0) {
            showError(
              'Material ya asignado', 
              `El material "${data.title}" ya está asignado a todos los estudiantes de esta sección. Por favor, use un nombre diferente o edite el material existente.`
            )
            setIsAssigningMaterial(false)
            return
          }

          // Si el material existe pero no está completamente asignado, mostrar advertencia
          const response = await new Promise((resolve) => {
            const shouldProceed = window.confirm(
              `Ya existe un material con el nombre "${data.title}". ¿Desea crear un nuevo material o actualizar el existente asignándolo a esta sección?`
            )
            resolve(shouldProceed)
          })

          if (!response) {
            setIsAssigningMaterial(false)
            return
          }
        }
      } catch (error) {
        console.warn('Error al verificar materiales existentes:', error)
        // Continuar con la creación si hay error en la verificación
      }

      // Paso 1: Obtener un tema válido para el material
      console.log('🔍 Obteniendo temas...')
      const { data: topics } = await academicApi.getTopics()
      console.log('📚 Temas obtenidos:', topics)
      
      if (!topics || topics.length === 0) {
        showError('Error', 'No hay temas disponibles. Debe crear un tema primero.')
        return
      }

      // Usar el primer tema disponible del profesor
      const firstTopic = topics[0]

      // Paso 2: Crear un material real basado en el contenido generado usando FormData
      const formData = new FormData()
      formData.append('name', data.title)
      formData.append('description', data.description || '')
      formData.append('material_type', 'OTHER')
      formData.append('topic', firstTopic.id.toString())
      formData.append('is_shared', (data.assignmentType === 'general').toString())
      formData.append('content_data', JSON.stringify(assigningContent.gamma_document))

      // Agregar estudiantes asignados si es asignación personalizada
      if (data.assignmentType === 'personalized' && data.selectedStudents) {
        data.selectedStudents.forEach(studentId => {
          formData.append('assigned_students', studentId.toString())
        })
      }

      console.log('📝 Creando material con FormData...')
      const createResponse = await academicApi.createMaterial(formData)
      console.log('✅ Respuesta de creación de material:', createResponse)
      
      if (createResponse.data) {
        const createdMaterial = createResponse.data

        // Paso 3: Asignar el material a los estudiantes usando el endpoint existente
        const assignData = {
          material_id: createdMaterial.id,
          section_id: data.sectionId,
          assignment_type: data.assignmentType,
          selected_students: data.selectedStudents || []
        }

        console.log('👥 Asignando material a estudiantes...', assignData)
        const assignResponse = await academicApi.assignMaterialToStudents(assignData)
        console.log('✅ Respuesta de asignación:', assignResponse)
        
        if (assignResponse.data) {
          const assignResult = assignResponse.data
          
          // Verificar si ya estaba asignado
          if (assignResult.already_assigned || assignResult.assigned_count === 0) {
            showError(
              'Material ya asignado', 
              assignResult.warning || `El material ya está asignado a todos los estudiantes seleccionados.`
            )
          } else {
            showSuccess(
              `Material asignado exitosamente a ${assignResult.assigned_count} estudiante(s)`, 
              'El material ya está disponible en los portafolios de los estudiantes seleccionados'
            )
          }
          
          // Invalidar queries relacionadas con materiales para refrescar la UI
          await queryClient.invalidateQueries({ queryKey: ['topic-materials'] })
          await queryClient.invalidateQueries({ queryKey: ['materials'] })
          await queryClient.invalidateQueries({ queryKey: ['section-materials'] })
          
          setIsAssigningMaterial(false)
          handleCloseAssignModal()
        } else {
          throw new Error('Error al asignar el material a los estudiantes')
        }
      } else {
        throw new Error('Error al crear el material')
      }
    } catch (error: unknown) {
      console.error('Error al asignar material:', error)
      setIsAssigningMaterial(false)
      
      if (error instanceof Error) {
        // Si es un error de autenticación, mostrar mensaje específico
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          showError('Error de autenticación', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          showError('Error de permisos', 'No tienes permisos para realizar esta acción.')
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          showError('Error', 'No se encontró el recurso solicitado.')
        } else {
          showError('Error al asignar contenido', error.message)
        }
      } else {
        showError('Error al asignar contenido', 'Error desconocido. Por favor, intenta nuevamente.')
      }
    }
  }

  const handleExportContent = async (content: GeneratedContent) => {
    setExportingContent(content)
    setIsExportSCORMModalOpen(true)
  }

  const handleExportSCORM = async (contentId: number, params: SCORMExportParams) => {
    try {
      const response = await http.post(
        'scorm/export/',
        {
          content_id: contentId,
          ...params
        },
        {
          responseType: 'blob'
        }
      )

      // Crear blob desde los datos de la respuesta
      const blob = new Blob([response.data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scorm-${params.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // El mensaje de éxito se mostrará en el modal
    } catch (error: unknown) {
      let errorMessage = 'Error al generar el paquete SCORM'
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number; statusText?: string } }
        
        // Intentar leer el error como JSON si es posible
        if (axiosError.response?.data) {
          try {
            // Si la respuesta es un blob, intentar leerlo como texto
            if (axiosError.response.data instanceof Blob) {
              const text = await (axiosError.response.data as Blob).text()
              const errorData = JSON.parse(text)
              errorMessage = errorData.error || errorMessage
            } else if (typeof axiosError.response.data === 'object' && axiosError.response.data !== null) {
              const errorData = axiosError.response.data as { error?: string }
              errorMessage = errorData.error || errorMessage
            }
          } catch {
            errorMessage = `Error ${axiosError.response?.status || ''}: ${axiosError.response?.statusText || 'Error desconocido'}`
          }
        } else {
          errorMessage = `Error ${axiosError.response?.status || ''}: ${axiosError.response?.statusText || 'Error desconocido'}`
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  }

  const handleSaveDocument = (document: Document) => {
    if (!selectedContent) {
      showError('Error al guardar', 'No se ha seleccionado ningún contenido para guardar')
      return
    }

    updateContentMutation.mutate({
      id: selectedContent.id,
      data: {
        gamma_document: document,  // ✅ Correcto: usar gamma_document
        gamma_blocks: document.blocks || [], // También guardamos los bloques por separado
        title: document.title || selectedContent.title
      }
    })
  }

  const handleCloseEditor = () => {
    setIsEditorModalOpen(false)
    setSelectedContent(null)
    setCurrentDocument(null)
  }

  const handleClosePreview = () => {
    setIsPreviewModalOpen(false)
    setSelectedContent(null)
    setCurrentDocument(null)
  }

  const confirmDelete = () => {
    if (deletingContent) {
      deleteContentMutation.mutate(deletingContent.id)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0 max-w-full overflow-x-hidden" data-tour="generated-content-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0" data-tour="generated-content-header">
        <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-base-content truncate">
              Contenidos Generados
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
              Gestiona y edita el contenido generado por IA
            </p>
          </div>
        </div>
        <Button
          onClick={() => window.location.href = '/ai-content'}
          variant="primary"
          leftIcon={<FiPlus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          <span className="hidden sm:inline">Generar Nuevo</span>
          <span className="sm:hidden">Generar</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-primary-100 rounded-lg flex-shrink-0">
              <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Total Contenidos</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{contents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-success-100 rounded-lg flex-shrink-0">
              <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Contenidos Activos</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">{contents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-3 sm:p-4 hover:shadow-md transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-secondary-100 rounded-lg flex-shrink-0">
              <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-base-content/70 truncate">Este Mes</p>
              <p className="text-xl sm:text-2xl font-semibold text-base-content">
                {contents.filter(content => {
                  const contentDate = new Date(content.created_at)
                  const now = new Date()
                  return contentDate.getMonth() === now.getMonth() && contentDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="card p-3 sm:p-4 max-w-full overflow-x-auto" data-tour="generated-content-content">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold text-base-content flex items-center space-x-2">
            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>Contenidos Generados</span>
          </h2>
          <div className="text-xs sm:text-sm text-base-content/70">
            {contents.length} {contents.length === 1 ? 'contenido' : 'contenidos'} encontrado{contents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {contents.length > 0 ? (
          <>
            {/* Vista de Cards para móviles */}
            <div className="block sm:hidden space-y-4">
              {contents.map((content) => (
                <div key={content.id} className="card p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FiFileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base text-base-content line-clamp-2" title={content.title}>
                        {content.title}
                      </h3>
                      <p className="text-sm text-base-content/70 mt-1">
                        {content.user_name}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-success-100 text-success rounded-full flex-shrink-0">
                      <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                      Activo
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {content.description && (
                      <div className="text-sm text-base-content line-clamp-3">
                        {content.description}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-base-content/70">
                      <span>Autor: {content.user_name}</span>
                      <span>
                        {new Date(content.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => handleViewContent(content)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEye className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px] flex-1 min-w-[80px]"
                    >
                      Ver
                    </Button>
                    <Button 
                      onClick={() => handleEditContent(content)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEdit3 className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px] flex-1 min-w-[80px]"
                    >
                      Editar
                    </Button>
                    <Button 
                      onClick={() => handleAssignContent(content)}
                      variant="primary"
                      size="sm"
                      leftIcon={<FiUserCheck className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px] flex-1 min-w-[80px]"
                    >
                      Asignar
                    </Button>
                    <Button 
                      onClick={() => handleExportContent(content)}
                      variant="secondary"
                      size="sm"
                      leftIcon={<FiDownload className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px] flex-1 min-w-[80px]"
                    >
                      SCORM
                    </Button>
                    <Button 
                      onClick={() => handleDeleteContent(content)}
                      variant="danger"
                      size="sm"
                      leftIcon={<FiTrash2 className="w-4 h-4" />}
                      className="text-sm px-3 py-2 h-auto min-h-[44px] w-full"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Vista de Tabla para tablets */}
            <div className="hidden sm:block lg:hidden overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
              <table className="w-full min-w-[600px]">
                <thead className="bg-base-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Contenido
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Autor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-base-content/70 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-base-100 divide-y divide-base-300">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <FiFileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-base-content">{content.title}</div>
                            {content.description && (
                              <div className="text-sm text-base-content/70 max-w-xs truncate" title={content.description}>
                                {content.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-base-content font-medium bg-base-200 px-2 py-1 rounded">
                          {content.user_name}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success">
                          <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                          Activo
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <Button 
                            onClick={() => handleViewContent(content)}
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEye className="w-3 h-3" />}
                            className="text-xs px-2 py-1"
                          >
                            Ver
                          </Button>
                          <Button 
                            onClick={() => handleEditContent(content)}
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEdit3 className="w-3 h-3" />}
                            className="text-xs px-2 py-1"
                          >
                            Editar
                          </Button>
                          <Button 
                            onClick={() => handleAssignContent(content)}
                            variant="primary"
                            size="sm"
                            leftIcon={<FiUserCheck className="w-3 h-3" />}
                            className="text-xs px-2 py-1"
                          >
                            Asignar
                          </Button>
                          <Button 
                            onClick={() => handleExportContent(content)}
                            variant="secondary"
                            size="sm"
                            leftIcon={<FiDownload className="w-3 h-3" />}
                            className="text-xs px-2 py-1"
                          >
                            SCORM
                          </Button>
                          <Button 
                            onClick={() => handleDeleteContent(content)}
                            variant="danger"
                            size="sm"
                            leftIcon={<FiTrash2 className="w-3 h-3" />}
                            className="text-xs px-2 py-1"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Vista de Tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4" style={{ maxWidth: '100%' }}>
              <table className="w-full min-w-[700px]">
                <thead className="bg-base-200">
                  <tr>
                    <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider min-w-[180px] max-w-[250px]">
                      Contenido
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider min-w-[100px] max-w-[120px]">
                      Autor
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      Creado
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-3 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider whitespace-nowrap min-w-[80px]">
                      Estado
                    </th>
                    <th className="px-2 lg:px-3 xl:px-4 py-3 text-right text-xs font-medium text-base-content/70 uppercase tracking-wider min-w-[200px] 2xl:min-w-[280px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-base-100 divide-y divide-base-300">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="px-2 lg:px-3 xl:px-4 py-4">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <FiFileText className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs lg:text-sm font-medium text-base-content truncate" title={content.title}>{content.title}</div>
                            {content.description && (
                              <div className="text-xs text-base-content/70 truncate max-w-[150px] xl:max-w-[200px]" title={content.description}>
                                {content.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 lg:px-3 xl:px-4 py-4">
                        <span className="text-xs lg:text-sm text-base-content font-medium bg-base-200 px-1.5 py-0.5 rounded inline-block truncate max-w-[90px]" title={content.user_name}>
                          {content.user_name}
                        </span>
                      </td>
                      <td className="px-2 lg:px-3 xl:px-4 py-4 whitespace-nowrap">
                        <div className="text-xs lg:text-sm text-base-content">
                          {new Date(content.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-2 lg:px-3 xl:px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success">
                          <div className="w-1.5 h-1.5 bg-success rounded-full mr-1"></div>
                          Activo
                        </span>
                      </td>
                      <td className="px-2 lg:px-3 xl:px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-0.5 lg:gap-1 2xl:gap-2">
                          <Button 
                            onClick={() => handleViewContent(content)}
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEye className="w-3.5 h-3.5" />}
                            className="text-xs px-1.5 lg:px-2 2xl:px-3 min-w-[32px] h-8"
                            title="Ver"
                          >
                            <span className="hidden 2xl:inline">Ver</span>
                          </Button>
                          <Button 
                            onClick={() => handleEditContent(content)}
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEdit3 className="w-3.5 h-3.5" />}
                            className="text-xs px-1.5 lg:px-2 2xl:px-3 min-w-[32px] h-8"
                            title="Editar"
                          >
                            <span className="hidden 2xl:inline">Editar</span>
                          </Button>
                          <Button 
                            onClick={() => handleAssignContent(content)}
                            variant="primary"
                            size="sm"
                            leftIcon={<FiUserCheck className="w-3.5 h-3.5" />}
                            className="text-xs px-1.5 lg:px-2 2xl:px-3 min-w-[32px] h-8"
                            title="Asignar"
                          >
                            <span className="hidden 2xl:inline">Asignar</span>
                          </Button>
                          <Button 
                            onClick={() => handleExportContent(content)}
                            variant="secondary"
                            size="sm"
                            leftIcon={<FiDownload className="w-3.5 h-3.5" />}
                            className="text-xs px-1.5 lg:px-2 2xl:px-3 min-w-[32px] h-8"
                            title="Exportar SCORM"
                          >
                            <span className="hidden 2xl:inline">SCORM</span>
                          </Button>
                          <Button 
                            onClick={() => handleDeleteContent(content)}
                            variant="danger"
                            size="sm"
                            leftIcon={<FiTrash2 className="w-3.5 h-3.5" />}
                            className="text-xs px-1.5 lg:px-2 2xl:px-3 min-w-[32px] h-8"
                            title="Eliminar"
                          >
                            <span className="hidden 2xl:inline">Eliminar</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-base-200 rounded-full">
              <FiFileText className="w-8 h-8 text-base-content/40" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                No hay contenidos generados
              </h3>
              <p className="text-base-content/70 mb-4">
                Genera tu primer contenido educativo con IA
              </p>
              <Button
                onClick={() => window.location.href = '/ai-content'}
                leftIcon={<FiPlus className="w-4 h-4" />}
              >
                Generar Contenido
              </Button>
            </div>
                  </div>
                </div>
        )}
                  </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && deletingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <FiTrash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Eliminar Contenido</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar "{deletingContent.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant="ghost"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                variant="danger"
                className="flex-1"
                loading={deleteContentMutation.isPending}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorModalOpen && selectedContent && currentDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseEditor}></div>
          <div className="relative bg-white rounded-lg w-full max-w-7xl h-[90vh] mx-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Editar Contenido</h3>
                 <button
                onClick={handleCloseEditor}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                 >
                   <FiX className="w-5 h-5" />
                 </button>
               </div>
            <div className="flex-1 overflow-hidden">
              <GammaEditor
                document={currentDocument}
                onSave={handleSaveDocument}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && selectedContent && currentDocument && (
      <PreviewModal
        isOpen={isPreviewModalOpen}
          onClose={handleClosePreview}
          document={currentDocument}
          title={selectedContent.title}
        />
      )}

      {/* Modal de Asignación de Material */}
      <AssignMaterialModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        onAssign={handleAssignMaterial}
        content={assigningContent}
        sections={professorSections || []}
        isLoading={isAssigningMaterial}
      />

      {/* Modal de Exportación SCORM */}
      {isExportSCORMModalOpen && exportingContent && (
        <ExportSCORMModal
          isOpen={isExportSCORMModalOpen}
          onClose={() => {
            setIsExportSCORMModalOpen(false)
            setExportingContent(null)
          }}
          content={exportingContent}
          onExport={handleExportSCORM}
        />
      )}
    </div>
  )
}