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
import { ProfessorRouter } from '../pages/professor/ProfessorRouter'
import { Courses } from '../pages/academic/Courses'
import { Sections } from '../pages/academic/Sections'
import { MyPortfolio } from '../pages/portfolios/MyPortfolio'
import { Profile } from '../pages/settings/Profile'
import { ContentGenerator } from '../pages/ai/ContentGenerator'
import { GeneratedContentPage } from '../pages/professor/GeneratedContentPage'
import { MaterialAnalyticsDashboard } from '../pages/professor/MaterialAnalyticsDashboard'
import { MySectionMaterials } from '../pages/student/MySectionMaterials'
import { MySection } from '../pages/student/MySection'
import { StudentPortfolio } from '../pages/student/StudentPortfolio'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'

export function AppRouter() {
  const { isAuthenticated, user, isTokenExpired } = useAuthStore()

  // Si no está autenticado Y no es por token expirado, redirigir al login
  if (!isAuthenticated && !isTokenExpired) {
    return (
      <AuthLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthLayout>
    )
  }

  // Si el token expiró pero aún está "autenticado" (para mostrar el modal), 
  // mostrar la app pero sin funcionalidad hasta que se resuelva
  if (isTokenExpired) {
    return (
      <AppLayout>
        <Routes>
          <Route path="*" element={<div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Procesando expiración de sesión...</p>
            </div>
          </div>} />
        </Routes>
      </AppLayout>
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
        {user?.role === 'PROFESOR' && (
          <>
            <Route path="/professor/*" element={<ProfessorRouter />} />
            <Route path="/ai-content" element={<ContentGenerator />} />
            <Route path="/generated-content" element={<GeneratedContentPage />} />
            <Route path="/material-analytics" element={<MaterialAnalyticsDashboard />} />
          </>
        )}
        <Route path="/courses" element={<Courses />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/my-section" element={<MySection />} />
        <Route path="/portfolio" element={<MyPortfolio />} />
        <Route path="/student-portfolio" element={<StudentPortfolio />} />
        <Route path="/my-materials" element={<MySectionMaterials />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}
