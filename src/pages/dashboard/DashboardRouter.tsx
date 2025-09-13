import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { DirectorDashboard } from './DirectorDashboard'
import { AlumnoDashboard } from './AlumnoDashboard'

export function DashboardRouter() {
  const { user } = useAuthStore()

  const renderDashboard = () => {
    switch (user?.role) {
      case 'DIRECTOR':
        return <DirectorDashboard />
      case 'PROFESOR':
        return <Navigate to="/professor" replace />
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