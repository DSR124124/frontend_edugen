import React, { useState, useRef, useEffect } from 'react'
import { useTour } from '../../hooks/useTour'
import { useAuthStore } from '../../store/auth'
import { HelpCircle, ChevronDown, BookOpen, Users, Settings, LayoutDashboard, GraduationCap, Bot, BarChart3 } from 'lucide-react'

interface TourOption {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const directorTourOptions: TourOption[] = [
  {
    id: 'general',
    name: 'Tour General',
    description: 'Recorrido completo del sistema',
    icon: LayoutDashboard,
  },
  {
    id: 'academic',
    name: 'Módulo Académico',
    description: 'Grados, Períodos y Secciones',
    icon: BookOpen,
  },
  {
    id: 'people',
    name: 'Módulo Personas',
    description: 'Estudiantes y Profesores',
    icon: Users,
  },
  {
    id: 'administration',
    name: 'Módulo Administración',
    description: 'Institución y Configuración',
    icon: Settings,
  },
]

const professorTourOptions: TourOption[] = [
  {
    id: 'general',
    name: 'Tour General',
    description: 'Recorrido completo del sistema',
    icon: LayoutDashboard,
  },
  {
    id: 'teaching',
    name: 'Módulo Docencia',
    description: 'Cursos, Secciones, Estudiantes y Portafolios',
    icon: GraduationCap,
  },
  {
    id: 'ai-content',
    name: 'Módulo Contenido & IA',
    description: 'Generador de IA y Contenidos',
    icon: Bot,
  },
  {
    id: 'management',
    name: 'Módulo Gestión',
    description: 'Analytics y Configuración',
    icon: BarChart3,
  },
]

export function TourMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { startTour, currentTourType } = useTour()
  const { user } = useAuthStore()
  const menuRef = useRef<HTMLDivElement>(null)

  const handleTourSelect = (tourType: string) => {
    startTour(tourType)
    setIsOpen(false)
  }

  // Seleccionar opciones según el rol
  const getTourOptions = () => {
    switch (user?.role) {
      case 'DIRECTOR':
        return directorTourOptions
      case 'PROFESOR':
        return professorTourOptions
      default:
        return directorTourOptions
    }
  }

  const tourOptions = getTourOptions()

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Mostrar menú desplegable para directores y profesores, botón simple para otros roles
  if (user?.role !== 'DIRECTOR' && user?.role !== 'PROFESOR') {
    return (
      <button
        onClick={() => startTour()}
        className="p-2 rounded-md transition-colors hover:bg-gray-200 active:bg-gray-300 relative group flex-shrink-0"
        title="Iniciar tour guiado"
      >
        <HelpCircle className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
        
        {/* Tooltip personalizado - Solo en desktop */}
        <div className="hidden sm:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Iniciar tour guiado
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      </button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md transition-colors hover:bg-gray-200 active:bg-gray-300 relative group"
        title="Seleccionar tipo de tour"
      >
        <HelpCircle className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
        <span className="hidden sm:inline text-sm font-medium" style={{ color: 'var(--color-base-content)' }}>
          Tours
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        
        {/* Tooltip personalizado - Solo en desktop */}
        <div className="hidden sm:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Seleccionar tipo de tour
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Tours Disponibles</h3>
            <p className="text-xs text-gray-500 mt-1">Selecciona el tipo de tour que deseas realizar</p>
          </div>
          
          <div className="py-2">
            {tourOptions.map((option) => {
              const Icon = option.icon
              const isSelected = option.id === currentTourType
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleTourSelect(option.id)}
                  className={`w-full flex items-start space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    isSelected 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {option.name}
                      </p>
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {option.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              💡 Tip: Puedes cambiar el tipo de tour en cualquier momento
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
