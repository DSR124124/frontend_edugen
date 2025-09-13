import { http } from './http'

// Types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'DIRECTOR' | 'PROFESOR' | 'ALUMNO'
  specialty?: string
  specialty_display?: string
  institution?: number
  section?: number
  section_name?: string
  assigned_sections?: Array<{id: number, name: string, grade_level_name?: string, term_name?: string}>
  created_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface DashboardData {
  user_role: string
  message: string
  stats: {
    total_courses: number
    total_students: number
    total_professors: number
  }
}

export interface GradeLevel {
  id: number
  name: string
  level: number
  institution: number
  created_at: string
}

export interface Term {
  id: number
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  institution: number
  created_at: string
}

export interface Section {
  id: number
  name: string
  professors: number[]
  professors_names?: string[]
  capacity: number
  created_at: string
  course?: {
    id: number
    name: string
    code: string
  }
  grade_level?: {
    id: number
    name: string
    level: number
  }
  term?: {
    id: number
    name: string
    is_active: boolean
  }
}

export interface Institution {
  id: number
  name: string
  code: string
  address: string
  phone: string
  email: string
  created_at: string
  updated_at: string
}

// Auth endpoints
export const authApi = {
  login: (data: LoginRequest) => 
    http.post<LoginResponse>('accounts/login/', data),
  
  me: () => 
    http.get<User>('accounts/me/'),
  
  logout: () => 
    http.post('accounts/logout/'),
}

// Users endpoints
export const usersApi = {
  getUsers: () => 
    http.get<User[]>('accounts/'),
  
  getUser: (id: number) => 
    http.get<User>(`accounts/${id}/`),
  
  updateUser: (id: number, data: Partial<User>) => 
    http.patch<User>(`accounts/${id}/`, data),
  
  createUser: (data: Partial<User>) => 
    http.post<User>('accounts/', data),
  
  deleteUser: (id: number) => 
    http.delete(`accounts/${id}/`),
}

// Director endpoints
export const directorApi = {
  getUsers: () => 
    http.get<User[]>('director/users/'),
  
  createUser: (data: Partial<User> & { password: string }) => 
    http.post<User>('director/users/', data),
  
  updateUser: (id: number, data: Partial<User>) => 
    http.patch<User>(`director/users/${id}/`, data),
  
  deleteUser: (id: number) => 
    http.delete(`director/users/${id}/`),
  
  getSections: () => 
    http.get<Section[]>('director/sections/'),
  
  createSection: (data: Partial<Section>) => 
    http.post<Section>('director/sections/', data),
  
  updateSection: (id: number, data: Partial<Section>) => 
    http.put<Section>(`director/sections/${id}/`, data),
  
  deleteSection: (id: number) => 
    http.delete(`director/sections/${id}/`),
  
  getGradeLevels: () => 
    http.get<GradeLevel[]>('director/grade-levels/'),
  
  createGradeLevel: (data: Partial<GradeLevel>) => 
    http.post<GradeLevel>('director/grade-levels/', data),
  
  updateGradeLevel: (id: number, data: Partial<GradeLevel>) => 
    http.put<GradeLevel>(`director/grade-levels/${id}/`, data),
  
  deleteGradeLevel: (id: number) => 
    http.delete(`director/grade-levels/${id}/`),
  
  getTerms: () => 
    http.get<Term[]>('director/terms/'),
  
  createTerm: (data: Partial<Term>) => 
    http.post<Term>('director/terms/', data),
  
  updateTerm: (id: number, data: Partial<Term>) => 
    http.put<Term>(`director/terms/${id}/`, data),
  
  deleteTerm: (id: number) => 
    http.delete(`director/terms/${id}/`),
  
  getInstitution: () => 
    http.get<Institution>('director/institution/'),
  
  updateInstitution: (data: Partial<Institution>) => 
    http.patch<Institution>('director/institution/', data),
  
  getSectionOptions: () => 
    http.get<{
      professors: Array<{id: number, first_name: string, last_name: string, username: string}>,
      terms: Array<{id: number, name: string, is_active: boolean}>,
      grade_levels: Array<{id: number, name: string, level: number}>
    }>('director/sections/options/'),
}

// Dashboard endpoints
export const dashboardApi = {
  getDashboard: () => 
    http.get<DashboardData>('dashboard/'),
}

// Academic endpoints
export const academicApi = {
  getCourses: () => 
    http.get('academic/courses/'),
  
  getSections: () => 
    http.get('academic/sections/'),
  
  getEnrollments: () => 
    http.get('academic/enrollments/'),
  
  getStudentsBySection: (sectionId: number) => 
    http.get(`academic/sections/${sectionId}/students/`),
}

// Portfolio endpoints
export const portfolioApi = {
  getPortfolio: () => 
    http.get('portfolio/portfolios/'),
  
  getArtifacts: () => 
    http.get('portfolio/artifacts/'),
}

// Analytics endpoints
export const analyticsApi = {
  getKPIs: () => 
    http.get('analytics/kpis/'),
}
