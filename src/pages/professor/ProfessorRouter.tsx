import { Routes, Route } from 'react-router-dom'
import { ProfessorDashboard } from './ProfessorDashboard'
import { MySections } from './MySections'
import { MyStudents } from './MyStudents'
import { MyEvaluations } from './MyEvaluations'

export function ProfessorRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProfessorDashboard />} />
      <Route path="/sections" element={<MySections />} />
      <Route path="/students" element={<MyStudents />} />
      <Route path="/evaluations" element={<MyEvaluations />} />
    </Routes>
  )
}
