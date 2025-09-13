import { Routes, Route } from 'react-router-dom'
import { ProfessorDashboard } from './ProfessorDashboard'
import { MySections } from './MySections'
import { MyStudents } from './MyStudents'
import { MyCourses } from './MyCourses'
import { PortfolioManagement } from './PortfolioManagement'
import { TopicsPage } from './TopicsPage'

export function ProfessorRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProfessorDashboard />} />
      <Route path="/courses" element={<MyCourses />} />
      <Route path="/topics" element={<TopicsPage />} />
      <Route path="/sections" element={<MySections />} />
      <Route path="/students" element={<MyStudents />} />
      <Route path="/portfolios" element={<PortfolioManagement />} />
    </Routes>
  )
}
