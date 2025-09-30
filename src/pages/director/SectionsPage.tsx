import { useState, useEffect } from 'react'
import { useDirectorSections } from '../../hooks/useDirectorAcademic'
import { useNotificationContext } from '../../hooks/useNotificationContext'
import { directorApi } from '../../api/endpoints'
import { Section } from '../../api/endpoints'
import { SectionModal } from '../../components/modals/SectionModal'
import { ConfirmModal } from '../../components/modals/ConfirmModal'
import { 
  Users,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  Award,
  Sparkles,
  Calendar,
  TrendingUp,
  School
} from 'lucide-react'

export function SectionsPage() {
  const {
    sections,
    isLoading,
    createSection,
    updateSection,
    deleteSection,
  } = useDirectorSections()
  
  const { showSuccess, showError } = useNotificationContext()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null)
  const [sectionOptions, setSectionOptions] = useState<{
    terms: Array<{id: number, name: string, is_active: boolean}>,
    grade_levels: Array<{id: number, name: string, level: number}>
  }>({
    terms: [],
    grade_levels: []
  })

  // Cargar opciones para crear secciones
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await directorApi.getSectionOptions()
        setSectionOptions(response.data)
      } catch {
        showError('Error', 'Error al cargar las opciones para crear secciones')
      }
    }
    loadOptions()
  }, [showError])

  const handleCreateSection = async (data: Partial<Section>) => {
    try {
      const termId = typeof data.term === 'object' ? (data.term as { id?: number } | null)?.id : Number(data.term as unknown)
      const gradeId = typeof data.grade_level === 'object' ? (data.grade_level as { id?: number } | null)?.id : Number(data.grade_level as unknown)
      const payload: {
        name: string
        capacity: number
        term: number | undefined
        grade_level: number | undefined
        professors: number[]
      } = {
        name: data.name || '',
        capacity: Number(data.capacity ?? 30),
        term: termId && termId > 0 ? termId : undefined,
        grade_level: gradeId && gradeId > 0 ? gradeId : undefined,
        professors: [],
      }
      await createSection.mutateAsync(payload as unknown as Partial<Section>)
      setShowCreateModal(false)
      showSuccess('Éxito', 'Sección creada correctamente')
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; detail?: string } } }
      const raw = e?.response?.data as unknown
      const msg = e?.response?.data?.error || e?.response?.data?.detail || (raw ? JSON.stringify(raw) : '') || 'Error al crear la sección'
      showError('Error', msg)
    }
  }

  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setShowEditModal(true)
  }

  const handleSaveSection = async (data: Partial<Section>) => {
    if (!editingSection) return

    try {
      const termId = typeof data.term === 'object' ? (data.term as { id?: number } | null)?.id : Number(data.term as unknown)
      const gradeId = typeof data.grade_level === 'object' ? (data.grade_level as { id?: number } | null)?.id : Number(data.grade_level as unknown)
      const payload: {
        name?: string
        capacity?: number
        term?: number
        grade_level?: number
      } = {
        name: data.name,
        capacity: data.capacity != null ? Number(data.capacity) : undefined,
        term: termId && termId > 0 ? termId : undefined,
        grade_level: gradeId && gradeId > 0 ? gradeId : undefined,
      }
      await updateSection.mutateAsync({ id: editingSection.id, data: payload as unknown as Partial<Section> })
      setShowEditModal(false)
      setEditingSection(null)
      showSuccess('Éxito', 'Sección actualizada correctamente')
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; detail?: string } } }
      const raw = e?.response?.data as unknown
      const msg = e?.response?.data?.error || e?.response?.data?.detail || (raw ? JSON.stringify(raw) : '') || 'Error al actualizar la sección'
      showError('Error', msg)
    }
  }

  const handleDeleteSection = (id: number) => {
    setSectionToDelete(id)
    setShowConfirmDelete(true)
  }

  const confirmDeleteSection = async () => {
    if (sectionToDelete) {
      try {
        await deleteSection.mutateAsync(sectionToDelete)
        setShowConfirmDelete(false)
        setSectionToDelete(null)
        showSuccess('Éxito', 'Sección eliminada correctamente')
      } catch {
        showError('Error', 'Error al eliminar la sección')
      }
    }
  }

  const cancelDeleteSection = () => {
    setShowConfirmDelete(false)
    setSectionToDelete(null)
  }

  // Calcular estadísticas
  const totalCapacity = sections.reduce((total, section) => total + (section.capacity || 0), 0)
  const averageCapacity = sections.length > 0 ? Math.round(totalCapacity / sections.length) : 0
  const sectionsWithGrade = sections.filter(section => section.grade_level).length

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 min-h-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
          <div className="flex items-center p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <School className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>Gestión de Secciones</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Administra las secciones académicas de tu institución
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-8 sm:py-12">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Cargando secciones</h3>
              <p className="text-xs sm:text-sm text-gray-600">Obteniendo información académica...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>Gestión de Secciones</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Administra las secciones académicas de tu institución
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium space-x-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Crear Sección</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total Secciones</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{sections.length}</p>
              <p className="text-xs text-blue-600 font-medium">Configuradas</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Capacidad Total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalCapacity}</p>
              <p className="text-xs text-green-600 font-medium">Estudiantes</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Promedio</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{averageCapacity}</p>
              <p className="text-xs text-purple-600 font-medium">Por sección</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Con Grado</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{sectionsWithGrade}</p>
              <p className="text-xs text-orange-600 font-medium">Asignadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <School className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Lista de Secciones</h2>
              <p className="text-xs sm:text-sm text-gray-600">Administra las secciones académicas de la institución</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          {sections.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <School className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No hay secciones configuradas</h3>
                  <p className="text-sm text-gray-600 mb-4">Comienza creando las secciones académicas de tu institución.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Primera Sección</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Nombre</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>Grado</span>
                      </div>
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>Capacidad</span>
                      </div>
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Fecha de Creación</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sections.map((section) => (
                    <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs sm:text-sm font-bold">
                                {section.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {section.name}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {section.grade_level?.name || `Grado ${section.grade_level}`} • {section.capacity} estudiantes
                            </div>
                            <div className="text-xs text-gray-500 lg:hidden">
                              {new Date(section.created_at).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          <Award className="w-3 h-3 mr-1" />
                          {section.grade_level?.name || `Grado ${section.grade_level}`}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          <Users className="w-3 h-3 mr-1" />
                          {section.capacity} estudiantes
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(section.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => handleEditSection(section)}
                            className="inline-flex items-center px-2 py-1 border border-blue-300 text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-xs"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="inline-flex items-center px-2 py-1 border border-red-300 text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de crear sección */}
      <SectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        section={null}
        onSave={handleCreateSection}
        loading={createSection.isPending}
        terms={sectionOptions.terms}
        gradeLevels={sectionOptions.grade_levels}
      />

      {/* Modal de editar sección */}
      <SectionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingSection(null)
        }}
        section={editingSection}
        onSave={handleSaveSection}
        loading={updateSection.isPending}
        terms={sectionOptions.terms}
        gradeLevels={sectionOptions.grade_levels}
      />

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={cancelDeleteSection}
        onConfirm={confirmDeleteSection}
        title="Eliminar Sección"
        message="¿Estás seguro de que quieres eliminar esta sección? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteSection.isPending}
      />
    </div>
  )
}
