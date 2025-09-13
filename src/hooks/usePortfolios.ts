import { useState, useCallback, useEffect } from 'react'
import { portfolioApi, Portfolio } from '../api/endpoints'

export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPortfolios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await portfolioApi.getPortfolios()
      setPortfolios(response.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar portafolios'
        : 'Error al cargar portafolios'
      setError(errorMessage)
      setPortfolios([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPortfoliosBySection = useCallback(async (sectionId: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await portfolioApi.getPortfoliosBySection(sectionId)
      setPortfolios(response.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar portafolios'
        : 'Error al cargar portafolios'
      setError(errorMessage)
      setPortfolios([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPortfoliosByCourse = useCallback(async (courseId: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await portfolioApi.getPortfoliosByCourse(courseId)
      setPortfolios(response.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar portafolios'
        : 'Error al cargar portafolios'
      setError(errorMessage)
      setPortfolios([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createPortfolio = useCallback(async (data: { student: number; course: number; section: number; title: string; description?: string }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await portfolioApi.createPortfolio(data)
      setPortfolios(prev => [...prev, response.data])
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al crear portafolio'
        : 'Error al crear portafolio'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePortfolio = useCallback(async (id: number, data: { title?: string; description?: string; is_public?: boolean }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await portfolioApi.updatePortfolio(id, data)
      setPortfolios(prev => prev.map(portfolio => 
        portfolio.id === id ? response.data : portfolio
      ))
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al actualizar portafolio'
        : 'Error al actualizar portafolio'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePortfolio = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await portfolioApi.deletePortfolio(id)
      setPortfolios(prev => prev.filter(portfolio => portfolio.id !== id))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al eliminar portafolio'
        : 'Error al eliminar portafolio'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPortfolios()
  }, [loadPortfolios])

  return {
    portfolios,
    loading,
    error,
    loadPortfolios,
    loadPortfoliosBySection,
    loadPortfoliosByCourse,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  }
}
