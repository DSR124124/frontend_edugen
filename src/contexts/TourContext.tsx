import React, { useState, useCallback, ReactNode } from 'react'
import Joyride, { CallBackProps, STATUS } from 'react-joyride'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { getTourSteps } from '../config/tourSteps'
import { TourContext } from './TourContextDefinition'

interface TourProviderProps {
  children: ReactNode
}


export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTourType, setCurrentTourType] = useState('general')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const startTour = useCallback((tourType: string = 'general') => {
    setCurrentTourType(tourType)
    setIsRunning(true)
  }, [])

  const stopTour = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetTour = useCallback(() => {
    setIsRunning(false)
    setCurrentTourType('general')
  }, [])

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, action, index } = data

    // Navegación automática para tours del director
    if (user?.role === 'DIRECTOR') {
      const steps = getTourSteps(user.role, currentTourType)
      const currentStep = steps[index]

      // Tour académico
      if (currentTourType === 'academic') {
        if (currentStep?.target === '[data-tour="grades-link"]' && action === 'next') {
          // Navegar a la página de grados
          setTimeout(() => {
            navigate('/director/grades')
          }, 500)
        } else if (currentStep?.target === '[data-tour="periods-link"]' && action === 'next') {
          // Navegar a la página de períodos
          setTimeout(() => {
            navigate('/director/terms')
          }, 500)
        } else if (currentStep?.target === '[data-tour="sections-link"]' && action === 'next') {
          // Navegar a la página de secciones
          setTimeout(() => {
            navigate('/director/sections')
          }, 500)
        }
      }
      
      // Tour de personas
      if (currentTourType === 'people') {
        if (currentStep?.target === '[data-tour="students-link"]' && action === 'next') {
          // Navegar a la página de estudiantes
          setTimeout(() => {
            navigate('/director/students')
          }, 500)
        } else if (currentStep?.target === '[data-tour="professors-link"]' && action === 'next') {
          // Navegar a la página de profesores
          setTimeout(() => {
            navigate('/director/professors')
          }, 500)
        }
      }
      
      // Tour de administración
      if (currentTourType === 'administration') {
        if (currentStep?.target === '[data-tour="institution-link"]' && action === 'next') {
          // Navegar a la página de institución
          setTimeout(() => {
            navigate('/director/institution')
          }, 500)
        } else if (currentStep?.target === '[data-tour="settings-link"]' && action === 'next') {
          // Navegar a la página de configuración
          setTimeout(() => {
            navigate('/profile')
          }, 500)
        }
      }
    }
    
    // Navegación automática para tours del profesor
    if (user?.role === 'PROFESOR') {
      const steps = getTourSteps(user.role, currentTourType)
      const currentStep = steps[index]

      // Tour de docencia
      if (currentTourType === 'teaching') {
        if (currentStep?.target === '[data-tour="courses-link"]' && action === 'next') {
          // Navegar a la página de cursos
          setTimeout(() => {
            navigate('/professor/courses')
          }, 500)
        } else if (currentStep?.target === '[data-tour="sections-link"]' && action === 'next') {
          // Navegar a la página de secciones
          setTimeout(() => {
            navigate('/professor/sections')
          }, 500)
        } else if (currentStep?.target === '[data-tour="students-link"]' && action === 'next') {
          // Navegar a la página de estudiantes
          setTimeout(() => {
            navigate('/professor/students')
          }, 500)
        } else if (currentStep?.target === '[data-tour="portfolios-link"]' && action === 'next') {
          // Navegar a la página de portafolios
          setTimeout(() => {
            navigate('/professor/portfolios')
          }, 500)
        } else if (currentStep?.target === '[data-tour="topics-link"]' && action === 'next') {
          // Navegar a la página de temas
          setTimeout(() => {
            navigate('/professor/topics')
          }, 500)
        }
      }
      
      // Tour de contenido & IA
      if (currentTourType === 'ai-content') {
        if (currentStep?.target === '[data-tour="ai-generator-link"]' && action === 'next') {
          // Navegar a la página de IA generador
          setTimeout(() => {
            navigate('/ai-content')
          }, 500)
        } else if (currentStep?.target === '[data-tour="generated-content-link"]' && action === 'next') {
          // Navegar a la página de contenidos generados
          setTimeout(() => {
            navigate('/generated-content')
          }, 500)
        }
      }
      
      // Tour de gestión
      if (currentTourType === 'management') {
        if (currentStep?.target === '[data-tour="analytics-link"]' && action === 'next') {
          // Navegar a la página de analytics
          setTimeout(() => {
            navigate('/material-analytics')
          }, 500)
        } else if (currentStep?.target === '[data-tour="settings-link"]' && action === 'next') {
          // Navegar a la página de configuración
          setTimeout(() => {
            navigate('/profile')
          }, 500)
        }
      }
    }

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setIsRunning(false)
    }
  }, [currentTourType, user?.role, navigate])

  const steps = getTourSteps(user?.role || 'ALUMNO', currentTourType)

  return (
    <TourContext.Provider value={{ isRunning, currentTourType, startTour, stopTour, resetTour }}>
      {children}
      <Joyride
        steps={steps}
        run={isRunning}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: 'var(--color-primary)',
            textColor: 'var(--color-base-content)',
            backgroundColor: 'var(--color-base-100)',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            arrowColor: 'var(--color-base-100)',
          },
          tooltip: {
            borderRadius: 8,
            fontSize: 14,
            padding: 20,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 10,
          },
          tooltipContent: {
            padding: 0,
          },
          buttonNext: {
            backgroundColor: 'var(--color-primary)',
            borderRadius: 6,
            color: 'white',
            fontSize: 14,
            fontWeight: 'bold',
            padding: '10px 20px',
          },
          buttonBack: {
            color: 'var(--color-base-content)',
            marginRight: 10,
            fontSize: 14,
          },
          buttonSkip: {
            color: 'var(--color-base-content)',
            fontSize: 14,
          },
          beacon: {
            accentColor: 'var(--color-primary)',
          },
        }}
        locale={{
          back: 'Anterior',
          close: 'Cerrar',
          last: 'Finalizar',
          next: 'Siguiente',
          skip: 'Saltar tour',
        }}
      />
    </TourContext.Provider>
  )
}
