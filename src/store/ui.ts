import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
}

// Helper function to check if we're on mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: !isMobile(), // Open on desktop, closed on mobile by default
      theme: 'light',

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        // Only persist theme, not sidebar state (it should be responsive)
        theme: state.theme,
      }),
    }
  )
)
