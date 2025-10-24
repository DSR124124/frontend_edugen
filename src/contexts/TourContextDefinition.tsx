import { createContext } from 'react'

interface TourContextType {
  isRunning: boolean
  currentTourType: string
  startTour: (tourType?: string) => void
  stopTour: () => void
  resetTour: () => void
}

export const TourContext = createContext<TourContextType | undefined>(undefined)
