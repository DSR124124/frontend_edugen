import { useQuery } from '@tanstack/react-query'
import { academicApi } from '../api/endpoints'

export function useProfessorMaterials() {
  return useQuery({
    queryKey: ['professor-materials'],
    queryFn: async () => {
      const response = await academicApi.getMaterials()
      return response.data.results || response.data
    }
  })
}
