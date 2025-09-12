import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Login } from '../pages/auth/Login'
import { Logout } from '../pages/auth/Logout'
import { DashboardRouter } from '../pages/dashboard/DashboardRouter'
import { DirectorDashboard } from '../pages/dashboard/DirectorDashboard'
import { StudentsPage } from '../pages/director/StudentsPage'
import { ProfessorsPage } from '../pages/director/ProfessorsPage'
import { GradeLevelsPage } from '../pages/director/GradeLevelsPage'
import { TermsPage } from '../pages/director/TermsPage'
import { SectionsPage } from '../pages/director/SectionsPage'
import { InstitutionPage } from '../pages/director/InstitutionPage'
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
        {user?.role === 'DIRECTOR' && (
          <>
            <Route path="/director" element={<DirectorDashboard />} />
            <Route path="/director/grades" element={<GradeLevelsPage />} />
            <Route path="/director/terms" element={<TermsPage />} />
            <Route path="/director/sections" element={<SectionsPage />} />
            <Route path="/director/students" element={<StudentsPage />} />
            <Route path="/director/professors" element={<ProfessorsPage />} />
            <Route path="/director/institution" element={<InstitutionPage />} />
          </>
        )}
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
