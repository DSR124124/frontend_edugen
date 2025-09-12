import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Login } from '../pages/auth/Login'
import { Logout } from '../pages/auth/Logout'
import { DashboardRouter } from '../pages/dashboard/DashboardRouter'
import { Courses } from '../pages/academic/Courses'
import { Sections } from '../pages/academic/Sections'
import { MyPortfolio } from '../pages/portfolios/MyPortfolio'
import { Profile } from '../pages/settings/Profile'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'

export function AppRouter() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthLayout>
    )
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard/*" element={<DashboardRouter />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/portfolio" element={<MyPortfolio />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}
