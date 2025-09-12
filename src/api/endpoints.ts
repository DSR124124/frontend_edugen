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

// Director endpoints
export const directorApi = {
  getUsers: () => 
    http.get<User[]>('director/users/'),
  
  createUser: (data: Partial<User> & { password: string }) => 
    http.post<User>('director/users/', data),
  
  updateUser: (id: number, data: Partial<User>) => 
    http.put<User>(`director/users/${id}/`, data),
  
  deleteUser: (id: number) => 
    http.delete(`director/users/${id}/`),
  
  getSections: () => 
    http.get('director/sections/'),
  
  createSection: (data: any) => 
    http.post('director/sections/', data),
  
  updateSection: (id: number, data: any) => 
    http.put(`director/sections/${id}/`, data),
  
  deleteSection: (id: number) => 
    http.delete(`director/sections/${id}/`),
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
