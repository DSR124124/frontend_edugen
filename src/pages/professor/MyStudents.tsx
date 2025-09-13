import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProfessorSections } from '../../hooks/useProfessorSections'
import { useStudentsBySection } from '../../hooks/useStudentsBySection'
import { StudentProfileModal } from '../../components/modals/StudentProfileModal'

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  username: string
  is_active: boolean
  enrolled_at: string
}

export function MyStudents() {
  const [searchParams] = useSearchParams()
  const { sections: professorSections, loading: sectionsLoading } = useProfessorSections()
  const { data: studentsData, loading: studentsLoading, error: studentsError, getStudentsBySection } = useStudentsBySection()
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // Cargar estudiantes cuando se selecciona una sección
  useEffect(() => {
    if (selectedSectionId) {
      getStudentsBySection(selectedSectionId)
    }
  }, [selectedSectionId, getStudentsBySection])

  // Seleccionar sección desde URL o primera sección por defecto
  useEffect(() => {
    if (professorSections && professorSections.length > 0 && !selectedSectionId) {
      const sectionFromUrl = searchParams.get('section')
      if (sectionFromUrl) {
        const sectionId = parseInt(sectionFromUrl, 10)
        // Verificar que la sección existe en las secciones del profesor
        const sectionExists = professorSections.some(section => section.id === sectionId)
        if (sectionExists) {
          setSelectedSectionId(sectionId)
        } else {
          // Si la sección no existe, seleccionar la primera disponible
          setSelectedSectionId(professorSections[0].id)
        }
      } else {
        // Si no hay parámetro en URL, seleccionar la primera sección
        setSelectedSectionId(professorSections[0].id)
      }
    }
  }, [professorSections, selectedSectionId, searchParams])

  // Función para abrir el perfil del estudiante
  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student)
    setIsProfileModalOpen(true)
  }

  // Función para cerrar el modal
  const handleCloseProfile = () => {
    setIsProfileModalOpen(false)
    setSelectedStudent(null)
  }

  if (sectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando secciones...</p>
          </div>
        </div>
      </div>
    )
  }

  if (studentsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">Error: {studentsError}</p>
            <button
              onClick={() => selectedSectionId && getStudentsBySection(selectedSectionId)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mis Estudiantes
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona los estudiantes de tus secciones
          </p>
        </div>

        {/* Section Selector */}
        {professorSections && professorSections.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Sección</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professorSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedSectionId === section.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium">{section.name}</h3>
                  {section.course && (
                    <p className="text-sm text-gray-600">{section.course.name}</p>
                  )}
                  {section.grade_level && (
                    <p className="text-sm text-gray-500">{section.grade_level.name}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}


        {/* Section Info and Stats */}
        {studentsData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {studentsData.section.name}
                </h2>
                {studentsData.section.course_name && (
                  <p className="text-sm text-gray-600">Curso: {studentsData.section.course_name}</p>
                )}
                {studentsData.section.grade_level_name && (
                  <p className="text-sm text-gray-600">Grado: {studentsData.section.grade_level_name}</p>
                )}
                {studentsData.section.term_name && (
                  <p className="text-sm text-gray-600">Período: {studentsData.section.term_name}</p>
                )}
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                  <p className="text-2xl font-semibold text-gray-900">{studentsData.total_students}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lista de Estudiantes</h2>
          </div>

          <div className="p-6">
            {studentsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando estudiantes...</p>
              </div>
            ) : studentsData && studentsData.students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Matrícula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentsData.students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-700">
                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{student.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.enrolled_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewProfile(student)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Ver Perfil
                            </button>
                            <button className="text-green-600 hover:text-green-900 font-medium">
                              Calificaciones
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <p className="text-gray-500 text-lg">
                  {!selectedSectionId 
                    ? 'Selecciona una sección para ver los estudiantes'
                    : 'No hay estudiantes matriculados en esta sección'
                  }
                </p>
                <p className="text-gray-400 text-sm">
                  {!selectedSectionId 
                    ? 'Elige una sección de la lista superior'
                    : 'Los estudiantes aparecerán aquí cuando se matriculen'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Student Profile Modal */}
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfile}
          student={selectedStudent}
          sectionId={selectedSectionId || 0}
        />
      </div>
    </div>
  )
}
