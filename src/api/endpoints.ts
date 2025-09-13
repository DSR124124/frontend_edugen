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

export interface Topic {
  id: number
  name: string
  description?: string
  course: number
  course_name: string
  course_code: string
  professor: number
  professor_name: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// AI Content Generator Types
export interface Conversation {
  id: number
  user: number
  user_name: string
  session_id: string
  title: string
  requirements: any
  is_active: boolean
  created_at: string
  updated_at: string
  messages: ConversationMessage[]
  messages_count: number
}

export interface ConversationMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ContentTemplate {
  id: number
  name: string
  description: string
  prompt_template: string
  grapesjs_config: any
  is_active: boolean
  created_at: string
}

export interface GeneratedContent {
  id: number
  conversation: number
  conversation_title: string
  user_name: string
  title: string
  html_content: string
  css_content: string
  js_content: string
  grapesjs_components: any
  is_public: boolean
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
  
  getMySections: () => 
    http.get('academic/sections/my-sections/'),
  
  getEnrollments: () => 
    http.get('academic/enrollments/'),
  
  getStudentsBySection: (sectionId: number) => 
    http.get(`academic/sections/${sectionId}/students/`),
  
  getGradeLevels: () => 
    http.get('institutions/grade-levels/'),
  
  getUser: () => 
    http.get('accounts/me/'),
  
  createCourse: (data: { name: string; code: string; description?: string; credits?: number }) => 
    http.post('academic/courses/', data),
  
  updateCourse: (courseId: number, data: { name: string; code: string; description?: string; credits?: number }) => 
    http.put(`academic/courses/${courseId}/`, data),
  
  deleteCourse: (courseId: number) => 
    http.delete(`academic/courses/${courseId}/`),
  
  assignCourseToSections: (courseId: number, data: { section_ids: number[]; grade_level_id?: number }) => 
    http.post(`academic/courses/${courseId}/assign-to-sections/`, data),
  
  // Topics endpoints
  getTopics: () => 
    http.get<Topic[]>('academic/topics/'),
  
  getTopic: (id: number) => 
    http.get<Topic>(`academic/topics/${id}/`),
  
  getTopicsByCourse: (courseId: number) => 
    http.get<Topic[]>(`academic/topics/by-course/${courseId}/`),
  
  createTopic: (data: { name: string; description?: string; course: number }) => 
    http.post<Topic>('academic/topics/', data),
  
  updateTopic: (id: number, data: { name?: string; description?: string; order?: number; is_active?: boolean }) => 
    http.put<Topic>(`academic/topics/${id}/`, data),
  
