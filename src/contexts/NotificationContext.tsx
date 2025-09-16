import { createContext } from 'react'
import { NotificationContextType } from '../types/notifications'

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)
