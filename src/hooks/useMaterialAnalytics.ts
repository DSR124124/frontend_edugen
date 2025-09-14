import { useQuery } from '@tanstack/react-query'
import { materialTrackingApi, ProfessorAnalytics, MaterialAnalytics, MaterialViewingSession, MaterialInteraction } from '../api/endpoints'

export const useMaterialAnalytics = () => {
  return useQuery({
    queryKey: ['material-analytics'],
    queryFn: () => materialTrackingApi.getMaterialAnalytics().then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useProfessorAnalytics = () => {
  return useQuery({
    queryKey: ['professor-analytics'],
    queryFn: () => materialTrackingApi.getProfessorAnalytics().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export const useViewingSessions = () => {
  return useQuery({
    queryKey: ['viewing-sessions'],
    queryFn: () => materialTrackingApi.getViewingSessions().then(res => res.data),
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}

export const useMaterialInteractions = () => {
  return useQuery({
    queryKey: ['material-interactions'],
    queryFn: () => materialTrackingApi.getMaterialInteractions().then(res => res.data),
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}

export const useMyMaterialsWithAnalytics = () => {
  return useQuery({
    queryKey: ['my-materials-analytics'],
    queryFn: () => materialTrackingApi.getMyMaterials().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}
