import { http } from './http'

// Types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'DIRECTOR' | 'PROFESOR' | 'ALUMNO'
  institution?: number
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

// Auth endpoints
export const authApi = {
  login: (data: LoginRequest) => 
    http.post<LoginResponse>('accounts/login/', data),
  
  me: () => 
    http.get<User>('accounts/me/'),
  
  logout: () => 
    http.post('accounts/logout/'),
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