  deleteTopic: (id: number) => 
    http.delete(`academic/topics/${id}/`),
}


// Analytics endpoints
export const analyticsApi = {
  getKPIs: () => 
    http.get('analytics/kpis/'),
}

// Portfolio and Activity interfaces
export interface PortfolioCourse {
  id: number
  course: number
  course_name: string
  course_code: string
  added_at: string
  topics: Topic[]
}

export interface Portfolio {
  id: number
  student: number
  section: number
  title: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
  student_name: string
  section_name: string
  courses: PortfolioCourse[]
  activity_assignments_count: number
  completed_assignments_count: number
}

export interface Activity {
  id: number
  professor: number
  course: number
  section: number
  title: string
  description: string
  activity_type: 'GROUP' | 'INDIVIDUAL'
  activity_type_display: string
  instructions: string
  due_date: string
  points: number
  is_active: boolean
  created_at: string
  updated_at: string
  professor_name: string
  course_name: string
  section_name: string
  assignments_count: number
  completed_assignments_count: number
}

export interface ActivityAssignment {
  id: number
  activity: number
  student: number
  portfolio: number
  assigned_at: string
  completed_at?: string
  is_completed: boolean
  grade?: number
  feedback?: string
  submission_notes?: string
  student_name: string
  activity_title: string
  portfolio_title: string
  days_until_due?: number
  artifacts: Artifact[]
}

export interface Artifact {
  id: number
  assignment: number
  title: string
  description?: string
  file: string
  file_url?: string
  artifact_type: string
  created_at: string
  assignment_title: string
}

// Portfolio and Activity endpoints
export const portfolioApi = {
  getPortfolios: () => 
    http.get<Portfolio[]>('portfolio/portfolios/'),
  
  getPortfolio: (id: number) => 
    http.get<Portfolio>(`portfolio/portfolios/${id}/`),
  
  getPortfoliosByCourse: (courseId: number) => 
    http.get<Portfolio[]>(`portfolio/portfolios/by-course/?course_id=${courseId}`),
  
  getPortfoliosBySection: (sectionId: number) => 
    http.get<Portfolio[]>(`portfolio/portfolios/by-section/?section_id=${sectionId}`),
  
  createPortfolio: (data: { student: number; course: number; section: number; title: string; description?: string }) => 
    http.post<Portfolio>('portfolio/portfolios/', data),
  
  updatePortfolio: (id: number, data: { title?: string; description?: string; is_public?: boolean }) => 
    http.patch<Portfolio>(`portfolio/portfolios/${id}/`, data),
  
  deletePortfolio: (id: number) => 
    http.delete(`portfolio/portfolios/${id}/`),
}

export const activityApi = {
  getActivities: () => 
    http.get<Activity[]>('portfolio/activities/'),
  
  getActivity: (id: number) => 
    http.get<Activity>(`portfolio/activities/${id}/`),
  
  getActivitiesByCourse: (courseId: number) => 
    http.get<Activity[]>(`portfolio/activities/by-course/?course_id=${courseId}`),
  
  getActivitiesBySection: (sectionId: number) => 
    http.get<Activity[]>(`portfolio/activities/by-section/?section_id=${sectionId}`),
  
  createActivity: (data: { course: number; section: number; title: string; description: string; activity_type: 'GROUP' | 'INDIVIDUAL'; instructions: string; due_date: string; points: number }) => 
    http.post<Activity>('portfolio/activities/', data),
  
  updateActivity: (id: number, data: { title?: string; description?: string; instructions?: string; due_date?: string; points?: number; is_active?: boolean }) => 
    http.patch<Activity>(`portfolio/activities/${id}/`, data),
  
  deleteActivity: (id: number) => 
    http.delete(`portfolio/activities/${id}/`),
  
  assignToStudents: (id: number, data: { student_ids: number[] }) => 
    http.post<ActivityAssignment[]>(`portfolio/activities/${id}/assign-to-students/`, data),
  
  assignToAllStudents: (id: number) => 
    http.post<ActivityAssignment[]>(`portfolio/activities/${id}/assign-to-all-students/`, {}),
}

export const assignmentApi = {
  getAssignments: () => 
    http.get<ActivityAssignment[]>('portfolio/assignments/'),
  
  getAssignment: (id: number) => 
    http.get<ActivityAssignment>(`portfolio/assignments/${id}/`),
  
  submitAssignment: (id: number, data: { submission_notes?: string }) => 
    http.post<ActivityAssignment>(`portfolio/assignments/${id}/submit/`, data),
  
  gradeAssignment: (id: number, data: { grade?: number; feedback?: string }) => 
    http.post<ActivityAssignment>(`portfolio/assignments/${id}/grade/`, data),
}

export const artifactApi = {
  getArtifacts: () => 
    http.get<Artifact[]>('portfolio/artifacts/'),
  
  getArtifact: (id: number) => 
    http.get<Artifact>(`portfolio/artifacts/${id}/`),
  
  createArtifact: (data: { assignment: number; title: string; description?: string; file: File; artifact_type: string }) => 
    http.post<Artifact>('portfolio/artifacts/', data),
  
  updateArtifact: (id: number, data: { title?: string; description?: string; artifact_type?: string }) => 
    http.patch<Artifact>(`portfolio/artifacts/${id}/`, data),
  
  deleteArtifact: (id: number) => 
    http.delete(`portfolio/artifacts/${id}/`),
}

// AI Content Generator API
export const aiContentApi = {
  // Conversations
  getConversations: () =>
    http.get<Conversation[]>('ai/conversations/'),

  createConversation: (data: { title?: string }) =>
    http.post<Conversation>('ai/conversations/', data),

  getConversation: (id: number) =>
    http.get<Conversation>(`ai/conversations/${id}/`),

  updateConversation: (id: number, data: { title?: string; is_active?: boolean }) =>
    http.patch<Conversation>(`ai/conversations/${id}/`, data),

  deleteConversation: (id: number) =>
    http.delete(`ai/conversations/${id}/`),

  // Messages
  getMessages: (conversationId: number) =>
    http.get<ConversationMessage[]>(`ai/conversations/${conversationId}/messages/`),

  sendMessage: (conversationId: number, data: { content: string }) =>
    http.post<{ user_message: ConversationMessage; assistant_message: ConversationMessage }>(
      `ai/conversations/${conversationId}/send-message/`,
      data
    ),

  // Requirements
  extractRequirements: (conversationId: number) =>
    http.post<{ requirements: any; message: string }>(
      `ai/conversations/${conversationId}/extract-requirements/`
    ),

  // Content Generation
  generateContent: (conversationId: number, data: { requirements: any; title: string }) =>
    http.post<{ content: GeneratedContent; message: string }>(
      `ai/conversations/${conversationId}/generate-content/`,
      data
    ),

  generateContentStreaming: (conversationId: number, data: { requirements: any; title: string }) =>
    http.post<{ content: GeneratedContent; message: string }>(
      `ai/conversations/${conversationId}/generate-content-streaming/`,
      data
    ),

  // Templates
  getTemplates: () =>
    http.get<ContentTemplate[]>('ai/templates/'),

  getTemplate: (id: number) =>
    http.get<ContentTemplate>(`ai/templates/${id}/`),

  // Generated Content
  getGeneratedContent: () =>
    http.get<GeneratedContent[]>('ai/generated-content/'),

  getGeneratedContentById: (id: number) =>
    http.get<GeneratedContent>(`ai/generated-content/${id}/`),

  updateGeneratedContent: (id: number, data: { title?: string; is_public?: boolean; grapesjs_components?: any }) =>
    http.patch<GeneratedContent>(`ai/generated-content/${id}/`, data),

  deleteGeneratedContent: (id: number) =>
    http.delete(`ai/generated-content/${id}/`),
}
