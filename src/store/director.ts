import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../api/endpoints'

interface DirectorState {
  // Users management
  users: User[]
  professors: User[]
  students: User[]
  
  // Loading states
  usersLoading: boolean
  sectionsLoading: boolean
  
  // Error states
  usersError: string | null
  sectionsError: string | null
  
  // Actions
  setUsers: (users: User[]) => void
  setProfessors: (professors: User[]) => void
  setStudents: (students: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: number, user: Partial<User>) => void
  removeUser: (id: number) => void
  
  setUsersLoading: (loading: boolean) => void
  setSectionsLoading: (loading: boolean) => void
  
  setUsersError: (error: string | null) => void
  setSectionsError: (error: string | null) => void
  
  clearErrors: () => void
  reset: () => void
}

export const useDirectorStore = create<DirectorState>()(
  persist(
    (set, get) => ({
      // Initial state
      users: [],
      professors: [],
      students: [],
      usersLoading: false,
      sectionsLoading: false,
      usersError: null,
      sectionsError: null,

      // User management actions
      setUsers: (users) => {
        const professors = users.filter(user => user.role === 'PROFESOR')
        const students = users.filter(user => user.role === 'ALUMNO')
        
        set({
          users,
          professors,
          students,
        })
      },

      setProfessors: (professors) => {
        set({ professors })
      },

      setStudents: (students) => {
        set({ students })
      },

      addUser: (user) => {
        const currentUsers = get().users
        const newUsers = [...currentUsers, user]
        
        set({
          users: newUsers,
          professors: newUsers.filter(u => u.role === 'PROFESOR'),
          students: newUsers.filter(u => u.role === 'ALUMNO'),
        })
      },

      updateUser: (id, updatedUser) => {
        const currentUsers = get().users
        const newUsers = currentUsers.map(user => 
          user.id === id ? { ...user, ...updatedUser } : user
        )
        
        set({
          users: newUsers,
          professors: newUsers.filter(u => u.role === 'PROFESOR'),
          students: newUsers.filter(u => u.role === 'ALUMNO'),
        })
      },

      removeUser: (id) => {
        const currentUsers = get().users
        const newUsers = currentUsers.filter(user => user.id !== id)
        
        set({
          users: newUsers,
          professors: newUsers.filter(u => u.role === 'PROFESOR'),
          students: newUsers.filter(u => u.role === 'ALUMNO'),
        })
      },

      // Loading states
      setUsersLoading: (loading) => set({ usersLoading: loading }),
      setSectionsLoading: (loading) => set({ sectionsLoading: loading }),

      // Error states
      setUsersError: (error) => set({ usersError: error }),
      setSectionsError: (error) => set({ sectionsError: error }),

      clearErrors: () => set({
        usersError: null,
        sectionsError: null,
      }),

      reset: () => set({
        users: [],
        professors: [],
        students: [],
        usersLoading: false,
        sectionsLoading: false,
        usersError: null,
        sectionsError: null,
      }),
    }),
    {
      name: 'director-storage',
      partialize: (state) => ({
        users: state.users,
        professors: state.professors,
        students: state.students,
      }),
    }
  )
)
