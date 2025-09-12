import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { DirectorDashboard } from '../director/DirectorDashboard'
import { ProfesorDashboard } from './ProfesorDashboard'
import { AlumnoDashboard } from './AlumnoDashboard'

export function DashboardRouter() {
  const { user } = useAuthStore()

  const renderDashboard = () => {
    switch (user?.role) {
      case 'DIRECTOR':
        return <DirectorDashboard />
      case 'PROFESOR':
        return <ProfesorDashboard />
      case 'ALUMNO':
        return <AlumnoDashboard />
      default:
        return <AlumnoDashboard />
    }
  }

  return (
    <Routes>
      <Route path="/" element={renderDashboard()} />
    </Routes>
  )
}