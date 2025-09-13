import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { directorApi, GradeLevel, Term, Section, Institution } from '../api/endpoints'

export function useDirectorGradeLevels() {
  const queryClient = useQueryClient()

  const { data: gradeLevels = [], isLoading, error } = useQuery({
    queryKey: ['director', 'grade-levels'],
    queryFn: () => directorApi.getGradeLevels().then(res => res.data),
  })

  const createGradeLevel = useMutation({
    mutationFn: (data: Partial<GradeLevel>) => directorApi.createGradeLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'grade-levels'] })
    },
  })

  const updateGradeLevel = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GradeLevel> }) => 
      directorApi.updateGradeLevel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'grade-levels'] })
    },
  })

  const deleteGradeLevel = useMutation({
    mutationFn: (id: number) => directorApi.deleteGradeLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'grade-levels'] })
    },
  })

  return {
    gradeLevels,
    isLoading,
    error,
    createGradeLevel,
    updateGradeLevel,
    deleteGradeLevel,
  }
}

export function useDirectorTerms() {
  const queryClient = useQueryClient()

  const { data: terms = [], isLoading, error } = useQuery({
    queryKey: ['director', 'terms'],
    queryFn: () => directorApi.getTerms().then(res => res.data),
  })

  const createTerm = useMutation({
    mutationFn: (data: Partial<Term>) => directorApi.createTerm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'terms'] })
    },
  })

  const updateTerm = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Term> }) => 
      directorApi.updateTerm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'terms'] })
    },
  })

  const deleteTerm = useMutation({
    mutationFn: (id: number) => directorApi.deleteTerm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'terms'] })
    },
  })

  return {
    terms,
    isLoading,
    error,
    createTerm,
    updateTerm,
    deleteTerm,
  }
}

export function useDirectorSections() {
  const queryClient = useQueryClient()

  const { data: sections = [], isLoading, error } = useQuery({
    queryKey: ['director', 'sections'],
    queryFn: () => directorApi.getSections().then(res => res.data),
  })

  const createSection = useMutation({
    mutationFn: (data: Partial<Section>) => directorApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'sections'] })
    },
  })

  const updateSection = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Section> }) => 
      directorApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'sections'] })
    },
  })

  const deleteSection = useMutation({
    mutationFn: (id: number) => directorApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'sections'] })
    },
  })

  return {
    sections,
    isLoading,
    error,
    createSection,
    updateSection,
    deleteSection,
  }
}

export function useDirectorInstitution() {
  const queryClient = useQueryClient()

  const { data: institution, isLoading, error } = useQuery({
    queryKey: ['director', 'institution'],
    queryFn: () => directorApi.getInstitution().then(res => res.data),
  })

  const updateInstitution = useMutation({
    mutationFn: (data: Partial<Institution>) => directorApi.updateInstitution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director', 'institution'] })
    },
  })

  return {
    institution,
    isLoading,
    error,
    updateInstitution,
  }
}
