import { useQuery } from '@tanstack/react-query'
import { academicApi } from '../api/endpoints'

export function useActiveStudents() {
  return useQuery({
    queryKey: ['active-students'],
    queryFn: async () => {
      try {
        // Obtener todas las secciones del profesor
        const sectionsResponse = await academicApi.getMySections()
        const sections = sectionsResponse.data
        
        // Contar estudiantes activos de todas las secciones
        let totalActiveStudents = 0
        
        for (const section of sections) {
          try {
            const studentsResponse = await academicApi.getStudentsBySection(section.id)
            
            // Manejar diferentes estructuras de respuesta
            let students = []
            if (studentsResponse.data) {
              if (Array.isArray(studentsResponse.data)) {
                students = studentsResponse.data
              } else if (studentsResponse.data.results && Array.isArray(studentsResponse.data.results)) {
                students = studentsResponse.data.results
              } else if (studentsResponse.data.students && Array.isArray(studentsResponse.data.students)) {
                students = studentsResponse.data.students
              }
            }
            
            totalActiveStudents += students.length
          } catch (error) {
            // Silenciar errores individuales de secciones
          }
        }
        
        return totalActiveStudents
      } catch (error) {
        return 0
      }
    }
  })
}
