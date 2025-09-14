import { useQuery } from '@tanstack/react-query'
import { http } from '../api/http'

export interface Classmate {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  enrolled_at: string
  is_active: boolean
}

export interface ClassmatesResponse {
  section: {
    id: number
    name: string
    course_name?: string
    grade_level_name?: string
    term_name?: string
  }
  students: Classmate[]
  total_students: number
}

export function useClassmates(sectionId: number | undefined) {
  return useQuery<ClassmatesResponse>({
    queryKey: ['classmates', sectionId],
    queryFn: async () => {
      if (!sectionId) throw new Error('Section ID is required')
      
      const response = await http.get(`academic/sections/${sectionId}/students/`)
      return response.data as ClassmatesResponse
    },
    enabled: !!sectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
