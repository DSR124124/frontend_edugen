import { useState, useCallback, useRef, useEffect } from 'react'
import { materialTrackingApi, MaterialTrackingData } from '../api/endpoints'
import { useAuthStore } from '../store/auth'

export const useMaterialTracking = () => {
  const { user } = useAuthStore()
  const [isTracking, setIsTracking] = useState(false)
  const [currentSession, setCurrentSession] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const trackingInterval = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)
  const lastProgress = useRef(0)

  // Función para enviar tracking al backend
  const sendTracking = useCallback(async (data: MaterialTrackingData) => {
    if (user?.role !== 'ALUMNO') {
      console.log('Tracking disabled: User is not a student, role:', user?.role)
      return
    }

    try {
      // Validar datos antes de enviar
      if (!data.material_id || data.material_id <= 0) {
        console.warn('Invalid material ID for tracking:', data.material_id)
        return
      }

      console.log('Sending tracking data:', data)
      const response = await materialTrackingApi.trackMaterial(data)
      console.log('Tracking response:', response.data)
      
      if (response.data?.session_id) {
        setCurrentSession(response.data.session_id)
      }
      return response.data
    } catch (error) {
      console.error('Error tracking material:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      })
      // No lanzar el error para evitar interrumpir la experiencia del usuario
      return null
    }
  }, [user?.role])

  // Iniciar tracking de un material
  const startTracking = useCallback(async (materialId: number) => {
    if (user?.role !== 'ALUMNO') {
      console.log('Tracking disabled: User is not a student')
      return
    }

    if (!materialId || materialId <= 0) {
      console.warn('Invalid material ID for tracking:', materialId)
      return
    }

    setIsTracking(true)
    startTime.current = Date.now()
    setProgress(0)
    setDuration(0)

    // Enviar evento de inicio
    await sendTracking({
      material_id: materialId,
      action: 'start',
      progress_percentage: 0,
      duration_seconds: 0
    })

    // Iniciar intervalo de tracking cada 10 segundos
    trackingInterval.current = setInterval(async () => {
      if (startTime.current) {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000)
        setDuration(elapsed)
        
        // Solo enviar actualización si el progreso ha cambiado significativamente
        if (Math.abs(progress - lastProgress.current) >= 5) {
          await sendTracking({
            material_id: materialId,
            action: 'resume',
            progress_percentage: progress,
            duration_seconds: elapsed
          })
          lastProgress.current = progress
        }
      }
    }, 10000) // Cada 10 segundos
  }, [user?.role, progress, sendTracking])

  // Pausar tracking
  const pauseTracking = useCallback(async (materialId: number) => {
    if (!isTracking || user?.role !== 'ALUMNO') return

    if (trackingInterval.current) {
      clearInterval(trackingInterval.current)
      trackingInterval.current = null
    }

    await sendTracking({
      material_id: materialId,
      action: 'pause',
      progress_percentage: progress,
      duration_seconds: duration
    })
  }, [isTracking, user?.role, progress, duration, sendTracking])

  // Reanudar tracking
  const resumeTracking = useCallback(async (materialId: number) => {
    if (isTracking || user?.role !== 'ALUMNO') return

    setIsTracking(true)
    startTime.current = Date.now()

    await sendTracking({
      material_id: materialId,
      action: 'resume',
      progress_percentage: progress,
      duration_seconds: duration
    })

    // Reanudar intervalo
    trackingInterval.current = setInterval(async () => {
      if (startTime.current) {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000)
        setDuration(elapsed)
        
        if (Math.abs(progress - lastProgress.current) >= 5) {
          await sendTracking({
            material_id: materialId,
            action: 'resume',
            progress_percentage: progress,
            duration_seconds: elapsed
          })
          lastProgress.current = progress
        }
      }
    }, 10000)
  }, [isTracking, user?.role, progress, duration, sendTracking])

  // Actualizar progreso
  const updateProgress = useCallback((newProgress: number, materialId: number) => {
    setProgress(newProgress)
    
    // Enviar evento de búsqueda si el cambio es significativo
    if (Math.abs(newProgress - lastProgress.current) >= 10) {
      sendTracking({
        material_id: materialId,
        action: 'seek',
        progress_percentage: newProgress,
        duration_seconds: duration,
        metadata: { progress_change: newProgress - lastProgress.current }
      })
      lastProgress.current = newProgress
    }
  }, [duration, sendTracking])

  // Completar tracking
  const completeTracking = useCallback(async (materialId: number) => {
    if (!isTracking || user?.role !== 'ALUMNO') return

    if (trackingInterval.current) {
      clearInterval(trackingInterval.current)
      trackingInterval.current = null
    }

    setIsTracking(false)
    setProgress(100)
    setCurrentSession(null)

    await sendTracking({
      material_id: materialId,
      action: 'complete',
      progress_percentage: 100,
      duration_seconds: duration
    })
  }, [isTracking, user?.role, duration, sendTracking])

  // Abandonar tracking
  const abandonTracking = useCallback(async (materialId: number) => {
    if (!isTracking || user?.role !== 'ALUMNO') return

    if (trackingInterval.current) {
      clearInterval(trackingInterval.current)
      trackingInterval.current = null
    }

    setIsTracking(false)
    setCurrentSession(null)

    await sendTracking({
      material_id: materialId,
      action: 'abandon',
      progress_percentage: progress,
      duration_seconds: duration
    })
  }, [isTracking, user?.role, progress, duration, sendTracking])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current)
      }
    }
  }, [])

  return {
    isTracking,
    currentSession,
    progress,
    duration,
    startTracking,
    pauseTracking,
    resumeTracking,
    updateProgress,
    completeTracking,
    abandonTracking
  }
}
